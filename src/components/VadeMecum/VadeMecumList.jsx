import React from 'react'
import { FileText, Calendar, Tag, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const VadeMecumList = ({ documents, onDocumentSelect, loading, selectedDocument }) => {
  const formatDate = (date) => {
    if (!date) return 'Data não disponível'
    
    let dateObj
    if (date.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate()
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date(date)
    }
    
    return dateObj.toLocaleDateString('pt-BR')
  }

  const getTypeLabel = (type) => {
    const typeLabels = {
      'constituicao': 'Constituição',
      'lei': 'Lei',
      'decreto': 'Decreto',
      'portaria': 'Portaria',
      'resolucao': 'Resolução',
      'instrucao_normativa': 'Instrução Normativa',
      'medida_provisoria': 'Medida Provisória',
      'emenda_constitucional': 'Emenda Constitucional',
      'codigo': 'Código',
      'sumula': 'Súmula'
    }
    return typeLabels[type] || type
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'constituicao': 'bg-red-100 text-red-800',
      'lei': 'bg-blue-100 text-blue-800',
      'decreto': 'bg-green-100 text-green-800',
      'portaria': 'bg-yellow-100 text-yellow-800',
      'resolucao': 'bg-purple-100 text-purple-800',
      'instrucao_normativa': 'bg-indigo-100 text-indigo-800',
      'medida_provisoria': 'bg-orange-100 text-orange-800',
      'emenda_constitucional': 'bg-pink-100 text-pink-800',
      'codigo': 'bg-gray-100 text-gray-800',
      'sumula': 'bg-cyan-100 text-cyan-800'
    }
    return typeColors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou termos de busca para encontrar o que procura.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card 
          key={document.id} 
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            selectedDocument?.id === document.id 
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : ''
          }`}
          onClick={() => onDocumentSelect(document)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {document.titulo}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge className={getTypeColor(document.tipo)}>
                    {getTypeLabel(document.tipo)}
                  </Badge>
                  {document.referencia && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="font-medium">{document.referencia}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {document.conteudo && (
              <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                {document.conteudo}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {document.dataCriacao && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Criado em {formatDate(document.dataCriacao)}</span>
                  </div>
                )}
                
                {document.palavrasChave && document.palavrasChave.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>{document.palavrasChave.length} palavra(s)-chave</span>
                  </div>
                )}
              </div>
            </div>
            
            {document.palavrasChave && document.palavrasChave.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {document.palavrasChave.slice(0, 5).map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {document.palavrasChave.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{document.palavrasChave.length - 5} mais
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default VadeMecumList

