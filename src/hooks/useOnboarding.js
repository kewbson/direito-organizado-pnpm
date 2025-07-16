import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'direito-organizado-onboarding';

export const useOnboarding = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Verifica se é a primeira visita do usuário
    const onboardingData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    
    if (!onboardingData) {
      setIsFirstVisit(true);
      setShowWelcome(true);
    } else {
      const data = JSON.parse(onboardingData);
      setIsFirstVisit(false);
      
      // Verifica se o usuário quer ver o tour novamente
      if (data.showTourAgain) {
        setShowTour(true);
        // Remove a flag após mostrar
        const updatedData = { ...data, showTourAgain: false };
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
      }
    }
  }, []);

  const completeWelcome = () => {
    setShowWelcome(false);
  };

  const startTour = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const completeTour = () => {
    setShowTour(false);
    
    // Salva que o onboarding foi completado
    const onboardingData = {
      completed: true,
      completedAt: new Date().toISOString(),
      showTourAgain: false
    };
    
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingData));
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsFirstVisit(true);
    setShowWelcome(true);
    setShowTour(false);
  };

  const requestTourAgain = () => {
    const onboardingData = JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || '{}');
    const updatedData = { ...onboardingData, showTourAgain: true };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
    setShowTour(true);
  };

  const skipOnboarding = () => {
    setShowWelcome(false);
    setShowTour(false);
    
    const onboardingData = {
      completed: true,
      skipped: true,
      completedAt: new Date().toISOString(),
      showTourAgain: false
    };
    
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingData));
  };

  return {
    showWelcome,
    showTour,
    isFirstVisit,
    completeWelcome,
    startTour,
    completeTour,
    resetOnboarding,
    requestTourAgain,
    skipOnboarding
  };
};

