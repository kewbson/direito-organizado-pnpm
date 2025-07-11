import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { useVadeMecumStore } from './vademecumStore';

const VadeMecumPage = () => {
  const [legislacao, setLegislacao] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiExplanation, setAiExplanation] = useState({});
  const { annotations, favorites, markings, addAnnotation, removeAnnotation, addFavorite, removeFavorite, addMarking, removeMarking } = useVadeMecumStore();

  useEffect(() => {
    fetch('/data/legislacao.json')
      .then(response => response.json())
      .then(data => {
        setLegislacao(data);
        setSearchResults(data); // Initially display all legislation
      })
      .catch(error => console.error('Erro ao carregar legislação:', error));
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults(legislacao);
      return;
    }

    const fuse = new Fuse(legislacao, {
      keys: ['artigo', 'texto', 'titulo', 'palavras_chave'],
      includeScore: true,
      threshold: 0.3,
    });

    const results = fuse.search(searchTerm).map(result => result.item);
    setSearchResults(results);
  }, [searchTerm, legislacao]);

  const handleAddAnnotation = (articleId) => {
    const annotationText = prompt('Adicionar anotação:');
    if (annotationText) {
      addAnnotation(articleId, annotationText);
    }
  };

  const handleRemoveAnnotation = (articleId, index) => {
    if (confirm('Tem certeza que deseja remover esta anotação?')) {
      removeAnnotation(articleId, index);
    }
  };

  const handleAddFavorite = (article) => {
    addFavorite(article);
  };

  const handleRemoveFavorite = (articleId) => {
    removeFavorite(articleId);
  };

  const handleAddMarking = (articleId) => {
    const markingText = prompt('Adicionar marcação:');
    if (markingText) {
      addMarking(articleId, markingText);
    }
  };

  const handleRemoveMarking = (articleId, index) => {
    if (confirm('Tem certeza que deseja remover esta marcação?')) {
      removeMarking(articleId, index);
    }
  };

  const handleExplainWithAI = (article) => {
    // Simulação de chamada à API da OpenAI
    setAiExplanation(prev => ({
      ...prev,
      [article.artigo]: {
        summary: `Resumo do ${article.artigo}: Este artigo trata sobre ${article.titulo.toLowerCase()}.`,
        explanation: `Explicação detalhada do ${article.artigo}: ${article.texto.substring(0, 100)}... (simulação de IA)`,
        flashcard: `Flashcard: Qual o tema principal do ${article.artigo}?`,
      }
    }));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Vade Mecum Inteligente</h1>
      <input
        type="text"
        placeholder="Buscar artigo, lei, etc..."
        className="w-full p-2 md:p-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((item, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{item.lei} - {item.artigo}</h2>
            <h3 className="text-lg text-gray-700 mb-2 dark:text-gray-300">{item.titulo}</h3>
            <p className="text-gray-600 dark:text-gray-400">{item.texto}</p>
            {item.remissoes && item.remissoes.length > 0 && (
              <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">Remissões: {item.remissoes.join(', ')}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleAddAnnotation(item.artigo)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Anotar</button>
              <button onClick={() => handleAddMarking(item.artigo)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm">Marcar</button>
              {favorites.some(fav => fav.artigo === item.artigo) ? (
                <button onClick={() => handleRemoveFavorite(item.artigo)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm">Remover Favorito</button>
              ) : (
                <button onClick={() => handleAddFavorite(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm">Favoritar</button>
              )}
              <button onClick={() => handleExplainWithAI(item)} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm">Explicar com IA</button>
            </div>
            {annotations[item.artigo] && annotations[item.artigo].length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md dark:bg-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Anotações:</h4>
                {annotations[item.artigo].map((annotation, annIndex) => (
                  <p key={annIndex} className="text-sm text-gray-700 flex justify-between items-center dark:text-gray-300">
                    {annotation}
                    <button onClick={() => handleRemoveAnnotation(item.artigo, annIndex)} className="text-red-500 hover:text-red-700 text-xs ml-2">x</button>
                  </p>
                ))}
              </div>
            )}
            {markings[item.artigo] && markings[item.artigo].length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md dark:bg-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Marcações:</h4>
                {markings[item.artigo].map((marking, markIndex) => (
                  <p key={markIndex} className="text-sm text-gray-700 flex justify-between items-center dark:text-gray-300">
                    {marking}
                    <button onClick={() => handleRemoveMarking(item.artigo, markIndex)} className="text-red-500 hover:text-red-700 text-xs ml-2">x</button>
                  </p>
                ))}
              </div>
            )}
            {aiExplanation[item.artigo] && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md dark:bg-blue-900">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Explicação por IA:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Resumo:</strong> {aiExplanation[item.artigo].summary}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Explicação:</strong> {aiExplanation[item.artigo].explanation}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Flashcard:</strong> {aiExplanation[item.artigo].flashcard}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VadeMecumPage;


