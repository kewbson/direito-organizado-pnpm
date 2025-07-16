import React, { useState } from 'react'
import { FileText, Calendar, Tag, Heart, Copy, X, ExternalLink, BookOpen, Scale, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { toast } from 'sonner'

const VadeMecumListImproved = ({ 
  documents, 
  onDocumentSelect, 
  loading, 
  selectedDocument, 
  viewMode, 
  favorites, 
  onToggleFavorite,
  onCloseModal 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (date) => {
    if (!date) return 'Data não disponível'
    
    let dateObj
    if (date.toDate) {
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
      'constituicao': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'lei': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'decreto': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'portaria': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'resolucao': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'instrucao_normativa': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'medida_provisoria': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'emenda_constitucional': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'codigo': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'sumula': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
    }
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  const getTypeIcon = (type) => {
    const typeIcons = {
      'constituicao': Scale,
      'lei': FileText,
      'decreto': BookOpen,
      'portaria': FileText,
      'resolucao': Gavel,
      'instrucao_normativa': FileText,
      'medida_provisoria': FileText,
      'emenda_constitucional': Scale,
      'codigo': BookOpen,
      'sumula': FileText
    }
    return typeIcons[type] || FileText
  }

  const handleDocumentClick = (document) => {
    onDocumentSelect(document)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    onCloseModal()
  }

  const handleCopyLink = (document) => {
    const link = document.link || document.url || '#'
    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência!')
  }

  const truncateText = (text, maxLength = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
      <Card className="text-center py-12">
        <CardContent>
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros de busca ou explore as categorias populares.
          </p>
        </CardContent>
      </Card>
    )
  }

  const DocumentCard = ({ document }) => {
    const TypeIcon = getTypeIcon(document.tipo)
    const isFavorite = favorites.has(document.id)

    return (
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-orange-200"
        onClick={() => handleDocumentClick(document)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <TypeIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge className={`${getTypeColor(document.tipo)} text-xs mb-1`}>
                  {getTypeLabel(document.tipo)}
                </Badge>
                <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {document.titulo}
                </CardTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(document.id)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {document.ementa && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {truncateText(document.ementa, 120)}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(document.data)}
            </div>
            {document.numero && (
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {document.numero}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const DocumentListItem = ({ document }) => {
    const TypeIcon = getTypeIcon(document.tipo)
    const isFavorite = favorites.has(document.id)

    return (
      <Card 
        className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-orange-200"
        onClick={() => handleDocumentClick(document)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
              <TypeIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getTypeColor(document.tipo)} text-xs`}>
                      {getTypeLabel(document.tipo)}
                    </Badge>
                    {document.numero && (
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {document.numero}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base group-hover:text-orange-600 transition-colors line-clamp-2">
                    {document.titulo}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(document.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </Button>
              </div>
              {document.ementa && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {truncateText(document.ementa, 200)}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.data)}
                </div>
                {document.tags && document.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {document.tags.slice(0, 2).join(', ')}
                    {document.tags.length > 2 && '...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Lista de documentos */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
      }>
        {documents.map((document) => (
          viewMode === 'grid' 
            ? <DocumentCard key={document.id} document={document} />
            : <DocumentListItem key={document.id} document={document} />
        ))}
      </div>

      {/* Modal de visualização do documento */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedDocument && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getTypeColor(selectedDocument.tipo)}`}>
                        {getTypeLabel(selectedDocument.tipo)}
                      </Badge>
                      {selectedDocument.numero && (
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {selectedDocument.numero}
                        </span>
                      )}
                    </div>
                    <DialogTitle className="text-xl font-bold leading-tight">
                      {selectedDocument.titulo}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleFavorite(selectedDocument.id)}
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(selectedDocument.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(selectedDocument)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {/* Metadados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Data:</span>
                      <p className="text-sm">{formatDate(selectedDocument.data)}</p>
                    </div>
                    {selectedDocument.origem && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Origem:</span>
                        <p className="text-sm">{selectedDocument.origem}</p>
                      </div>
                    )}
                    {selectedDocument.situacao && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Situação:</span>
                        <p className="text-sm">{selectedDocument.situacao}</p>
                      </div>
                    )}
                    {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ementa */}
                  {selectedDocument.ementa && (
                    <div>
                      <h4 className="font-semibold mb-2">Ementa</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedDocument.ementa}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Conteúdo */}
                  {selectedDocument.conteudo && (
                    <div>
                      <h4 className="font-semibold mb-2">Conteúdo</h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div 
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: selectedDocument.conteudo }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Link externo */}
                  {selectedDocument.link && (
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedDocument.link, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver documento original
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VadeMecumListImproved

