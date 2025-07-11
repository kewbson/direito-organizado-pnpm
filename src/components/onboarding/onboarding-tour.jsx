import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { EnhancedButton } from '../ui/enhanced-button';
import { FocusTrap } from '../accessibility/focus-trap';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Direito Organizado!',
    content: 'Vamos fazer um tour rápido pelas principais funcionalidades da plataforma.',
    target: null,
    position: 'center'
  },
  {
    id: 'sidebar',
    title: 'Menu de Navegação',
    content: 'Use este menu para navegar entre as diferentes seções: Dashboard, Caderno Digital, Planejamento, Agenda e muito mais.',
    target: '[data-tour="sidebar"]',
    position: 'right'
  },
  {
    id: 'caderno',
    title: 'Caderno Digital',
    content: 'Organize suas anotações de estudo por matéria. Crie, edite e pesquise suas anotações facilmente.',
    target: '[data-tour="caderno"]',
    position: 'right'
  },
  {
    id: 'planejamento',
    title: 'Planejamento de Estudos',
    content: 'Crie planos de estudo estruturados, defina metas e acompanhe seu progresso.',
    target: '[data-tour="planejamento"]',
    position: 'right'
  },
  {
    id: 'agenda',
    title: 'Agenda',
    content: 'Organize suas aulas, provas e prazos em um calendário intuitivo.',
    target: '[data-tour="agenda"]',
    position: 'right'
  },
  {
    id: 'testes',
    title: 'Testes Rápidos',
    content: 'Teste seus conhecimentos com questões organizadas por matéria e acompanhe seu desempenho.',
    target: '[data-tour="testes"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'Pronto para começar!',
    content: 'Agora você conhece as principais funcionalidades. Comece criando sua primeira anotação ou plano de estudos.',
    target: null,
    position: 'center'
  }
];

const TourStep = ({ step, position, onNext, onPrev, onSkip, isFirst, isLast, currentStep, totalSteps }) => {
  const stepRef = useRef(null);

  useEffect(() => {
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement && stepRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const stepElement = stepRef.current;
        
        // Posiciona o tooltip baseado na posição especificada
        switch (step.position) {
          case 'right':
            stepElement.style.left = `${targetRect.right + 20}px`;
            stepElement.style.top = `${targetRect.top}px`;
            break;
          case 'left':
            stepElement.style.right = `${window.innerWidth - targetRect.left + 20}px`;
            stepElement.style.top = `${targetRect.top}px`;
            break;
          case 'bottom':
            stepElement.style.left = `${targetRect.left}px`;
            stepElement.style.top = `${targetRect.bottom + 20}px`;
            break;
          case 'top':
            stepElement.style.left = `${targetRect.left}px`;
            stepElement.style.bottom = `${window.innerHeight - targetRect.top + 20}px`;
            break;
          default:
            // Center
            stepElement.style.left = '50%';
            stepElement.style.top = '50%';
            stepElement.style.transform = 'translate(-50%, -50%)';
        }

        // Adiciona highlight ao elemento alvo
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '1001';
        targetElement.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.5)';
        targetElement.style.borderRadius = '8px';
      }
    }

    return () => {
      // Remove highlight
      if (step.target) {
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
          targetElement.style.position = '';
          targetElement.style.zIndex = '';
          targetElement.style.boxShadow = '';
          targetElement.style.borderRadius = '';
        }
      }
    };
  }, [step]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-1000" onClick={onSkip} />
      
      {/* Tooltip */}
      <div
        ref={stepRef}
        className={cn(
          'fixed z-1001 bg-white rounded-lg shadow-xl border border-slate-200',
          'max-w-sm w-full p-6',
          'animate-slide-in-up',
          step.position === 'center' && 'left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'
        )}
      >
        <FocusTrap active={true}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {step.title}
              </h3>
              <div className="text-sm text-slate-500">
                {currentStep} de {totalSteps}
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Pular tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-slate-600 mb-6 leading-relaxed">
            {step.content}
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Progresso</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {!isFirst && (
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={onPrev}
                  className="mr-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </EnhancedButton>
              )}
            </div>

            <div className="flex items-center gap-2">
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={onSkip}
              >
                Pular Tour
              </EnhancedButton>
              
              <EnhancedButton
                variant="primary"
                size="sm"
                onClick={onNext}
              >
                {isLast ? (
                  <>
                    <Check className="w-4 h-4" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </EnhancedButton>
            </div>
          </div>
        </FocusTrap>
      </div>
    </>
  );
};

export const OnboardingTour = ({ isOpen, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = tourSteps[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      // Previne scroll do body durante o tour
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStepIndex(0);
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <TourStep
      step={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleComplete}
      isFirst={currentStepIndex === 0}
      isLast={currentStepIndex === tourSteps.length - 1}
      currentStep={currentStepIndex + 1}
      totalSteps={tourSteps.length}
    />
  );
};

