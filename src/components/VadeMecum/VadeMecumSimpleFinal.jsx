// 🛠️ VadeMecum Simplificado para Debug
import React, { useState, useEffect } from 'react'
import { testFirebaseConnection } from '../../utils/firebaseTest'
import { searchVadeMecumImproved, invalidateCache } from '../../services/vadeMecumServiceImproved'
import { verificarECorrigirStatus } from '../../utils/fixStatus'
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
  const [fixingStatus, setFixingStatus] = useState(false)
  const [statusFixResult, setStatusFixResult] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

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
    console.log('🧹 Invalidando cache e recarregando...')
    invalidateCache()
    await loadData()
  }

  const handleFixStatus = async () => {
    try {
      setFixingStatus(true)
      setStatusFixResult(null)
      console.log('🔧 Iniciando correção de status...')
      
      const result = await verificarECorrigirStatus()
      setStatusFixResult(result)
      
      if (result.correcao && result.correcao.corrected > 0) {
        console.log(`✅ ${result.correcao.corrected} documentos corrigidos`)
        // Invalida cache e recarrega dados
        invalidateCache()
        await loadData()
      }
    } catch (error) {
      console.error('❌ Erro ao corrigir status:', error)
      setStatusFixResult({ error: error.message })
    } finally {
      setFixingStatus(false)
    }
  }

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
            
            <Button onClick={loadData} className="w-full">
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
        <Button 
          variant="outline"
          onClick={handleRefreshCache}
        >
          🧹 Limpar Cache
        </Button>
        <Button 
          variant="outline"
          onClick={handleFixStatus}
          disabled={fixingStatus}
        >
          {fixingStatus ? '🔧 Corrigindo...' : '🔧 Corrigir Status'}
        </Button>
      </div>

      {statusFixResult && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">
              🔧 Resultado da Correção de Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusFixResult.error ? (
              <div className="text-red-600">❌ Erro: {statusFixResult.error}</div>
            ) : (
              <div className="space-y-2">
                <div className="text-green-600">
                  ✅ Verificação concluída: {statusFixResult.total} documentos analisados
                </div>
                {statusFixResult.correcao && statusFixResult.correcao.corrected > 0 && (
                  <div className="text-blue-600">
                    🔧 Status corrigido em {statusFixResult.correcao.corrected} documentos
                  </div>
                )}
                {statusFixResult.statusReport && (
                  <div className="text-sm text-gray-600">
                    📊 Status atual: Vigente: {statusFixResult.statusReport.vigente}, 
                    Revogada: {statusFixResult.statusReport.revogada}, 
                    Indefinido: {statusFixResult.statusReport.undefined}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                        <Badge 
                          variant={doc.status === 'vigente' ? 'default' : 'destructive'} 
                          className="text-xs"
                        >
                          {doc.status}
                        </Badge>
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
                        {doc.conteudo && (
                          <span>📄 Conteúdo: Sim</span>
                        )}
                        {doc.conteudoEstruturado && (
                          <span>📝 Estruturado: Sim</span>
                        )}
                        {doc.documentoDividido && (
                          <span>🔗 Dividido: {doc.partes?.length || 0} partes</span>
                        )}
                        {doc.totalArtigos && (
                          <span>📊 Total: {doc.totalArtigos}</span>
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
                          🔍 Ver estrutura completa (ID: {doc.id})
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify({
                            titulo: doc.titulo,
                            rawNome: doc.rawData?.nome,
                            rawTitulo: doc.rawData?.titulo,
                            rawAlias: doc.rawData?.alias,
                            tipo: doc.tipo,
                            categoria: doc.categoria,
                            status: doc.status,
                            artigosCount: doc.artigos?.length || 0,
                            rawArtigosCount: Object.keys(doc.rawData?.artigos || {}).length,
                            temConteudo: !!doc.conteudo,
                            temConteudoEstruturado: !!doc.conteudoEstruturado,
                            tagsCount: doc.palavrasChave?.length || 0,
                            primeiroArtigo: doc.artigos?.[0]?.numero || 'N/A'
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
