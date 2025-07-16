import { db } from '../firebase/config'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

// Função para testar a conexão com o Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testando conexão com Firebase...')
    
    // Tentar acessar uma coleção simples
    const testCollection = collection(db, 'vademecum')
    const snapshot = await getDocs(testCollection)
    
    console.log('✅ Conexão com Firebase estabelecida')
    console.log(`📊 Documentos encontrados na coleção 'vademecum': ${snapshot.size}`)
    
    // Listar todos os documentos
    const documents = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      documents.push({
        id: doc.id,
        titulo: data.titulo,
        tipo: data.tipo,
        referencia: data.referencia
      })
      console.log(`📄 Documento: ${data.titulo} (${data.tipo})`)
    })
    
    return {
      success: true,
      connectionOk: true,
      documentsCount: snapshot.size,
      documents: documents
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão com Firebase:', error)
    return {
      success: false,
      connectionOk: false,
      error: error.message,
      documents: []
    }
  }
}

// Função para verificar as regras de segurança
export const testFirebaseRules = async () => {
  try {
    console.log('🔒 Testando regras de segurança...')
    
    // Tentar ler a coleção vademecum
    const vademecumCollection = collection(db, 'vademecum')
    await getDocs(vademecumCollection)
    
    console.log('✅ Regras de leitura OK para vademecum')
    
    return {
      success: true,
      readPermission: true
    }
    
  } catch (error) {
    console.error('❌ Erro nas regras de segurança:', error)
    
    if (error.code === 'permission-denied') {
      return {
        success: false,
        readPermission: false,
        error: 'Permissão negada - verifique as regras do Firestore'
      }
    }
    
    return {
      success: false,
      readPermission: false,
      error: error.message
    }
  }
}

// Função para verificar a estrutura dos dados
export const validateDataStructure = async () => {
  try {
    console.log('🔍 Validando estrutura dos dados...')
    
    const vademecumCollection = collection(db, 'vademecum')
    const snapshot = await getDocs(vademecumCollection)
    
    const validationResults = {
      totalDocuments: snapshot.size,
      validDocuments: 0,
      invalidDocuments: 0,
      missingFields: [],
      errors: []
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      const requiredFields = ['titulo', 'tipo', 'conteudo', 'referencia']
      const missingFields = []
      
      requiredFields.forEach(field => {
        if (!data[field]) {
          missingFields.push(field)
        }
      })
      
      if (missingFields.length === 0) {
        validationResults.validDocuments++
        console.log(`✅ Documento válido: ${data.titulo}`)
      } else {
        validationResults.invalidDocuments++
        validationResults.missingFields.push({
          documentId: doc.id,
          titulo: data.titulo || 'Sem título',
          missingFields: missingFields
        })
        console.log(`❌ Documento inválido: ${data.titulo || doc.id} - Campos faltando: ${missingFields.join(', ')}`)
      }
    })
    
    return {
      success: true,
      validation: validationResults
    }
    
  } catch (error) {
    console.error('❌ Erro na validação:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Função completa de diagnóstico
export const runFullDiagnostic = async () => {
  console.log('🚀 Iniciando diagnóstico completo do Firebase...')
  
  const results = {
    timestamp: new Date().toISOString(),
    connection: null,
    rules: null,
    validation: null
  }
  
  // Teste de conexão
  results.connection = await testFirebaseConnection()
  
  // Teste de regras (apenas se a conexão funcionou)
  if (results.connection.success) {
    results.rules = await testFirebaseRules()
  }
  
  // Validação de dados (apenas se as regras estão OK)
  if (results.rules && results.rules.success) {
    results.validation = await validateDataStructure()
  }
  
  console.log('📋 Diagnóstico completo:', results)
  return results
}

