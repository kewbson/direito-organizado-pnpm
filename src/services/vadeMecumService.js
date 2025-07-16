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

export const getVadeMecumWithPagination = async (pageSize = 15, lastDocument = null, searchTerm = null, filterType = null) => {
  try {
    let baseQuery = collection(db, VADE_MECUM_COLLECTION)
    let constraints = []

    if (filterType) {
      constraints.push(where('tipo', '==', filterType))
    }

    if (searchTerm) {
      constraints.push(where('titulo', '>=', searchTerm))
      constraints.push(where('titulo', '<=', searchTerm + '\uf8ff'))
    }

    constraints.push(orderBy('titulo', 'asc'))

    if (lastDocument && lastDocument.firestoreDoc) {
      constraints.push(startAfter(lastDocument.firestoreDoc))
    }

    const q = query(baseQuery, ...constraints, limit(pageSize + 1)) 

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

    const hasMore = documents.length > pageSize
    const paginatedDocuments = documents.slice(0, pageSize)

    return {
      success: true,
      documents: paginatedDocuments,
      lastDocument: lastDoc ? { firestoreDoc: lastDoc } : null,
      hasMore: hasMore
    }
  } catch (error) {
    console.error('Erro ao buscar documentos com paginação:', error)
    return { success: false, error: error.message }
  }
}

export const getAllVadeMecumDocuments = async () => {
  try {
    const result = await getVadeMecumWithPagination(500) // Aumentado para carregar mais documentos
    return result
  } catch (error) {
    console.error('Erro ao buscar documentos do Vade Mecum:', error)
    return { success: false, error: error.message }
  }
}

export const getVadeMecumByType = async (tipo, pageSize = 15, lastDocument = null) => {
  try {
    return await getVadeMecumWithPagination(pageSize, lastDocument, null, tipo)
  } catch (error) {
    console.error('Erro ao buscar documentos por tipo:', error)
    return { success: false, error: error.message }
  }
}

export const searchVadeMecum = async (searchTerm, pageSize = 15, lastDocument = null) => {
  try {
    return await getVadeMecumWithPagination(pageSize, lastDocument, searchTerm, null)
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return { success: false, error: error.message }
  }
}

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

export const getVadeMecumCount = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, VADE_MECUM_COLLECTION))
    return { success: true, count: querySnapshot.size }
  } catch (error) {
    console.error('Erro ao obter contagem:', error)
    return { success: false, error: error.message }
  }
}

export const getAllDocumentTypesWithCounts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, VADE_MECUM_COLLECTION))
    const typeCounts = {}

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.tipo) {
        typeCounts[data.tipo] = (typeCounts[data.tipo] || 0) + 1
      }
    })

    const typesArray = Object.keys(typeCounts).map(type => ({
      type: type,
      count: typeCounts[type]
    }))

    return { success: true, types: typesArray }
  } catch (error) {
    console.error('Erro ao obter tipos de documento com contagem:', error)
    return { success: false, error: error.message }
  }
}


