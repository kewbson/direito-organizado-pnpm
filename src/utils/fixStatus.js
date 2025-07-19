// Script para verificar e corrigir status de documentos
import { db } from '../firebase/config.js'
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore'

const VADE_MECUM_COLLECTION = 'vademecum'

// Lista de leis que devem estar como vigente (baseado na verificação do Planalto)
const leisVigentes = [
  'cf', 'cc', 'cp', 'cpp', 'cpc', 'cdc', 'clt', 'ctn', 'eca', 'lgpd',
  'licit', 'maria_penha', 'eoab', 'sus', 'ctb', 'lindb', 'l8112', 'l8213',
  'l8212', 'estidoso', 'falencia', 'arbitragem', 'l9494', 'abuso_autoridade',
  'jecc', 'jef', 'pregao', 'l8745', 'lc123', 'lc150', 'pcd', 'racismo',
  'lai', 'lanticor', 'orgcrim', 'dpvat', 'cheque', 'consorcios', 'l6766',
  'biosseg', 'internet', 'psaude', 'dl200', 'drogas', 'inq', 'lrp',
  'antiterror', 'investcrim', 'duplicatas', 'lpi', 'lep', 'lcp', 'mandseg',
  'acp', 'improb', 'lrf', 'cpm', 'cppm', 'estrangeiro', 'desarm', 'tortura',
  'hediondos', 'pnma', 'crimesamb', 'codflorestal', 'snuc', 'pnsr',
  'saneamento', 'fgts', 'ldb', 'estcidade', 'esttorcedor', 'estindio',
  'estmilitares', 'dirautoral', 'lavagemdin', 'sfn', 'cde', 'sa', 'reurb',
  'loas', 'vale', 'repouso', 'greve', 'terceirizacao', 'software', 'startups',
  'liberdadeecono', 'agro', 'identcivil', 'desburo', 'govdigital', 'kandir',
  'iss', 'cpr', 'confea', 'corretor', 'representante', 'voluntariado',
  'aprendizagem'
]

export const verificarStatusDocumentos = async () => {
  try {
    console.log('🔍 Verificando status dos documentos...')
    
    const querySnapshot = await getDocs(collection(db, VADE_MECUM_COLLECTION))
    const documentosParaCorrigir = []
    const statusReport = {
      vigente: 0,
      revogada: 0,
      undefined: 0,
      outros: 0
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      const docId = docSnap.id.toLowerCase()
      
      // Pula partes de documentos divididos
      if (data.tipo === 'artigos' || data.tipo === 'conteudo') {
        return
      }
      
      // Conta status atual
      const status = data.status || 'undefined'
      if (statusReport[status] !== undefined) {
        statusReport[status]++
      } else {
        statusReport.outros++
      }
      
      // Verifica se o documento deveria estar vigente
      const deveSerVigente = leisVigentes.some(lei => 
        docId.includes(lei) || 
        docId.startsWith(lei) || 
        (data.alias && data.alias.toLowerCase().includes(lei)) ||
        (data.nome && data.nome.toLowerCase().includes(lei))
      )
      
      if (deveSerVigente && data.status !== 'vigente') {
        documentosParaCorrigir.push({
          id: docSnap.id,
          statusAtual: data.status || 'undefined',
          nome: data.nome || data.titulo || data.alias || docSnap.id,
          alias: data.alias
        })
      }
      
      // Log de alguns exemplos para debug
      if (documentosParaCorrigir.length < 10) {
        console.log(`📄 ${docSnap.id}: ${data.nome || data.titulo} - Status: ${data.status || 'undefined'}`)
      }
    })
    
    console.log('\n📊 Relatório de Status:')
    Object.entries(statusReport).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} documentos`)
    })
    
    console.log(`\n🔧 Documentos que precisam ser corrigidos: ${documentosParaCorrigir.length}`)
    documentosParaCorrigir.forEach(doc => {
      console.log(`   - ${doc.id} (${doc.nome}) - ${doc.statusAtual} → vigente`)
    })
    
    return {
      statusReport,
      documentosParaCorrigir,
      total: querySnapshot.size
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    return { error: error.message }
  }
}

export const corrigirStatusDocumentos = async (documentosParaCorrigir) => {
  try {
    if (!documentosParaCorrigir || documentosParaCorrigir.length === 0) {
      console.log('✅ Nenhum documento para corrigir')
      return { success: true, corrected: 0 }
    }
    
    console.log(`🔧 Corrigindo status de ${documentosParaCorrigir.length} documentos...`)
    
    // Usa batch para atualizar múltiplos documentos
    const batch = writeBatch(db)
    
    documentosParaCorrigir.forEach(docInfo => {
      const docRef = doc(db, VADE_MECUM_COLLECTION, docInfo.id)
      batch.update(docRef, { status: 'vigente' })
    })
    
    await batch.commit()
    
    console.log(`✅ Status corrigido para ${documentosParaCorrigir.length} documentos`)
    return { success: true, corrected: documentosParaCorrigir.length }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir status:', error)
    return { success: false, error: error.message }
  }
}

export const verificarECorrigirStatus = async () => {
  console.log('🚀 Iniciando verificação e correção de status...')
  
  const verificacao = await verificarStatusDocumentos()
  if (verificacao.error) {
    return verificacao
  }
  
  if (verificacao.documentosParaCorrigir.length > 0) {
    const correcao = await corrigirStatusDocumentos(verificacao.documentosParaCorrigir)
    return {
      ...verificacao,
      correcao
    }
  }
  
  return {
    ...verificacao,
    correcao: { success: true, corrected: 0 }
  }
}
