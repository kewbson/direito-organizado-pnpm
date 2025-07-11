import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useVadeMecumStore } from './vademecumStore';
import { 
  Search, 
  Filter, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Brain, 
  MoreVertical,
  Star,
  BookOpen,
  Scale,
  ChevronDown,
  X,
  Plus,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

const VadeMecumPageEnhanced = () => {
  const [legislacao, setLegislacao] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiExplanation, setAiExplanation] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, favorites, annotations
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    annotations, 
    favorites, 
    markings, 
    addAnnotation, 
    removeAnnotation, 
    addFavorite, 
    removeFavorite, 
    addMarking, 
    removeMarking 
  } = useVadeMecumStore();

  // Filtros disponíveis
  const availableFilters = [
    { id: 'CF', label: 'Constituição Federal', color: 'bg-blue-100 text-blue-800' },
    { id: 'CLT', label: 'CLT', color: 'bg-green-100 text-green-800' },
    { id: 'CC', label: 'Código Civil', color: 'bg-purple-100 text-purple-800' },
    { id: 'CP', label: 'Código Penal', color: 'bg-red-100 text-red-800' },
    { id: 'CPC', label: 'CPC', color: 'bg-yellow-100 text-yellow-800' },
  ];

  useEffect(() => {
    setIsLoading(true);
    fetch('/data/legislacao.json')
      .then(response => response.json())
      .then(data => {
        setLegislacao(data);
        setSearchResults(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar legislação:', error);
        setIsLoading(false);
      });
  }, []);

  // Busca com Fuse.js
  const fuse = useMemo(() => {
    if (legislacao.length === 0) return null;
    return new Fuse(legislacao, {
      keys: ['artigo', 'texto', 'titulo', 'palavras_chave', 'lei'],
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [legislacao]);

  useEffect(() => {
    if (!fuse) return;

    let results = legislacao;

    // Aplicar busca
    if (searchTerm.trim() !== '') {
      results = fuse.search(searchTerm).map(result => result.item);
    }

    // Aplicar filtros
    if (selectedFilters.length > 0) {
      results = results.filter(item => selectedFilters.includes(item.lei));
    }

    // Aplicar filtro de aba
    if (activeTab === 'favorites') {
      results = results.filter(item => favorites.some(fav => fav.artigo === item.artigo));
    } else if (activeTab === 'annotations') {
      results = results.filter(item => annotations[item.artigo] && annotations[item.artigo].length > 0);
    }

    setSearchResults(results);
  }, [searchTerm, selectedFilters, activeTab, legislacao, fuse, favorites, annotations]);

  const handleAddAnnotation = (articleId) => {
    const annotationText = prompt('Adicionar anotação:');
    if (annotationText) {
      addAnnotation(articleId, annotationText);
    }
  };

  const handleAddMarking = (articleId) => {
    const markingText = prompt('Adicionar marcação:');
    if (markingText) {
      addMarking(articleId, markingText);
    }
  };

  const handleExplainWithAI = (article) => {
    setAiExplanation(prev => ({
      ...prev,
      [article.artigo]: {
        summary: `Resumo do ${article.artigo}: Este artigo trata sobre ${article.titulo.toLowerCase()}.`,
        explanation: `Explicação detalhada do ${article.artigo}: ${article.texto.substring(0, 100)}... (simulação de IA)`,
        flashcard: `Flashcard: Qual o tema principal do ${article.artigo}?`,
      }
    }));
  };

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const getFilterColor = (lei) => {
    const filter = availableFilters.find(f => f.id === lei);
    return filter ? filter.color : 'bg-gray-100 text-gray-800';
  };

  const isFavorite = (articleId) => favorites.some(fav => fav.artigo === articleId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-orange-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Vade Mecum Inteligente
              </h1>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artigo, lei, palavra-chave..."
              className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-200 ${
                selectedFilters.length > 0 
                  ? 'text-orange-600 bg-orange-100 dark:bg-orange-900' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="flex flex-wrap gap-2">
                {availableFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedFilters.includes(filter.id)
                        ? filter.color + ' ring-2 ring-offset-2 ring-orange-500'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'all', label: 'Todos', icon: BookOpen },
              { id: 'favorites', label: 'Favoritos', icon: Heart },
              { id: 'annotations', label: 'Anotações', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6">
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar sua busca ou filtros
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((item, index) => (
              <ArticleCard
                key={`${item.lei}-${item.artigo}-${index}`}
                item={item}
                isExpanded={expandedCard === `${item.lei}-${item.artigo}`}
                onToggleExpand={() => setExpandedCard(
                  expandedCard === `${item.lei}-${item.artigo}` 
                    ? null 
                    : `${item.lei}-${item.artigo}`
                )}
                isFavorite={isFavorite(item.artigo)}
                onToggleFavorite={() => 
                  isFavorite(item.artigo) 
                    ? removeFavorite(item.artigo)
                    : addFavorite(item)
                }
                annotations={annotations[item.artigo] || []}
                markings={markings[item.artigo] || []}
                onAddAnnotation={() => handleAddAnnotation(item.artigo)}
                onAddMarking={() => handleAddMarking(item.artigo)}
                onRemoveAnnotation={(index) => removeAnnotation(item.artigo, index)}
                onRemoveMarking={(index) => removeMarking(item.artigo, index)}
                onExplainWithAI={() => handleExplainWithAI(item)}
                aiExplanation={aiExplanation[item.artigo]}
                getFilterColor={getFilterColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente ArticleCard separado para melhor organização
const ArticleCard = ({
  item,
  isExpanded,
  onToggleExpand,
  isFavorite,
  onToggleFavorite,
  annotations,
  markings,
  onAddAnnotation,
  onAddMarking,
  onRemoveAnnotation,
  onRemoveMarking,
  onExplainWithAI,
  aiExplanation,
  getFilterColor
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header do Card */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getFilterColor(item.lei)}`}>
                {item.lei}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.artigo}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {item.titulo}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onAddAnnotation();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Adicionar Anotação
                    </button>
                    <button
                      onClick={() => {
                        onAddMarking();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      Adicionar Marcação
                    </button>
                    <button
                      onClick={() => {
                        onExplainWithAI();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Explicar com IA
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.texto);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar Texto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do Artigo */}
      <div className="p-4">
        <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
          isExpanded ? '' : 'line-clamp-3'
        }`}>
          {item.texto}
        </p>
        
        {item.texto.length > 200 && (
          <button
            onClick={onToggleExpand}
            className="mt-2 text-orange-600 dark:text-orange-400 text-sm font-medium hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1"
          >
            {isExpanded ? 'Ver menos' : 'Ver mais'}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>
        )}

        {/* Remissões */}
        {item.remissoes && item.remissoes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Remissões:</span> {item.remissoes.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Anotações */}
      {annotations.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Anotações
            </h4>
            <div className="space-y-2">
              {annotations.map((annotation, index) => (
                <div key={index} className="flex items-start justify-between gap-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                    {annotation}
                  </p>
                  <button
                    onClick={() => onRemoveAnnotation(index)}
                    className="text-blue-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marcações */}
      {markings.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Marcações
            </h4>
            <div className="space-y-2">
              {markings.map((marking, index) => (
                <div key={index} className="flex items-start justify-between gap-2">
                  <p className="text-sm text-green-800 dark:text-green-200 flex-1">
                    {marking}
                  </p>
                  <button
                    onClick={() => onRemoveMarking(index)}
                    className="text-green-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Explicação da IA */}
      {aiExplanation && (
        <div className="px-4 pb-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Explicação por IA
            </h4>
            <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
              <p><strong>Resumo:</strong> {aiExplanation.summary}</p>
              <p><strong>Explicação:</strong> {aiExplanation.explanation}</p>
              <p><strong>Flashcard:</strong> {aiExplanation.flashcard}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VadeMecumPageEnhanced;

