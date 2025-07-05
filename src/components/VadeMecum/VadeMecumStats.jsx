import React from 'react'
import { FileText, BarChart3, TrendingUp, Archive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'

const VadeMecumStats = ({ stats, loading }) => {
  const getTypeLabel = (type) => {
    const typeLabels = {
      'constituicao': 'Constituição',
      'lei': 'Leis',
      'decreto': 'Decretos',
      'portaria': 'Portarias',
      'resolucao': 'Resoluções',
      'instrucao_normativa': 'Instruções Normativas',
      'medida_provisoria': 'Medidas Provisórias',
      'emenda_constitucional': 'Emendas Constitucionais',
      'codigo': 'Códigos',
      'sumula': 'Súmulas'
    }
    return typeLabels[type] || type
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'constituicao': 'bg-red-500',
      'lei': 'bg-blue-500',
      'decreto': 'bg-green-500',
      'portaria': 'bg-yellow-500',
      'resolucao': 'bg-purple-500',
      'instrucao_normativa': 'bg-indigo-500',
      'medida_provisoria': 'bg-orange-500',
      'emenda_constitucional': 'bg-pink-500',
      'codigo': 'bg-gray-500',
      'sumula': 'bg-cyan-500'
    }
    return typeColors[type] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Estatísticas não disponíveis
          </h3>
          <p className="text-gray-500">
            Não foi possível carregar as estatísticas do Vade Mecum.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalDocuments = stats.total || 0
  const documentTypes = Object.entries(stats.tipos || {})
    .sort(([,a], [,b]) => b - a) // Ordenar por quantidade (decrescente)

  return (
    <div className="space-y-6">
      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Documentos disponíveis no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Documento</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Categorias diferentes disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Comum</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentTypes.length > 0 ? getTypeLabel(documentTypes[0][0]) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {documentTypes.length > 0 ? `${documentTypes[0][1]} documento(s)` : 'Nenhum documento'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por tipo */}
      {documentTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Tipo de Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentTypes.map(([type, count]) => {
              const percentage = totalDocuments > 0 ? (count / totalDocuments) * 100 : 0
              
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`}></div>
                      <span className="font-medium">{getTypeLabel(type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{count} documento(s)</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Vade Mecum Inteligente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Funcionalidades:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Busca inteligente por conteúdo</li>
                <li>• Filtros por tipo de documento</li>
                <li>• Visualização completa de documentos</li>
                <li>• Organização por palavras-chave</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tipos suportados:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Constituição Federal</li>
                <li>• Leis e Decretos</li>
                <li>• Portarias e Resoluções</li>
                <li>• Códigos e Súmulas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VadeMecumStats

