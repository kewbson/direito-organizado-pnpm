import React, { createContext, useContext, useState, useCallback } from 'react';

const AnnouncerContext = createContext();

export const useAnnouncer = () => {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }
  return context;
};

export const AnnouncerProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);

  const announce = useCallback((message, priority = 'polite') => {
    const id = Date.now().toString();
    const announcement = {
      id,
      message,
      priority
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Remove o anúncio após um tempo para evitar acúmulo
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  const announcePolite = useCallback((message) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive');
  }, [announce]);

  const value = {
    announce,
    announcePolite,
    announceAssertive
  };

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      
      {/* Regiões de anúncio para leitores de tela */}
      <div className="sr-only">
        <div aria-live="polite" aria-atomic="true">
          {announcements
            .filter(a => a.priority === 'polite')
            .map(a => (
              <div key={a.id}>{a.message}</div>
            ))
          }
        </div>
        
        <div aria-live="assertive" aria-atomic="true">
          {announcements
            .filter(a => a.priority === 'assertive')
            .map(a => (
              <div key={a.id}>{a.message}</div>
            ))
          }
        </div>
      </div>
    </AnnouncerContext.Provider>
  );
};

// Hook para anúncios comuns
export const useCommonAnnouncements = () => {
  const { announcePolite, announceAssertive } = useAnnouncer();

  return {
    announceLoading: (action = 'Carregando') => announcePolite(`${action}...`),
    announceSuccess: (message) => announcePolite(`Sucesso: ${message}`),
    announceError: (message) => announceAssertive(`Erro: ${message}`),
    announceNavigation: (page) => announcePolite(`Navegando para ${page}`),
    announceFormSubmission: () => announcePolite('Formulário enviado com sucesso'),
    announceFormError: (field) => announceAssertive(`Erro no campo ${field}`)
  };
};

