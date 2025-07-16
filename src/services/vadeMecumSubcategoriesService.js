import { searchVadeMecumImproved } from './vadeMecumServiceImproved'

// Função para obter subcategorias (referências) de um tipo específico
export const getSubcategoriesByType = async (tipo) => {
  try {
    // Busca todos os documentos do tipo especificado
    const result = await searchVadeMecumImproved(null, 1000, null, tipo)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Agrupa documentos por referência
    const subcategoriesMap = new Map()
    
    result.documents.forEach(doc => {
      const titulo = doc.titulo || 'Sem título'
      
      if (subcategoriesMap.has(titulo)) {
        subcategoriesMap.get(titulo).count++
        subcategoriesMap.get(titulo).documents.push(doc)
      } else {
        subcategoriesMap.set(titulo, {
          titulo: titulo,
          referencia: doc.referencia,
          count: 1,
          documents: [doc],
          tipo: tipo
        })
      }
    })

    // Converte Map para array e ordena por contagem (maior para menor)
    const subcategories = Array.from(subcategoriesMap.values())
      .sort((a, b) => b.count - a.count)

    return {
      success: true,
      subcategories: subcategories,
      totalDocuments: result.documents.length
    }
  } catch (error) {
    console.error('Erro ao buscar subcategorias:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter documentos de uma subcategoria específica (tipo + referência)
export const getDocumentsByTypeAndTitle = async (tipo, titulo, pageSize = 20, lastDocument = null) => {
  try {
    const result = await searchVadeMecumImproved(null, 1000, null, tipo)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    // Filtra documentos pelo título
    const filteredDocuments = result.documents.filter(doc => {
      const docTitulo = doc.titulo || 'Sem título'
      return docTitulo === titulo
    })
    let startIndex = 0
    if (lastDocument && lastDocument.id) {
      const lastIndex = filteredDocuments.findIndex(doc => doc.id === lastDocument.id)
      startIndex = lastIndex >= 0 ? lastIndex + 1 : 0
    }
    const endIndex = startIndex + pageSize
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)
    const hasMore = endIndex < filteredDocuments.length
    const lastDoc = paginatedDocuments.length > 0 ? paginatedDocuments[paginatedDocuments.length - 1] : null
    return {
      success: true,
      documents: paginatedDocuments,
      lastDocument: lastDoc,
      hasMore: hasMore,
      totalFound: filteredDocuments.length
    }
  } catch (error) {
    console.error('Erro ao buscar documentos por tipo e título:', error)
    return { success: false, error: error.message }
  }
}
export const getDocumentsByTypeAndReference = async (tipo, referencia, pageSize = 20, lastDocument = null) => {
  try {
    // Busca todos os documentos do tipo especificado
    const result = await searchVadeMecumImproved(null, 1000, null, tipo)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Filtra documentos pela referência
    const filteredDocuments = result.documents.filter(doc => {
      const docReferencia = doc.referencia || 'Sem referência'
      return docReferencia === referencia
    })

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
    console.error('Erro ao buscar documentos por tipo e referência:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar em todas as categorias e subcategorias
export const searchAllDocuments = async (searchTerm, pageSize = 20, lastDocument = null) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { success: true, documents: [], hasMore: false, totalFound: 0 }
    }

    // Usa o serviço melhorado para buscar em todos os documentos
    const result = await searchVadeMecumImproved(searchTerm.trim(), pageSize, lastDocument, null)
    
    return result
  } catch (error) {
    console.error('Erro na busca geral:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter estatísticas de subcategorias
export const getSubcategoryStats = async (tipo) => {
  try {
    const result = await getSubcategoriesByType(tipo)
    
    if (!result.success) {
      return result
    }

    const stats = {
      totalSubcategories: result.subcategories.length,
      totalDocuments: result.totalDocuments,
      subcategoriesWithMostDocuments: result.subcategories.slice(0, 5),
      averageDocumentsPerSubcategory: Math.round(result.totalDocuments / result.subcategories.length)
    }

    return {
      success: true,
      stats: stats
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas de subcategorias:', error)
    return { success: false, error: error.message }
  }
}

