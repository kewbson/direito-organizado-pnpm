import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Sparkles } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

const VadeMecumSearchImproved = ({ onSearch, onFilterByType, loading, documentTypes = [] }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])

  // Sugestões de busca populares
  const popularSearches = [
    'Código Civil',
    'Constituição Federal',
    'CLT',
    'Código Penal',
    'Lei Maria da Penha',
    'Marco Civil da Internet'
  ]

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vademecum-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
  }, [])

  // Gerar sugestões baseadas no termo de busca
  useEffect(() => {
    if (searchTerm.length > 2) {
      const filtered = popularSearches.filter(search => 
        search.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 3))
    } else {
      setSuggestions([])
    }
  }, [searchTerm])

  const handleSearch = (term = searchTerm) => {
    if (!term.trim()) return

    // Adicionar ao histórico
    const newHistory = [
      term,
      ...searchHistory.filter(h => h !== term)
    ].slice(0, 5)
    
    setSearchHistory(newHistory)
    localStorage.setItem('vademecum-search-history', JSON.stringify(newHistory))

    // Executar busca
    onSearch(term)
    setSuggestions([])
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
    onFilterByType(type === 'all' ? null : type)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSelectedType('all')
    onSearch('')
    onFilterByType(null)
  }

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

  return (
    <Card className="shadow-sm border-2 border-orange-100 dark:border-orange-900/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Busca principal */}
          <div className="relative">
            <div className="flex gap-3">
              {/* Campo de busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Digite o nome da lei, decreto ou palavra-chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-10 h-12 text-base border-2 focus:border-orange-300"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Filtro de tipo */}
              <Select value={selectedType} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-48 h-12 border-2">
                  <SelectValue placeholder="Tipo" />
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
                onClick={() => handleSearch()} 
                disabled={loading}
                className="h-12 px-6 bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {/* Sugestões de busca */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion)
                      handleSearch(suggestion)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtros ativos */}
          {(searchTerm || selectedType !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: "{searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getTypeIcon(selectedType)} {getTypeLabel(selectedType)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleTypeFilter('all')}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="text-xs h-6"
              >
                Limpar tudo
              </Button>
            </div>
          )}

          {/* Busca rápida e histórico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buscas populares */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Buscas Populares
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.slice(0, 4).map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm(search)
                      handleSearch(search)
                    }}
                    className="text-xs h-7"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            {/* Histórico de busca */}
            {searchHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  Buscas Recentes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 4).map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm(search)
                        handleSearch(search)
                      }}
                      className="text-xs h-7 text-muted-foreground hover:text-foreground"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dicas de busca */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Filter className="h-3 w-3 mr-1" />
                {showAdvanced ? 'Ocultar' : 'Mostrar'} dicas de busca
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <h5 className="font-medium mb-2">Dicas para uma busca mais eficiente:</h5>
                <ul className="space-y-1">
                  <li>• Use palavras-chave específicas como "habeas corpus" ou "direitos fundamentais"</li>
                  <li>• Combine filtros de tipo com termos de busca para resultados mais precisos</li>
                  <li>• Busque por números de leis como "Lei 8.069" ou "Decreto 3.048"</li>
                  <li>• Use aspas para buscar frases exatas: "devido processo legal"</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}

export default VadeMecumSearchImproved

