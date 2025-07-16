import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BookOpen, Search, Heart, Clock, Filter, Grid, List, ChevronDown, Star, Bookmark, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useIsMobile } from '../../hooks/use-mobile'
import VadeMecumListImproved from './VadeMecumListImproved'
import VadeMecumStats from './VadeMecumStats'
import {
  getVadeMecumWithPagination,
  searchVadeMecum,
  getVadeMecumByType,
  getVadeMecumStats,
  getVadeMecumCount,
  getAllDocumentTypesWithCounts
} from '../../services/vadeMecumService'

const VadeMecumImproved = () => {
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [activeTab, setActiveTab] = useState("browse")
  
  // Estados simplificados
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [favorites, setFavorites] = useState(new Set())
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [documentTypes, setDocumentTypes] = useState([])
  
  // Estados para paginação simplificada
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const documentsPerPage = 12
  
  const isMobile = useIsMobile()

  // Restaurar dados do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('vademecum-favorites')
    const savedRecentlyViewed = localStorage.getItem('vademecum-recent')
    const savedViewMode = localStorage.getItem('vademecum-view-mode')

    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      } catch (error) {
        console.error('Erro ao restaurar favoritos:', error)
      }
    }

    if (savedRecentlyViewed) {
      try {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed))
      } catch (error) {
        console.error('Erro ao restaurar histórico:', error)
      }
    }

    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Carregar dados em paralelo para melhor performance
      const [documentsResult, statsResult, countResult, typesResult] = await Promise.all([
        getVadeMecumWithPagination(documentsPerPage),
        getVadeMecumStats(),
        getVadeMecumCount(),
        getAllDocumentTypesWithCounts()
      ])

      if (documentsResult.success) {
        setDocuments(documentsResult.documents)
        setHasMore(documentsResult.hasMore)
      }

      if (statsResult.success) {
        setStats(statsResult.stats)
      }

      if (countResult.success) {
        setTotalCount(countResult.count)
      }

      if (typesResult.success) {
        setDocumentTypes(typesResult.types)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() && selectedType === 'all') {
      loadInitialData()
      return
    }

    setSearchLoading(true)
    setCurrentPage(1)
    
    try {
      let result
      if (searchTerm.trim()) {
        result = await searchVadeMecum(searchTerm, documentsPerPage)
      } else if (selectedType !== 'all') {
        result = await getVadeMecumByType(selectedType, documentsPerPage)
      }
      
      if (result && result.success) {
        setDocuments(result.documents)
        setHasMore(result.hasMore)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [searchTerm, selectedType, documentsPerPage])

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
    
    // Adicionar ao histórico
    const newRecentlyViewed = [
      document,
      ...recentlyViewed.filter(doc => doc.id !== document.id)
    ].slice(0, 10)
    
    setRecentlyViewed(newRecentlyViewed)
    localStorage.setItem('vademecum-recent', JSON.stringify(newRecentlyViewed))
  }

  const toggleFavorite = (documentId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(documentId)) {
      newFavorites.delete(documentId)
    } else {
      newFavorites.add(documentId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('vademecum-favorites', JSON.stringify([...newFavorites]))
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem('vademecum-view-mode', mode)
  }

  // Filtrar documentos para favoritos
  const getFilteredDocuments = () => {
    if (showFavoritesOnly) {
      return documents.filter(doc => favorites.has(doc.id))
    }
    return documents
  }

  const filteredDocuments = getFilteredDocuments()

  const getTypeLabel = (type) => {
    const typeLabels = {
      'all': 'Todos os tipos',
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

  const getTypeIcon = (type) => {
    const typeIcons = {
      'constituicao': '⚖️',
      'lei': '📜',
      'decreto': '📋',
      'portaria': '📄',
      'resolucao': '🔧',
      'instrucao_normativa': '📝',
      'medida_provisoria': '⚡',
      'emenda_constitucional': '🏛️',
      'codigo': '📚',
      'sumula': '💡'
    }
    return typeIcons[type] || '📄'
  }

  // Componente de busca simplificado com useMemo para evitar re-renders
  const SearchSection = useMemo(() => (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de busca principal */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar leis, decretos, portarias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-11"
            />
          </div>
          
          {/* Filtro de tipo */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48 h-11">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📄 Todos os tipos</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type.type} value={type.type}>
                  {getTypeIcon(type.type)} {getTypeLabel(type.type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Botão de busca */}
          <Button 
            onClick={handleSearch} 
            disabled={searchLoading}
            className="h-11 px-6"
          >
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  ), [searchTerm, selectedType, searchLoading, documentTypes, handleSearch])

  // Componente de ações rápidas
  const QuickActions = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Ações principais */}
      <div className="flex items-center gap-2">
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="flex items-center gap-2"
        >
          <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favoritos
          {favorites.size > 0 && (
            <Badge variant="secondary" className="ml-1">
              {favorites.size}
            </Badge>
          )}
        </Button>

        {recentlyViewed.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recentes
                <Badge variant="secondary" className="ml-1">
                  {recentlyViewed.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {recentlyViewed.slice(0, 5).map((doc) => (
                <DropdownMenuItem
                  key={doc.id}
                  onClick={() => handleDocumentSelect(doc)}
                  className="flex flex-col items-start p-3"
                >
                  <span className="font-medium text-sm">{doc.titulo}</span>
                  <span className="text-xs text-muted-foreground">{getTypeLabel(doc.tipo)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Controles de visualização */}
      {!isMobile && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Visualização:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="rounded-r-none h-8"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="rounded-l-none h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  // Componente de categorias populares
  const PopularCategories = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-orange-500" />
        Categorias Populares
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {documentTypes.slice(0, 6).map((type) => (
          <Card
            key={type.type}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-2 hover:border-orange-200"
            onClick={() => {
              setSelectedType(type.type)
              handleSearch()
            }}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{getTypeIcon(type.type)}</div>
              <div className="text-xs font-medium">{getTypeLabel(type.type)}</div>
              <div className="text-xs text-muted-foreground">{type.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header simplificado e mais limpo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Vade Mecum
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 && `${totalCount.toLocaleString()} documentos disponíveis`}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Acesse rapidamente leis, decretos e outros documentos legais com busca inteligente e organização intuitiva.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-center">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Navegar
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="browse" className="space-y-6">
          {/* Busca simplificada */}
          {SearchSection}

          {/* Mostrar categorias populares apenas quando não há busca ativa */}
          {!searchTerm && selectedType === 'all' && !showFavoritesOnly && (
            <PopularCategories />
          )}

          {/* Ações rápidas */}
          <QuickActions />

          {/* Contador de resultados mais limpo */}
          {filteredDocuments.length > 0 && (
            <div className="flex items-center justify-between text-sm border-b pb-3">
              <div className="text-muted-foreground">
                <span className="font-medium">{filteredDocuments.length}</span> documento(s) encontrado(s)
                {showFavoritesOnly && (
                  <Badge variant="outline" className="ml-2">
                    Favoritos
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline" className="ml-2">
                    "{searchTerm}"
                  </Badge>
                )}
                {selectedType !== 'all' && (
                  <Badge variant="outline" className="ml-2">
                    {getTypeLabel(selectedType)}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Lista de documentos melhorada */}
          <VadeMecumListImproved
            documents={filteredDocuments}
            onDocumentSelect={handleDocumentSelect}
            loading={loading}
            selectedDocument={selectedDocument}
            viewMode={viewMode}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onCloseModal={() => setSelectedDocument(null)}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <VadeMecumStats stats={stats} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default VadeMecumImproved

