// 🔥 Teste de Conexão Firebase
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testando conexão com Firebase...')
    console.log('📊 Configuração do DB:', db)
    
    const collectionRef = collection(db, 'vademecum')
    console.log('📂 Referência da coleção:', collectionRef)
    
    const snapshot = await getDocs(collectionRef)
    console.log('📋 Snapshot obtido:', snapshot)
    console.log('📊 Tamanho da coleção:', snapshot.size)
    
    const docs = []
    snapshot.forEach((doc) => {
      console.log('📄 Documento encontrado:', doc.id, doc.data())
      docs.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      count: docs.length,
      documents: docs.slice(0, 3), // Apenas os primeiros 3 para debug
      message: `✅ Conexão OK! ${docs.length} documentos encontrados`
    }
  } catch (error) {
    console.error('❌ Erro na conexão Firebase:', error)
    return {
      success: false,
      error: error.message,
      message: `❌ Erro: ${error.message}`
    }
  }
}

// Teste mais simples para verificar apenas a coleção
export const testVadeMecumCollection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'vademecum'))
    console.log('Documentos na coleção vademecum:', querySnapshot.size)
    
    const documents = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`Documento ${doc.id}:`, {
        titulo: data.titulo,
        tipo: data.tipo,
        categoria: data.categoria,
        hasArtigos: !!data.artigos
      })
      documents.push({ id: doc.id, ...data })
    })
    
    return { success: true, documents, count: documents.length }
  } catch (error) {
    console.error('Erro ao testar coleção:', error)
    return { success: false, error: error.message }
  }
}
