import React, { useState, useEffect } from 'react'
import { BookOpen, ArrowLeft, FileText, Scale, Gavel, Scroll, ClipboardList, AlertCircle, Zap, Building, Book, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { getAllDocumentTypesWithCounts } from '../../services/vadeMecumServiceImproved'
import VadeMecumListImproved from './VadeMecumListImproved'
import { searchVadeMecumImproved } from '../../services/vadeMecumServiceImproved'

const VadeMecumCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryDocuments, setCategoryDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

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

  // Carregar categorias ao montar o componente
  useEffect(() => {
    loadCategories()
    loadFavorites()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const result = await getAllDocumentTypesWithCounts()
      if (result.success) {
        // Ordena as categorias por contagem (maior para menor)
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

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category)
    setDocumentsLoading(true)
    setCategoryDocuments([])

    try {
      const result = await searchVadeMecumImproved(null, 100, null, category.type)
      if (result.success) {
        setCategoryDocuments(result.documents)
      }
    } catch (error) {
      console.error('Erro ao carregar documentos da categoria:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setCategoryDocuments([])
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

  // Se uma categoria está selecionada, mostra os documentos dessa categoria
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

        {/* Lista de documentos da categoria */}
        <VadeMecumListImproved
          documents={categoryDocuments}
          onDocumentSelect={handleDocumentSelect}
          loading={documentsLoading}
          selectedDocument={selectedDocument}
          viewMode="grid"
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onCloseModal={() => setSelectedDocument(null)}
        />
      </div>
    )
  }

  // Visualização principal das categorias
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

      {/* Grid de categorias */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const typeConfig = getTypeConfig(category.type)
            const IconComponent = typeConfig.icon

            return (
              <Card
                key={category.type}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-orange-200 group"
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
    </div>
  )
}

export default VadeMecumCategories

