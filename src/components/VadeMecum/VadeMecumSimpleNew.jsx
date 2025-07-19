// 🛠️ VadeMecum Simplificado para Debug
import React, { useState, useEffect } from 'react'
import { testFirebaseConnection } from '../../utils/firebaseTest'
import { searchVadeMecumImproved, invalidateCache } from '../../services/vadeMecumServiceImproved'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import VadeMecumCategoriesDebug from './VadeMecumCategoriesDebug'

const VadeMecumSimple = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])
  const [firebaseTest, setFirebaseTest] = useState(null)
  const [showCategories, setShowCategories] = useState(false)

  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Teste de conexão Firebase
      console.log('🔥 Testando Firebase...')
      const fbTest = await testFirebaseConnection()
      setFirebaseTest(fbTest)
      console.log('Resultado teste Firebase:', fbTest)

      if (!fbTest.success) {
        setError(`Firebase Error: ${fbTest.error}`)
        return
      }

      // 2. Teste de busca melhorada
      console.log('🔍 Testando busca melhorada...')
      const result = await searchVadeMecumImproved(null, 10)
      console.log('Resultado busca:', result)

      if (result.success) {
        setDocuments(result.documents)
        console.log(`✅ ${result.documents.length} documentos carregados`)
      } else {
        setError(`Search Error: ${result.error}`)
      }

    } catch (err) {
      console.error('💥 Erro geral:', err)
      setError(`General Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshCache = async () => {
    console.log('🧹 Invalidando cache...')
    invalidateCache()
    await loadData()
  }    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>🔄 Carregando Vade Mecum...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="m-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">❌ Erro no Vade Mecum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-700 bg-red-50 p-3 rounded">{error}</p>
            
            {firebaseTest && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">🔥 Teste Firebase:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(firebaseTest, null, 2)}
                </pre>
              </div>
            )}
            
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              🔄 Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Botões de navegação */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={!showCategories ? "default" : "outline"}
          onClick={() => setShowCategories(false)}
        >
          📚 Documentos
        </Button>
        <Button 
          variant={showCategories ? "default" : "outline"}
          onClick={() => setShowCategories(true)}
        >
          📁 Categorias
        </Button>
      </div>

      {showCategories ? (
        <VadeMecumCategoriesDebug />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📚 Vade Mecum - Debug
              <Badge variant="outline">{documents.length} docs</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {firebaseTest && (
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-green-700">✅ {firebaseTest.message}</p>
              </div>
            )}

            <div className="grid gap-4">
              {documents.slice(0, 5).map((doc) => (
                <Card key={doc.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{doc.titulo || doc.id}</h3>
                        <Badge variant="secondary" className="text-xs">{doc.tipo || doc.categoria}</Badge>
                        {doc.ano && <Badge variant="outline" className="text-xs">{doc.ano}</Badge>}
                      </div>
                      
                      {doc.referencia && doc.referencia !== (doc.titulo || doc.id) && (
                        <p className="text-xs text-gray-600">📄 {doc.referencia}</p>
                      )}
                      
                      <div className="flex gap-4 text-xs text-blue-600">
                        {doc.artigos && doc.artigos.length > 0 && (
                          <span>📋 {doc.artigos.length} artigos</span>
                        )}
                        {doc.palavrasChave && doc.palavrasChave.length > 0 && (
                          <span>🏷️ {doc.palavrasChave.length} tags</span>
                        )}
                        {doc.rawData && Object.keys(doc.rawData.artigos || {}).length > 0 && (
                          <span>📑 {Object.keys(doc.rawData.artigos).length} artigos raw</span>
                        )}
                      </div>
                      
                      {doc.palavrasChave && doc.palavrasChave.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.palavrasChave.slice(0, 4).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.palavrasChave.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.palavrasChave.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          🔍 Ver estrutura (ID: {doc.id})
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify({
                            titulo: doc.titulo,
                            tipo: doc.tipo,
                            categoria: doc.categoria,
                            artigosCount: doc.artigos?.length || 0,
                            rawArtigosCount: Object.keys(doc.rawData?.artigos || {}).length,
                            temConteudo: !!doc.conteudo,
                            tagsCount: doc.palavrasChave?.length || 0
                          }, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VadeMecumSimple
