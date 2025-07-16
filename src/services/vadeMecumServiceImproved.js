import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '../firebase/config'

const VADE_MECUM_COLLECTION = 'vademecum'

// Cache para armazenar todos os documentos e melhorar performance da busca
let documentsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para normalizar texto para busca (remove acentos, converte para minúsculo)
const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
}

// Função para verificar se um termo está presente em um texto
const containsSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return false
  const normalizedText = normalizeText(text)
  const normalizedSearchTerm = normalizeText(searchTerm)
  return normalizedText.includes(normalizedSearchTerm)
}

// Função para buscar em múltiplos campos de um documento
const searchInDocument = (document, searchTerm) => {
  if (!searchTerm) return true

  const searchTerms = searchTerm.split(' ').filter(term => term.length > 0)
  
  return searchTerms.every(term => {
    // Busca no título
    if (containsSearchTerm(document.titulo, term)) return true
    
    // Busca na referência
    if (containsSearchTerm(document.referencia, term)) return true
    
    // Busca nas palavras-chave
    if (document.palavrasChave && Array.isArray(document.palavrasChave)) {
      if (document.palavrasChave.some(keyword => containsSearchTerm(keyword, term))) return true
    }
    
    // Busca nos artigos (número e texto)
    if (document.artigos && Array.isArray(document.artigos)) {
      if (document.artigos.some(artigo => 
        containsSearchTerm(artigo.numero, term) || containsSearchTerm(artigo.texto, term)
      )) return true
    }
    
    // Busca no conteúdo (para compatibilidade com dados antigos)
    if (containsSearchTerm(document.conteudo, term)) return true
    
    return false
  })
}

// Função para carregar todos os documentos e manter em cache
const loadAllDocuments = async () => {
  try {
    // Verifica se o cache ainda é válido
    if (documentsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return { success: true, documents: documentsCache }
    }

    console.log('Carregando documentos do Firestore...')
    const querySnapshot = await getDocs(collection(db, VADE_MECUM_COLLECTION))
    const documents = []

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        firestoreDoc: doc,
        ...doc.data()
      })
    })

    // Ordena por título para consistência
    documents.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''))

    // Atualiza o cache
    documentsCache = documents
    cacheTimestamp = Date.now()

    console.log(`${documents.length} documentos carregados e armazenados em cache`)
    return { success: true, documents }
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)
    return { success: false, error: error.message }
  }
}

// Função principal de busca melhorada
export const searchVadeMecumImproved = async (searchTerm, pageSize = 15, lastDocument = null, filterType = null) => {
  try {
    // Carrega todos os documentos
    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    let filteredDocuments = loadResult.documents

    // Aplica filtro por tipo se especificado
    if (filterType && filterType !== 'all') {
      filteredDocuments = filteredDocuments.filter(doc => doc.tipo === filterType)
    }

    // Aplica busca por termo se especificado
    if (searchTerm && searchTerm.trim()) {
      filteredDocuments = filteredDocuments.filter(doc => searchInDocument(doc, searchTerm.trim()))
    }

    // Implementa paginação manual
    let startIndex = 0
    if (lastDocument && lastDocument.id) {
      const lastIndex = filteredDocuments.findIndex(doc => doc.id === lastDocument.id)
      startIndex = lastIndex >= 0 ? lastIndex + 1 : 0
    }

    const endIndex = startIndex + pageSize
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)
    const hasMore = endIndex < filteredDocuments.length

    // Prepara o último documento para paginação
    const lastDoc = paginatedDocuments.length > 0 ? paginatedDocuments[paginatedDocuments.length - 1] : null

    return {
      success: true,
      documents: paginatedDocuments,
      lastDocument: lastDoc,
      hasMore: hasMore,
      totalFound: filteredDocuments.length
    }
  } catch (error) {
    console.error('Erro na busca melhorada:', error)
    return { success: false, error: error.message }
  }
}

