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
export const loadAllDocuments = async () => {
  try {
    // Verifica se o cache ainda é válido
    if (documentsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return { success: true, documents: documentsCache }
    }

    console.log('Carregando documentos do Firestore...')
    const querySnapshot = await getDocs(collection(db, VADE_MECUM_COLLECTION))
    const documents = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Debug: Log dos primeiros documentos para verificar estrutura
      if (documents.length < 3) {
        console.log(`Debug documento ${doc.id}:`, {
          nome: data.nome,
          titulo: data.titulo,
          alias: data.alias,
          categoria: data.categoria,
          status: data.status,
          tipo: data.tipo,
          lei_principal: data.lei_principal,
          temArtigos: !!data.artigos,
          quantidadeArtigos: data.artigos ? Object.keys(data.artigos).length : 0
        })
      }
      
      // FILTRO: Exclui partes de documentos divididos, mostra apenas principais
      if (data.tipo === 'artigos' || data.tipo === 'conteudo') {
        console.log(`Ignorando parte: ${doc.id} (tipo: ${data.tipo})`)
        return // Pula partes de documentos divididos
      }
      
      // Mapeia a nova estrutura de dados JSON para compatibilidade com o sistema
      const processedDoc = {
        id: doc.id,
        firestoreDoc: doc,
        
        // ===== CAMPOS PRINCIPAIS MAPEADOS =====
        // CORRIGIDO: Priorizar 'nome' (legível) sobre 'titulo' (código técnico)
        titulo: data.nome || data.alias || data.titulo || doc.id,
        tipo: data.categoria || data.tipo || 'lei',
        referencia: data.alias || data.nome || data.titulo || doc.id,
        
        // ===== METADADOS =====
        ano: data.ano,
        dataPublicacao: data.dataPublicacao,
        // CORRIGIDO: Manter status original do Firebase
        status: data.status || 'vigente',
        orgaoResponsavel: data.orgaoResponsavel,
        area: data.area,
        categoria: data.categoria,
        jurisdicao: data.jurisdicao,
        fonte: data.fonte || data.url,
        prioridade: data.prioridade || 50,
        
        // ===== CONTEÚDO ESTRUTURADO =====
        // CORRIGIDO: Processa artigos da nova estrutura JSON melhorada
        artigos: data.artigos ? Object.values(data.artigos).map(artigo => ({
          numero: artigo.numero,
          titulo: artigo.titulo || (artigo.texto ? artigo.texto.substring(0, 100) + '...' : 'Sem título'),
          texto: artigo.texto || '',
          incisos: artigo.incisos || [],
          paragrafos: artigo.paragrafos || [],
          anchor: artigo.anchor || `#art-${artigo.numero}`
        })) : [],
        
        // CORRIGIDO: Para documentos principais divididos, busca partes automaticamente
        conteudo: data.conteudo || data.texto || 
          (data.tipo === 'principal' ? 'Documento dividido - conteúdo nas partes' : '') ||
          (data.artigos && Object.keys(data.artigos).length > 0 ? 'Conteúdo estruturado disponível' : ''),
        
        // CORRIGIDO: Adiciona conteúdo estruturado para visualização
        conteudoEstruturado: data.artigos ? 
          Object.values(data.artigos)
            .filter(artigo => artigo.texto && artigo.texto.trim())
            .map(artigo => `Art. ${artigo.numero}: ${artigo.texto}`)
            .join('\n\n') : 
          (data.conteudo || data.texto || ''),
            
        // ===== METADADOS DE DOCUMENTOS DIVIDIDOS =====
        documentoDividido: data.tipo === 'principal',
        partes: data.partes || [],
        totalArtigos: data.totalArtigos || (data.artigos ? Object.keys(data.artigos).length : 0),
        
        // ===== ÍNDICES E NAVEGAÇÃO =====
        indice: data.indice || [],
        
        // ===== PALAVRAS-CHAVE E TAGS =====
        palavrasChave: data.tags || data.palavrasChave || [],
        
        // ===== METADADOS DE SCRAPING =====
        scraping: data.scraping,
        
        // ===== DADOS ORIGINAIS PARA ACESSO AVANÇADO =====
        rawData: data
      }
      
      documents.push(processedDoc)
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
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.tipo === filterType || doc.categoria === filterType
      )
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

// Função para buscar documento completo (reconstitui divididos)
export const getDocumentoCompleto = async (documentId) => {
  try {
    // 1. Buscar documento principal
    const docRef = doc(db, VADE_MECUM_COLLECTION, documentId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return { success: false, error: 'Documento não encontrado' }
    }
    
    const data = docSnap.data()
    
    // 2. Se não é documento dividido, retorna direto
    if (data.tipo !== 'principal' || !data.partes || data.partes.length === 0) {
      return { 
        success: true, 
        document: {
          id: docSnap.id,
          ...data,
          titulo: data.nome || data.alias || data.titulo || docSnap.id
        }
      }
    }
    
    // 3. É documento dividido - buscar todas as partes
    console.log(`Reconstituindo documento dividido: ${documentId}`)
    const partesPromises = data.partes.map(partId => 
      getDoc(doc(db, VADE_MECUM_COLLECTION, partId))
    )
    
    const partesSnaps = await Promise.all(partesPromises)
    
    // 4. Processar partes
    let conteudoCompleto = ''
    let artigosCompletos = {}
    
    partesSnaps.forEach(partSnap => {
      if (!partSnap.exists()) return
      
      const partData = partSnap.data()
      
      if (partData.tipo === 'conteudo') {
        conteudoCompleto += partData.conteudo || ''
      } else if (partData.tipo === 'artigos') {
        Object.assign(artigosCompletos, partData.artigos || {})
      }
    })
    
    // 5. Retornar documento reconstituído
    const documentoCompleto = {
      id: docSnap.id,
      ...data,
      titulo: data.nome || data.alias || data.titulo || docSnap.id,
      conteudo: conteudoCompleto,
      artigos: Object.values(artigosCompletos).map(artigo => ({
        numero: artigo.numero,
        titulo: artigo.titulo || (artigo.texto ? artigo.texto.substring(0, 100) + '...' : 'Sem título'),
        texto: artigo.texto || '',
        incisos: artigo.incisos || [],
        paragrafos: artigo.paragrafos || [],
        anchor: artigo.anchor || `#art-${artigo.numero}`
      })),
      conteudoEstruturado: Object.values(artigosCompletos)
        .filter(artigo => artigo.texto && artigo.texto.trim())
        .map(artigo => `Art. ${artigo.numero}: ${artigo.texto}`)
        .join('\n\n'),
      reconstituido: true // Flag indicando que foi reconstituído
    }
    
    return { success: true, document: documentoCompleto }
    
  } catch (error) {
    console.error('Erro ao buscar documento completo:', error)
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

// Função para obter todos os tipos de documento com suas contagens
export const getAllDocumentTypesWithCounts = async () => {
  try {
    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const typeCounts = {}
    loadResult.documents.forEach(doc => {
      const type = doc.tipo || doc.categoria || 'outros'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    const typesArray = Object.keys(typeCounts).map(type => ({
      type: type,
      count: typeCounts[type]
    })).sort((a, b) => b.count - a.count) // Ordena por contagem decrescente

    return {
      success: true,
      types: typesArray,
      totalDocuments: loadResult.documents.length
    }
  } catch (error) {
    console.error('Erro ao obter tipos de documento:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter estatísticas do Vade Mecum
export const getVadeMecumStats = async () => {
  try {
    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    const typeCounts = {}
    const categoryStats = {}
    let totalArticles = 0
    let totalKeywords = 0
    const uniqueKeywords = new Set()

    loadResult.documents.forEach(doc => {
      // Conta por tipo
      const type = doc.tipo || doc.categoria || 'outros'
      typeCounts[type] = (typeCounts[type] || 0) + 1

      // Conta por categoria
      if (doc.categoria) {
        categoryStats[doc.categoria] = (categoryStats[doc.categoria] || 0) + 1
      }

      // Conta artigos
      if (doc.artigos && Array.isArray(doc.artigos)) {
        totalArticles += doc.artigos.length
      }

      // Conta palavras-chave
      if (doc.palavrasChave && Array.isArray(doc.palavrasChave)) {
        totalKeywords += doc.palavrasChave.length
        doc.palavrasChave.forEach(keyword => uniqueKeywords.add(normalizeText(keyword)))
      }
    })

    return {
      success: true,
      stats: {
        totalDocuments: loadResult.documents.length,
        totalArticles,
        totalKeywords,
        uniqueKeywordsCount: uniqueKeywords.size,
        documentsByType: typeCounts,
        documentsByCategory: categoryStats,
        cacheInfo: {
          isCacheActive: !!documentsCache,
          cacheTimestamp: new Date(cacheTimestamp || 0).toLocaleString(),
          cacheDuration: CACHE_DURATION / 1000 / 60 + ' minutos'
        }
      }
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter contagem total de documentos
export const getVadeMecumCount = async () => {
  try {
    const loadResult = await loadAllDocuments()
    if (!loadResult.success) {
      return loadResult
    }

    return {
      success: true,
      count: loadResult.documents.length
    }
  } catch (error) {
    console.error('Erro ao obter contagem:', error)
    return { success: false, error: error.message }
  }
}

// Exporta as outras funções originais sem modificação
export {
  getVadeMecumDocument,
  addVadeMecumDocument,
  updateVadeMecumDocument,
  deleteVadeMecumDocument
} from './vadeMecumService'

