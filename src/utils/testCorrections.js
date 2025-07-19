// 🧹 Script para invalidar cache e testar correções
import { invalidateCache, loadAllDocuments } from '../services/vadeMecumServiceImproved'

export const testCorrections = async () => {
  console.log('🧹 Invalidando cache...')
  invalidateCache()
  
  console.log('📡 Recarregando documentos...')
  const result = await loadAllDocuments()
  
  if (result.success) {
    console.log(`✅ ${result.documents.length} documentos recarregados`)
    
    // Testa alguns documentos
    const sampleDocs = result.documents.slice(0, 3)
    console.log('📋 Testando documentos:')
    
    sampleDocs.forEach(doc => {
      console.log(`\n📄 ${doc.titulo}`)
      console.log(`  - Status: ${doc.status}`)
      console.log(`  - Artigos: ${doc.artigos?.length || 0}`)
      console.log(`  - Conteúdo: ${doc.conteudo ? 'Sim' : 'Não'}`)
      console.log(`  - Conteúdo Estruturado: ${doc.conteudoEstruturado ? 'Sim' : 'Não'}`)
    })
  } else {
    console.error('❌ Erro ao recarregar:', result.error)
  }
  
  return result
}

// Chama automaticamente quando importado
testCorrections()
