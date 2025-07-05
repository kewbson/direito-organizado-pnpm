import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, BarChart3, Bug, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable'
import { useIsMobile } from '../../hooks/use-mobile'
import VadeMecumSearch from './VadeMecumSearch'
import VadeMecumList from './VadeMecumList'
import VadeMecumViewer from './VadeMecumViewer'
import VadeMecumStats from './VadeMecumStats'
import VadeMecumDebug from './VadeMecumDebug'
import { 
  getAllVadeMecumDocuments, 
  searchVadeMecum, 
  getVadeMecumByType,
  getVadeMecumStats
} from '../../services/vadeMecumService'

const VadeMecum = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState("browse")
  const [showSearch, setShowSearch] = useState(false)
  const [panelSizes, setPanelSizes] = useState([40, 60])
  const isMobile = useIsMobile()

  // Restaurar proporções dos painéis do localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('vademecum-panel-sizes')
    if (savedSizes) {
      try {
        const sizes = JSON.parse(savedSizes)
        if (Array.isArray(sizes) && sizes.length === 2) {
          setPanelSizes(sizes)
        }
      } catch (error) {
        console.error('Erro ao restaurar proporções dos painéis:', error)
      }
    }
  }, [])

  // Carregar todos os documentos na inicialização
  useEffect(() => {
    loadAllDocuments()
    loadStats()
  }, [])

  const loadAllDocuments = async () => {
    setLoading(true)
    try {
      const result = await getAllVadeMecumDocuments()
      if (result.success) {
        setDocuments(result.documents)
        setFilteredDocuments(result.documents)
      } else {
        console.error('Erro ao carregar documentos:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getVadeMecumStats()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents)
      return
    }

    setSearchLoading(true)
    try {
      const result = await searchVadeMecum(searchTerm)
      if (result.success) {
        setFilteredDocuments(result.documents)
      } else {
        console.error('Erro na busca:', result.error)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleFilterByType = async (type) => {
    if (!type) {
      setFilteredDocuments(documents)
      return
    }

    setSearchLoading(true)
    try {
      const result = await getVadeMecumByType(type)
      if (result.success) {
        setFilteredDocuments(result.documents)
      } else {
        console.error('Erro no filtro:', result.error)
      }
    } catch (error) {
      console.error('Erro no filtro:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
  }

  const handleCloseViewer = () => {
    setSelectedDocument(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">Vade Mecum Inteligente</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Acesse rapidamente leis, decretos, portarias e outros documentos legais organizados e pesquisáveis.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Navegar
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>
          </div>

        <TabsContent value="browse" className="space-y-6">
          {/* Search Section */}
          {isMobile ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          ) : null}
          
          {/* Search Component - Always visible on desktop, toggleable on mobile */}
          {(!isMobile || showSearch) && (
            <VadeMecumSearch
              onSearch={handleSearch}
              onFilterByType={handleFilterByType}
              loading={searchLoading}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredDocuments.length > 0 && (
                <span>
                  Mostrando {filteredDocuments.length} documento(s)
                  {filteredDocuments.length !== documents.length && 
                    ` de ${documents.length} total`
                  }
                </span>
              )}
            </div>
          </div>

          {/* Split View Layout */}
          {isMobile ? (
            <div className="space-y-4">
              <div className="h-[300px] border rounded-lg overflow-hidden">
                <div className="h-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
                  <VadeMecumList
                    documents={filteredDocuments}
                    onDocumentSelect={handleDocumentSelect}
                    loading={loading}
                    selectedDocument={selectedDocument}
                  />
                </div>
              </div>
              <div className="h-[400px] border rounded-lg overflow-hidden">
                <div className="h-full overflow-auto p-4 bg-white dark:bg-gray-800">
                  {selectedDocument ? (
                    <VadeMecumViewer
                      document={selectedDocument}
                      onClose={handleCloseViewer}
                      isEmbedded={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Selecione um documento</p>
                        <p className="text-sm">Escolha um documento da lista acima para visualizar seu conteúdo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow border rounded-lg overflow-hidden min-h-[600px]">
              <ResizablePanelGroup 
                direction="horizontal" 
                className="h-full"
                onLayout={(sizes) => {
                  // Salvar as proporções no localStorage para persistir entre sessões
                  localStorage.setItem('vademecum-panel-sizes', JSON.stringify(sizes))
                  setPanelSizes(sizes)
                }}
              >
                <ResizablePanel 
                  defaultSize={panelSizes[0]} 
                  minSize={25} 
                  maxSize={70}
                  className="min-w-0"
                >
                  <div className="h-full overflow-auto p-4 bg-muted/30 custom-scrollbar">
                    <VadeMecumList
                      documents={filteredDocuments}
                      onDocumentSelect={handleDocumentSelect}
                      loading={loading}
                      selectedDocument={selectedDocument}
                    />
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle className="bg-border hover:bg-accent" />
                
                <ResizablePanel 
                  defaultSize={panelSizes[1]} 
                  minSize={30} 
                  maxSize={75}
                  className="min-w-0"
                >
                  <div className="h-full overflow-auto p-4 bg-background custom-scrollbar">
                    {selectedDocument ? (
                      <VadeMecumViewer
                        document={selectedDocument}
                        onClose={handleCloseViewer}
                        isEmbedded={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Selecione um documento</p>
                          <p className="text-sm">Escolha um documento da lista à esquerda para visualizar seu conteúdo</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <VadeMecumStats stats={stats} loading={loading} />
        </TabsContent>


      </Tabs>
    </div>
  )
}

export default VadeMecum

