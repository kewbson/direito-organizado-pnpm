import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  getAllVadeMecumDocuments, 
  addVadeMecumDocument 
} from '../../services/vadeMecumService'
import { addSampleDataToFirebase } from '../../data/sampleVadeMecumData'
import { runFullDiagnostic } from '../../utils/firebaseDebug'

const VadeMecumDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    loading: false,
    documents: [],
    error: null,
    lastAction: null,
    diagnostic: null
  })

  const updateDebugInfo = (updates) => {
    setDebugInfo(prev => ({ ...prev, ...updates }))
  }

  const testConnection = async () => {
    updateDebugInfo({ loading: true, error: null, lastAction: 'Testando conexão...' })
    
    try {
      const result = await getAllVadeMecumDocuments()
      updateDebugInfo({
        loading: false,
        documents: result.documents || [],
        error: result.success ? null : result.error,
        lastAction: `Conexão testada - ${result.success ? 'Sucesso' : 'Erro'}: ${result.documents?.length || 0} documentos encontrados`
      })
    } catch (error) {
      updateDebugInfo({
        loading: false,
        error: error.message,
        lastAction: 'Erro na conexão'
      })
    }
  }

  const runDiagnostic = async () => {
    updateDebugInfo({ loading: true, error: null, lastAction: 'Executando diagnóstico completo...' })
    
    try {
      const diagnostic = await runFullDiagnostic()
      updateDebugInfo({
        loading: false,
        diagnostic: diagnostic,
        lastAction: 'Diagnóstico completo executado'
      })
    } catch (error) {
      updateDebugInfo({
        loading: false,
        error: error.message,
        lastAction: 'Erro no diagnóstico'
      })
    }
  }

  const addSampleData = async () => {
    updateDebugInfo({ loading: true, error: null, lastAction: 'Adicionando dados de exemplo...' })
    
    try {
      const result = await addSampleDataToFirebase()
      updateDebugInfo({
        loading: false,
        error: result.success ? null : result.error,
        lastAction: `Dados adicionados - ${result.success ? `${result.count} documentos` : 'Erro'}`
      })
      
      // Recarregar documentos após adicionar
      if (result.success) {
        await testConnection()
      }
    } catch (error) {
      updateDebugInfo({
        loading: false,
        error: error.message,
        lastAction: 'Erro ao adicionar dados'
      })
    }
  }

  const addSingleECA = async () => {
    updateDebugInfo({ loading: true, error: null, lastAction: 'Adicionando ECA...' })
    
    const ecaDocument = {
      titulo: "Estatuto da Criança e do Adolescente - Art. 1º",
      tipo: "lei",
      conteudo: "Art. 1º Esta Lei dispõe sobre a proteção integral à criança e ao adolescente.",
      referencia: "Art. 1º do ECA (Lei nº 8.069/1990)",
      palavrasChave: ["criança", "adolescente", "proteção integral", "estatuto", "ECA"],
      dataCriacao: new Date(),
      dataAtualizacao: new Date()
    }
    
    try {
      const result = await addVadeMecumDocument(ecaDocument)
      updateDebugInfo({
        loading: false,
        error: result.success ? null : result.error,
        lastAction: `ECA adicionado - ${result.success ? 'Sucesso' : 'Erro'}`
      })
      
      // Recarregar documentos após adicionar
      if (result.success) {
        await testConnection()
      }
    } catch (error) {
      updateDebugInfo({
        loading: false,
        error: error.message,
        lastAction: 'Erro ao adicionar ECA'
      })
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug do Vade Mecum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testConnection} 
              disabled={debugInfo.loading}
              variant="outline"
            >
              {debugInfo.loading ? 'Testando...' : 'Testar Conexão'}
            </Button>
            
            <Button 
              onClick={runDiagnostic} 
              disabled={debugInfo.loading}
              variant="secondary"
            >
              {debugInfo.loading ? 'Diagnosticando...' : 'Diagnóstico Completo'}
            </Button>
            
            <Button 
              onClick={addSampleData} 
              disabled={debugInfo.loading}
              variant="default"
            >
              {debugInfo.loading ? 'Adicionando...' : 'Adicionar Dados de Exemplo'}
            </Button>
            
            <Button 
              onClick={addSingleECA} 
              disabled={debugInfo.loading}
              variant="default"
            >
              {debugInfo.loading ? 'Adicionando...' : 'Adicionar ECA'}
            </Button>
          </div>

          {debugInfo.lastAction && (
            <Alert>
              <AlertDescription>
                <strong>Última ação:</strong> {debugInfo.lastAction}
              </AlertDescription>
            </Alert>
          )}

          {debugInfo.error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Erro:</strong> {debugInfo.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Resultados do diagnóstico */}
          {debugInfo.diagnostic && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Resultados do Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conexão */}
                <div>
                  <h4 className="font-medium mb-2">🔗 Conexão Firebase</h4>
                  <Badge variant={debugInfo.diagnostic.connection?.success ? "default" : "destructive"}>
                    {debugInfo.diagnostic.connection?.success ? "✅ Conectado" : "❌ Erro"}
                  </Badge>
                  {debugInfo.diagnostic.connection?.error && (
                    <p className="text-sm text-red-600 mt-1">{debugInfo.diagnostic.connection.error}</p>
                  )}
                </div>

                {/* Regras */}
                {debugInfo.diagnostic.rules && (
                  <div>
                    <h4 className="font-medium mb-2">🔒 Regras de Segurança</h4>
                    <Badge variant={debugInfo.diagnostic.rules.success ? "default" : "destructive"}>
                      {debugInfo.diagnostic.rules.success ? "✅ Permissões OK" : "❌ Sem Permissão"}
                    </Badge>
                    {debugInfo.diagnostic.rules.error && (
                      <p className="text-sm text-red-600 mt-1">{debugInfo.diagnostic.rules.error}</p>
                    )}
                  </div>
                )}

                {/* Validação */}
                {debugInfo.diagnostic.validation && (
                  <div>
                    <h4 className="font-medium mb-2">🔍 Validação de Dados</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600">✅ Válidos: {debugInfo.diagnostic.validation.validation?.validDocuments || 0}</span>
                      </div>
                      <div>
                        <span className="text-red-600">❌ Inválidos: {debugInfo.diagnostic.validation.validation?.invalidDocuments || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Documentos encontrados: {debugInfo.documents.length}</h4>
            
            {debugInfo.documents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {debugInfo.documents.map((doc, index) => (
                  <div key={doc.id || index} className="p-2 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{doc.titulo}</span>
                      <Badge variant="secondary">{doc.tipo}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{doc.referencia}</p>
                    {doc.palavrasChave && (
                      <p className="text-xs text-blue-600 mt-1">
                        Palavras-chave: {doc.palavrasChave.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Nenhum documento encontrado. Isso pode indicar:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Coleção vazia no Firebase</li>
                    <li>Problemas de permissão</li>
                    <li>Erro na configuração do Firebase</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VadeMecumDebug

