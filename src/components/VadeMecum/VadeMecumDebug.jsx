// 🔍 DEBUG: Teste simples do Vade Mecum
import React, { useState, useEffect } from 'react'
import { loadAllDocuments } from '../services/vadeMecumServiceImproved'

const VadeMecumDebug = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const testLoad = async () => {
      try {
        console.log('🚀 Testando carregamento de documentos...')
        const result = await loadAllDocuments()
        console.log('📊 Resultado:', result)
        
        if (result.success) {
          setDocuments(result.documents)
          console.log(`✅ ${result.documents.length} documentos carregados`)
        } else {
          setError(result.error)
          console.error('❌ Erro no carregamento:', result.error)
        }
      } catch (err) {
        console.error('💥 Erro na função de teste:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testLoad()
  }, [])

  if (loading) {
    return <div className="p-4">🔄 Carregando documentos...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3>❌ Erro no Vade Mecum:</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔍 Debug do Vade Mecum</h2>
      <p className="mb-4">✅ {documents.length} documentos encontrados</p>
      
      {documents.slice(0, 3).map((doc, index) => (
        <div key={doc.id} className="mb-4 p-3 border rounded bg-gray-50">
          <h3 className="font-semibold">{doc.titulo}</h3>
          <p className="text-sm text-gray-600">Tipo: {doc.tipo}</p>
          <p className="text-sm text-gray-600">ID: {doc.id}</p>
          {doc.artigos && (
            <p className="text-sm text-gray-600">Artigos: {doc.artigos.length}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default VadeMecumDebug