// Função de busca rápida (sem paginação) para sugestões
export const quickSearchVadeMecum = async (searchTerm, maxResults = 5) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { success: true, documents: [] }
    }

    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const filteredDocuments = loadResult.documents
      .filter(doc => searchInDocument(doc, searchTerm.trim()))
      .slice(0, maxResults)

    return {
      success: true,
      documents: filteredDocuments
    }
  } catch (error) {
    console.error('Erro na busca rápida:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar documentos relacionados (baseado em palavras-chave)
export const getRelatedDocuments = async (document, maxResults = 5) => {
  try {
    if (!document || !document.palavrasChave || !Array.isArray(document.palavrasChave)) {
      return { success: true, documents: [] }
    }

    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const relatedDocuments = loadResult.documents
      .filter(doc => doc.id !== document.id) // Exclui o próprio documento
      .map(doc => {
        let score = 0
        
        // Calcula score baseado em palavras-chave em comum
        if (doc.palavrasChave && Array.isArray(doc.palavrasChave)) {
          document.palavrasChave.forEach(keyword => {
            if (doc.palavrasChave.some(docKeyword => 
              normalizeText(docKeyword) === normalizeText(keyword)
            )) {
              score++
            }
          })
        }
        
        return { ...doc, relevanceScore: score }
      })
      .filter(doc => doc.relevanceScore > 0) // Só documentos com pelo menos 1 palavra-chave em comum
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // Ordena por relevância
      .slice(0, maxResults)

    return {
      success: true,
      documents: relatedDocuments
    }
  } catch (error) {
    console.error('Erro ao buscar documentos relacionados:', error)
    return { success: false, error: error.message }
  }
}

// Função para invalidar cache (útil após adicionar/editar documentos)
export const invalidateCache = () => {
  documentsCache = null
  cacheTimestamp = null
  console.log('Cache de documentos invalidado')
}

// Função para buscar por palavras-chave específicas
export const searchByKeywords = async (keywords, pageSize = 15) => {
  try {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return { success: true, documents: [] }
    }

    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const filteredDocuments = loadResult.documents
      .filter(doc => {
        if (!doc.palavrasChave || !Array.isArray(doc.palavrasChave)) return false
        
        return keywords.some(keyword => 
          doc.palavrasChave.some(docKeyword => 
            normalizeText(docKeyword) === normalizeText(keyword)
          )
        )
      })
      .slice(0, pageSize)

    return {
      success: true,
      documents: filteredDocuments
    }
  } catch (error) {
    console.error('Erro na busca por palavras-chave:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar por artigo específico
export const searchByArticleNumber = async (articleNumber, pageSize = 15) => {
  try {
    if (!articleNumber || articleNumber.trim().length === 0) {
      return { success: true, documents: [] }
    }

    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const filteredDocuments = loadResult.documents
      .filter(doc => {
        if (!doc.artigos || !Array.isArray(doc.artigos)) return false
        
        return doc.artigos.some(artigo => 
          containsSearchTerm(artigo.numero, articleNumber.trim())
        )
      })
      .slice(0, pageSize)

    return {
      success: true,
      documents: filteredDocuments
    }
  } catch (error) {
    console.error('Erro na busca por número de artigo:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter estatísticas de busca
export const getSearchStats = async () => {
  try {
    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const stats = {
      totalDocuments: loadResult.documents.length,
      documentsByType: {},
      totalKeywords: 0,
      totalArticles: 0,
      uniqueKeywords: new Set()
    }

    loadResult.documents.forEach(doc => {
      // Conta por tipo
      if (doc.tipo) {
        stats.documentsByType[doc.tipo] = (stats.documentsByType[doc.tipo] || 0) + 1
      }

      // Conta palavras-chave
      if (doc.palavrasChave && Array.isArray(doc.palavrasChave)) {
        stats.totalKeywords += doc.palavrasChave.length
        doc.palavrasChave.forEach(keyword => stats.uniqueKeywords.add(normalizeText(keyword)))
      }

      // Conta artigos
      if (doc.artigos && Array.isArray(doc.artigos)) {
        stats.totalArticles += doc.artigos.length
      }
    })

    stats.uniqueKeywordsCount = stats.uniqueKeywords.size
    delete stats.uniqueKeywords // Remove o Set para serialização

    return {
      success: true,
      stats
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas de busca:', error)
    return { success: false, error: error.message }
  }
}

// Mantém as funções originais para compatibilidade, mas usando a nova lógica
export const getVadeMecumWithPagination = async (pageSize = 15, lastDocument = null, searchTerm = null, filterType = null) => {
  return await searchVadeMecumImproved(searchTerm, pageSize, lastDocument, filterType)
}

export const searchVadeMecum = async (searchTerm, pageSize = 15, lastDocument = null) => {
  return await searchVadeMecumImproved(searchTerm, pageSize, lastDocument)
}

export const getVadeMecumByType = async (tipo, pageSize = 15, lastDocument = null) => {
  return await searchVadeMecumImproved(null, pageSize, lastDocument, tipo)
}

// Exporta as outras funções originais sem modificação
export {
  getVadeMecumDocument,
  addVadeMecumDocument,
  updateVadeMecumDocument,
  deleteVadeMecumDocument,
  getVadeMecumStats,
  getVadeMecumCount,
  getAllDocumentTypesWithCounts
} from './vadeMecumService'

