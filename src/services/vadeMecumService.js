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

// Coleção do Vade Mecum no Firestore
const VADE_MECUM_COLLECTION = 'vademecum'

// Função para buscar todos os documentos do Vade Mecum
export const getAllVadeMecumDocuments = async () => {
  try {
    const q = query(
      collection(db, VADE_MECUM_COLLECTION),
      orderBy('titulo', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const documents = []
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return { success: true, documents }
  } catch (error) {
    console.error('Erro ao buscar documentos do Vade Mecum:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar documentos por tipo
export const getVadeMecumByType = async (tipo) => {
  try {
    const q = query(
      collection(db, VADE_MECUM_COLLECTION),
      where('tipo', '==', tipo),
      orderBy('titulo', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const documents = []
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return { success: true, documents }
  } catch (error) {
    console.error('Erro ao buscar documentos por tipo:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar documentos por palavra-chave
export const searchVadeMecum = async (searchTerm) => {
  try {
    const q = query(
      collection(db, VADE_MECUM_COLLECTION),
      orderBy('titulo', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const documents = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const searchTermLower = searchTerm.toLowerCase()
      
      // Busca no título, conteúdo, referência e palavras-chave
      const matchesTitle = data.titulo?.toLowerCase().includes(searchTermLower)
      const matchesContent = data.conteudo?.toLowerCase().includes(searchTermLower)
      const matchesReference = data.referencia?.toLowerCase().includes(searchTermLower)
      const matchesKeywords = data.palavrasChave?.some(keyword => 
        keyword.toLowerCase().includes(searchTermLower)
      )
      
      if (matchesTitle || matchesContent || matchesReference || matchesKeywords) {
        documents.push({
          id: doc.id,
          ...data
        })
      }
    })
    
    return { success: true, documents }
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar um documento específico por ID
export const getVadeMecumDocument = async (documentId) => {
  try {
    const docRef = doc(db, VADE_MECUM_COLLECTION, documentId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        document: {
          id: docSnap.id,
          ...docSnap.data()
        }
      }
    } else {
      return { success: false, error: 'Documento não encontrado' }
    }
  } catch (error) {
    console.error('Erro ao buscar documento:', error)
    return { success: false, error: error.message }
  }
}

// Função para adicionar um novo documento ao Vade Mecum
export const addVadeMecumDocument = async (documentData) => {
  try {
    const docData = {
      ...documentData,
      dataCriacao: new Date(),
      dataAtualizacao: new Date()
    }
    
    const docRef = await addDoc(collection(db, VADE_MECUM_COLLECTION), docData)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Erro ao adicionar documento:', error)
    return { success: false, error: error.message }
  }
}

// Função para atualizar um documento existente
export const updateVadeMecumDocument = async (documentId, updateData) => {
  try {
    const docRef = doc(db, VADE_MECUM_COLLECTION, documentId)
    const updatedData = {
      ...updateData,
      dataAtualizacao: new Date()
    }
    
    await updateDoc(docRef, updatedData)
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar documento:', error)
    return { success: false, error: error.message }
  }
}

// Função para deletar um documento
export const deleteVadeMecumDocument = async (documentId) => {
  try {
    const docRef = doc(db, VADE_MECUM_COLLECTION, documentId)
    await deleteDoc(docRef)
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar documento:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar documentos com paginação
export const getVadeMecumWithPagination = async (pageSize = 10, lastDocument = null) => {
  try {
    let q = query(
      collection(db, VADE_MECUM_COLLECTION),
      orderBy('titulo', 'asc'),
      limit(pageSize)
    )
    
    if (lastDocument) {
      q = query(
        collection(db, VADE_MECUM_COLLECTION),
        orderBy('titulo', 'asc'),
        startAfter(lastDocument),
        limit(pageSize)
      )
    }
    
    const querySnapshot = await getDocs(q)
    const documents = []
    let lastDoc = null
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      })
      lastDoc = doc
    })
    
    return { 
      success: true, 
      documents, 
      lastDocument: lastDoc,
      hasMore: documents.length === pageSize
    }
  } catch (error) {
    console.error('Erro ao buscar documentos com paginação:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter estatísticas do Vade Mecum
export const getVadeMecumStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, VADE_MECUM_COLLECTION))
    const stats = {
      total: 0,
      tipos: {}
    }
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      stats.total++
      
      if (data.tipo) {
        stats.tipos[data.tipo] = (stats.tipos[data.tipo] || 0) + 1
      }
    })
    
    return { success: true, stats }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return { success: false, error: error.message }
  }
}

