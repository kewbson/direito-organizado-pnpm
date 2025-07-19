import React, { useState } from 'react'
import { FileText, Calendar, Tag, Heart, Copy, X, ExternalLink, BookOpen, Scale, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
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

  // Log para confirmar que a versão atualizada está sendo usada
  console.log('🔄 VadeMecumListImproved ATUALIZADO carregado - versão com melhor formatação visual');
  
  // Log específico quando um documento é selecionado
  if (selectedDocument) {
    console.log('📄 Documento selecionado:', {
      id: selectedDocument.id,
      titulo: selectedDocument.titulo,
      temConteudo: !!selectedDocument.conteudo,
      temArtigos: !!selectedDocument.artigos,
      tipoConteudo: selectedDocument.conteudo ? (selectedDocument.conteudo.includes('<') ? 'HTML' : 'Texto') : 'Sem conteúdo',
      tamanhoConteudo: selectedDocument.conteudo?.length || 0,
      primeiros200chars: selectedDocument.conteudo?.slice(0, 200),
      todosOsCampos: Object.keys(selectedDocument)
    });
  }

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

  const handleCopyLink = async (document) => {
    try {
      // Criar texto formatado com o conteúdo do documento
      let textToCopy = `${document.titulo}\n`
      textToCopy += `${'='.repeat(document.titulo.length)}\n\n`
      
      // Adiciona metadados básicos
      if (document.ano) textToCopy += `Ano: ${document.ano}\n`
      if (document.categoria) textToCopy += `Categoria: ${document.categoria}\n`
      if (document.orgaoResponsavel) textToCopy += `Órgão: ${document.orgaoResponsavel}\n`
      if (document.referencia) textToCopy += `Referência: ${document.referencia}\n`
      if (document.status) textToCopy += `Status: ${document.status}\n`
      textToCopy += '\n'
      
      // Usa a nova estrutura de artigos se disponível
      if (document.artigos && document.artigos.length > 0) {
        textToCopy += 'ARTIGOS\n\n'
        document.artigos.forEach(artigo => {
          textToCopy += `Art. ${artigo.numero} - ${artigo.texto}\n`
          
          // Adiciona incisos se existirem
          if (artigo.incisos && artigo.incisos.length > 0) {
            artigo.incisos.forEach(inciso => {
              textToCopy += `  ${inciso.numero} - ${inciso.texto}\n`
            })
          }
          
          // Adiciona parágrafos se existirem
          if (artigo.paragrafos && artigo.paragrafos.length > 0) {
            artigo.paragrafos.forEach(paragrafo => {
              textToCopy += `  ${paragrafo.numero} - ${paragrafo.texto}\n`
            })
          }
          
          textToCopy += '\n'
        })
      } else if (document.conteudo) {
        // Fallback para estrutura antiga
        textToCopy += 'CONTEÚDO\n\n'
        const cleanContent = document.conteudo.replace(/<[^>]*>/g, '')
        textToCopy += cleanContent + '\n\n'
      }
      
      // Adicionar palavras-chave se existirem
      if (document.palavrasChave && document.palavrasChave.length > 0) {
        textToCopy += `Palavras-chave: ${document.palavrasChave.join(', ')}\n`
      }
      
      // Adicionar fonte se existir
      if (document.fonte) {
        textToCopy += `\nFonte: ${document.fonte}\n`
      }
      
      // Adicionar rodapé
      textToCopy += `\n---\nCopiado do Direito Organizado - ${new Date().toLocaleDateString('pt-BR')}`
      
      await navigator.clipboard.writeText(textToCopy)
      toast.success("Conteúdo copiado para a área de transferência!")
    } catch (error) {
      console.error('Erro ao copiar:', error)
      toast.error("Erro ao copiar conteúdo")
    }
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
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${getTypeColor(document.tipo)} text-xs`}>
                    {getTypeLabel(document.tipo)}
                  </Badge>
                  {document.ano && (
                    <Badge variant="outline" className="text-xs">
                      {document.ano}
                    </Badge>
                  )}
                  {document.status && document.status !== 'vigente' && (
                    <Badge variant="destructive" className="text-xs">
                      {document.status}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {document.titulo}
                </CardTitle>
                {document.referencia && document.referencia !== document.titulo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {document.referencia}
                  </p>
                )}
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
          {/* Mostrar informações adicionais da nova estrutura */}
          {(document.area || document.jurisdicao || document.orgaoResponsavel) && (
            <div className="mb-3 space-y-1">
              {document.area && (
                <p className="text-xs text-muted-foreground">📋 {document.area}</p>
              )}
              {document.jurisdicao && (
                <p className="text-xs text-muted-foreground">🏛️ {document.jurisdicao}</p>
              )}
              {document.orgaoResponsavel && (
                <p className="text-xs text-muted-foreground">🏢 {document.orgaoResponsavel}</p>
              )}
            </div>
          )}
          
          {/* Mostrar número de artigos se disponível */}
          {document.artigos && document.artigos.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Badge variant="secondary" className="text-xs">
                {document.artigos.length} artigo{document.artigos.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
          
          {/* Palavras-chave */}
          {document.palavrasChave && document.palavrasChave.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {document.palavrasChave.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {document.palavrasChave.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{document.palavrasChave.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {document.dataPublicacao ? formatDate(document.dataPublicacao) : 'Data não disponível'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyLink(document)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
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
              {/* Mostrar referência se disponível */}
              {document.referencia && (
                <p className="text-xs text-muted-foreground mb-2 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                  {document.referencia}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.data)}
                </div>
                {document.artigos && document.artigos.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {document.artigos.length} artigo{document.artigos.length !== 1 ? 's' : ''}
                  </div>
                )}
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
        <DialogContent className="w-[95vw] max-w-[1200px] md:w-[70vw] max-h-[90vh] flex flex-col">
          {selectedDocument && (
            <>
              <DialogHeader className="pb-4 flex-shrink-0">
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
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      Visualização completa do documento legal
                    </DialogDescription>
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

              <div className="flex-1 overflow-y-auto pr-4 max-h-[calc(90vh-120px)]">
                <div className="space-y-4 pb-4">
                  {/* Metadados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Data:</span>
                      <p className="text-sm">{formatDate(selectedDocument.data)}</p>
                    </div>
                    {selectedDocument.referencia && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Referência:</span>
                        <p className="text-sm font-mono">{selectedDocument.referencia}</p>
                      </div>
                    )}
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
                    {selectedDocument.artigos && selectedDocument.artigos.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Artigos:</span>
                        <p className="text-sm">{selectedDocument.artigos.length} artigo{selectedDocument.artigos.length !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                    {selectedDocument.palavrasChave && selectedDocument.palavrasChave.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-muted-foreground">Palavras-chave:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.palavrasChave.map((palavra, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {palavra}
                            </Badge>
                          ))}
                        </div>
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
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                        📝 Ementa
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed text-justify italic">
                        {selectedDocument.ementa}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Conteúdo */}
                  {selectedDocument.conteudo && (
                    <div>
                      <h4 className="font-semibold mb-4 text-lg">📄 Conteúdo</h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {/* Versão melhorada com formatação visual */}
                        {selectedDocument.conteudo.includes('<') ? (
                          // Se contém HTML, usa dangerouslySetInnerHTML
                          <div 
                            className="text-sm leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: selectedDocument.conteudo }}
                          />
                        ) : (
                          // Se é texto puro, aplica formatação melhorada
                          <div className="space-y-4">
                            {selectedDocument.conteudo.split('\n\n').map((paragraph, index) => {
                              const text = paragraph.trim()
                              if (!text) return null
                              
                              // Detecta se é um artigo (começa com "Art." ou "Artigo")
                              const isArticle = /^(Art\.|Artigo)\s*\d+/i.test(text)
                              
                              // Detecta se é uma seção ou capítulo
                              const isSection = /^(Seção|Capítulo|Título|Parte)\s+[IVX\d]+/i.test(text)
                              
                              if (isArticle) {
                                return (
                                  <div key={index} className="p-4 my-4 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/50 shadow-sm">
                                    <div className="text-foreground leading-relaxed text-justify font-medium">
                                      {text}
                                    </div>
                                  </div>
                                )
                              } else if (isSection) {
                                return (
                                  <div key={index} className="p-3 my-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r">
                                    <h4 className="font-semibold text-base text-blue-700 dark:text-blue-300">
                                      {text}
                                    </h4>
                                  </div>
                                )
                              } else {
                                return (
                                  <div key={index} className="my-2 text-muted-foreground leading-relaxed text-justify">
                                    {text}
                                  </div>
                                )
                              }
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Artigos - Nova seção para mostrar os artigos do documento */}
                  {selectedDocument.artigos && selectedDocument.artigos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                        📋 Artigos 
                        <Badge variant="secondary" className="text-xs">
                          {selectedDocument.artigos.length} artigo{selectedDocument.artigos.length !== 1 ? 's' : ''}
                        </Badge>
                      </h4>
                      <div className="space-y-6">
                        {selectedDocument.artigos.map((artigo, index) => (
                          <div key={index} className="p-6 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-md">
                                {artigo.numero}
                              </span>
                              <h5 className="font-semibold text-xl text-foreground">Artigo {artigo.numero}</h5>
                            </div>
                            
                            {/* Título/resumo do artigo se disponível */}
                            {artigo.titulo && artigo.titulo !== artigo.texto && (
                              <p className="text-sm text-emerald-600 mb-3 italic font-medium bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
                                {artigo.titulo}
                              </p>
                            )}
                            
                            {/* Texto principal do artigo */}
                            <div className="prose prose-base dark:prose-invert max-w-none">
                              <p className="text-foreground leading-relaxed text-justify">
                                {artigo.texto}
                              </p>
                            </div>
                            
                            {/* Incisos se existirem */}
                            {artigo.incisos && artigo.incisos.length > 0 && (
                              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                  📝 Incisos:
                                </h6>
                                <ul className="list-none space-y-3">
                                  {artigo.incisos.map((inciso, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                      <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                                        {inciso.numero}
                                      </span>
                                      <span className="text-sm text-foreground leading-relaxed">{inciso.texto}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Parágrafos se existirem */}
                            {artigo.paragrafos && artigo.paragrafos.length > 0 && (
                              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h6 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                                  📄 Parágrafos:
                                </h6>
                                <div className="space-y-4">
                                  {artigo.paragrafos.map((paragrafo, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2 bg-white dark:bg-gray-800/30 rounded-r">
                                      <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                                        {paragrafo.numero}
                                      </span>
                                      <p className="text-sm text-foreground leading-relaxed">{paragrafo.texto}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensagem quando não há conteúdo */}
                  {!selectedDocument.conteudo && (!selectedDocument.artigos || selectedDocument.artigos.length === 0) && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Conteúdo não disponível para este documento.
                      </p>
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VadeMecumListImproved

