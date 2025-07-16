import React, { useState, useEffect } from 'react'
import { BookOpen, ArrowLeft, FileText, Scale, Gavel, Scroll, ClipboardList, AlertCircle, Zap, Building, Book, Lightbulb, Search, ChevronRight, Folder } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { getAllDocumentTypesWithCounts } from '../../services/vadeMecumServiceImproved'
import { getSubcategoriesByType, getDocumentsByTypeAndReference, searchAllDocuments } from '../../services/vadeMecumSubcategoriesService'
import VadeMecumListImproved from './VadeMecumListImproved'
import VadeMecumLoadMore from './VadeMecumLoadMore'
import { useDebounce } from '../../hooks/useDebounce'

const VadeMecumCategoriesImproved = () => {
  // Estados principais
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

  // Estados para busca
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Estados para paginação
  const [lastDocument, setLastDocument] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Mapeamento de tipos para ícones e labels
  const getTypeConfig = (type) => {
    const typeConfigs = {
      'constituicao': {
        icon: Scale,
        label: 'Constituição',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        description: 'Constituição Federal e Emendas Constitucionais'
      },
      'lei': {
        icon: FileText,
        label: 'Leis',
        color: 'bg-green-100 text-green-700 border-green-200',
        description: 'Leis ordinárias e complementares'
      },
      'decreto': {
        icon: Scroll,
        label: 'Decretos',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        description: 'Decretos executivos e regulamentares'
      },
      'portaria': {
        icon: ClipboardList,
        label: 'Portarias',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        description: 'Portarias ministeriais e administrativas'
      },
      'resolucao': {
        icon: Gavel,
        label: 'Resoluções',
        color: 'bg-red-100 text-red-700 border-red-200',
        description: 'Resoluções de órgãos e conselhos'
      },
      'instrucao_normativa': {
        icon: AlertCircle,
        label: 'Instruções Normativas',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        description: 'Instruções normativas e orientações'
      },
      'medida_provisoria': {
        icon: Zap,
        label: 'Medidas Provisórias',
        color: 'bg-pink-100 text-pink-700 border-pink-200',
        description: 'Medidas provisórias com força de lei'
      },
      'emenda_constitucional': {
        icon: Building,
        label: 'Emendas Constitucionais',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        description: 'Emendas à Constituição Federal'
      },
      'codigo': {
        icon: Book,
        label: 'Códigos',
        color: 'bg-teal-100 text-teal-700 border-teal-200',
        description: 'Códigos Civil, Penal, Processual, etc.'
      },
      'sumula': {
        icon: Lightbulb,
        label: 'Súmulas',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        description: 'Súmulas dos tribunais superiores'
      }
    }

    return typeConfigs[type] || {
      icon: FileText,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Documentos jurídicos'
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadCategories()
    loadFavorites()
  }, [])

  // Efeito para busca
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      handleSearch()
    } else {
      setIsSearchMode(false)
      setSearchResults([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const result = await getAllDocumentTypesWithCounts()
      if (result.success) {
        const sortedCategories = result.types.sort((a, b) => b.count - a.count)
        setCategories(sortedCategories)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('vademecum-favorites')
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      } catch (error) {
        console.error('Erro ao restaurar favoritos:', error)
      }
    }
  }

  const handleSearch = async () => {
    if (!debouncedSearchTerm.trim()) return

    setSearchLoading(true)
    setIsSearchMode(true)
    try {
      const result = await searchAllDocuments(debouncedSearchTerm.trim(), 20, null)
      if (result.success) {
        setSearchResults(result.documents)
        setLastDocument(result.lastDocument)
        setHasMore(result.hasMore)
        setTotalCount(result.totalFound || result.documents.length)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLoadMoreSearch = async () => {
    if (!hasMore || searchLoading) return

    setSearchLoading(true)
    try {
      const result = await searchAllDocuments(debouncedSearchTerm.trim(), 20, lastDocument)
      if (result.success) {
        setSearchResults(prev => [...prev, ...result.documents])
        setLastDocument(result.lastDocument)
        setHasMore(result.hasMore)
      }
    } catch (error) {
      console.error('Erro ao carregar mais resultados:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category)
    setSubcategories([])
    setDocuments([])
    setDocumentsLoading(true)

    try {
      const result = await getSubcategoriesByType(category.type)
      if (result.success) {
        setSubcategories(result.subcategories)
      }
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }

  const handleSubcategoryClick = async (subcategory) => {
    setSelectedSubcategory(subcategory)
    setDocuments([])
    setDocumentsLoading(true)

    try {
      const result = await getDocumentsByTypeAndReference(
        selectedCategory.type, 
        subcategory.referencia, 
        20, 
        null
      )
      if (result.success) {
        setDocuments(result.documents)
        setLastDocument(result.lastDocument)
        setHasMore(result.hasMore)
        setTotalCount(result.totalFound)
      }
    } catch (error) {
      console.error('Erro ao carregar documentos da subcategoria:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }

  const handleLoadMoreDocuments = async () => {
    if (!hasMore || documentsLoading) return

    setDocumentsLoading(true)
    try {
      const result = await getDocumentsByTypeAndReference(
        selectedCategory.type,
        selectedSubcategory.referencia,
        20,
        lastDocument
      )
      if (result.success) {
        setDocuments(prev => [...prev, ...result.documents])
        setLastDocument(result.lastDocument)
        setHasMore(result.hasMore)
      }
    } catch (error) {
      console.error('Erro ao carregar mais documentos:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSubcategories([])
    setDocuments([])
    setSelectedDocument(null)
  }

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null)
    setDocuments([])
    setSelectedDocument(null)
  }

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
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

  const clearSearch = () => {
    setSearchTerm('')
    setIsSearchMode(false)
    setSearchResults([])
  }

  // Se estamos visualizando documentos de uma subcategoria
  if (selectedSubcategory) {
    const typeConfig = getTypeConfig(selectedCategory.type)
    const IconComponent = typeConfig.icon

    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb e navegação */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              onClick={handleBackToCategories}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Categorias
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="outline"
              onClick={handleBackToSubcategories}
              className="flex items-center gap-2"
            >
              {typeConfig.label}
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{selectedSubcategory.referencia}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${typeConfig.color}`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {selectedSubcategory.referencia}
              </h1>
              <p className="text-muted-foreground">
                {typeConfig.label} - {selectedSubcategory.referencia}
              </p>
              <Badge variant="secondary" className="mt-2">
                {selectedSubcategory.count} documento(s)
              </Badge>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        <VadeMecumListImproved
          documents={documents}
          onDocumentSelect={handleDocumentSelect}
          loading={documentsLoading}
          selectedDocument={selectedDocument}
          viewMode="grid"
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onCloseModal={() => setSelectedDocument(null)}
        />

        {/* Carregar mais documentos */}
        {documents.length > 0 && (
          <VadeMecumLoadMore
            hasMore={hasMore}
            onLoadMore={handleLoadMoreDocuments}
            loading={documentsLoading}
            currentCount={documents.length}
            totalCount={totalCount}
          />
        )}
      </div>
    )
  }

  // Se uma categoria está selecionada, mostra as subcategorias
  if (selectedCategory) {
    const typeConfig = getTypeConfig(selectedCategory.type)
    const IconComponent = typeConfig.icon

    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header da categoria selecionada */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToCategories}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às Categorias
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${typeConfig.color}`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {typeConfig.label}
              </h1>
              <p className="text-muted-foreground">
                {typeConfig.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                {selectedCategory.count} documento(s)
              </Badge>
            </div>
          </div>
        </div>

        {/* Grid de subcategorias */}
        {documentsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {subcategories.map((subcategory, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-orange-200 group min-h-[170px] flex flex-col justify-between"
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-xl bg-gray-100 text-gray-700 transition-all duration-300 group-hover:scale-110">
                      <Folder className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors line-clamp-2 break-words overflow-hidden text-ellipsis whitespace-normal word-break-all">
                        {subcategory.titulo}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end">
                    <Badge variant="secondary" className="mt-1">
                      {subcategory.count} documento(s)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mensagem quando não há subcategorias */}
        {!documentsLoading && subcategories.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma subcategoria encontrada
            </h3>
            <p className="text-muted-foreground">
              Não foram encontradas referências para esta categoria.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Visualização principal das categorias com busca
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header melhorado */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Vade Mecum
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Acesse rapidamente leis, decretos e outros documentos legais.
        </p>
      </div>

      {/* Barra de busca */}
      <Card className="mb-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar leis, decretos, portarias, artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados da busca */}
      {isSearchMode ? (
        <div>
          <div className="flex items-center justify-between text-sm border-b pb-3 mb-6">
            <div className="text-muted-foreground">
              <span className="font-medium">{searchResults.length}</span> resultado(s) encontrado(s)
              {searchTerm && (
                <Badge variant="outline" className="ml-2">
                  "{searchTerm}"
                </Badge>
              )}
            </div>
          </div>

          <VadeMecumListImproved
            documents={searchResults}
            onDocumentSelect={handleDocumentSelect}
            loading={searchLoading}
            selectedDocument={selectedDocument}
            viewMode="grid"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onCloseModal={() => setSelectedDocument(null)}
          />

          {/* Carregar mais resultados */}
          {searchResults.length > 0 && (
            <VadeMecumLoadMore
              hasMore={hasMore}
              onLoadMore={handleLoadMoreSearch}
              loading={searchLoading}
              currentCount={searchResults.length}
              totalCount={totalCount}
            />
          )}
        </div>
      ) : (
        <>
          {/* Grid de categorias */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {categories.map((category) => {
                const typeConfig = getTypeConfig(category.type)
                const IconComponent = typeConfig.icon

                return (
                  <Card
                    key={category.type}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${typeConfig.color}`}>
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">
                            {typeConfig.label}
                          </h3>
                          <Badge variant="secondary" className="mt-1">
                            {category.count} documento(s)
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {typeConfig.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Mensagem quando não há categorias */}
          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-muted-foreground">
                Não foram encontrados documentos no banco de dados.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default VadeMecumCategoriesImproved

