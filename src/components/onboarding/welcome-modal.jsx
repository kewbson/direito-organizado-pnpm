import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Target, Calendar, Zap, ArrowRight, X } from 'lucide-react';
import { EnhancedButton } from '../ui/enhanced-button';
import { EnhancedCard, CardContent } from '../ui/enhanced-card';
import { FocusTrap } from '../accessibility/focus-trap';

const features = [
  {
    icon: BookOpen,
    title: 'Caderno Digital',
    description: 'Organize suas anotações por matéria com editor rico e busca avançada.'
  },
  {
    icon: Target,
    title: 'Planejamento Inteligente',
    description: 'Crie planos de estudo personalizados e acompanhe seu progresso.'
  },
  {
    icon: Calendar,
    title: 'Agenda Integrada',
    description: 'Gerencie aulas, provas e prazos em um calendário intuitivo.'
  },
  {
    icon: Zap,
    title: 'Testes Rápidos',
    description: 'Pratique com questões organizadas e monitore seu desempenho.'
  }
];

export const WelcomeModal = ({ isOpen, onClose, onStartTour, userName = 'Estudante' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Bem-vindo, ${userName}!`,
      subtitle: 'Sua jornada jurídica organizada começa aqui',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-slate-600 text-lg leading-relaxed">
              O <strong>Direito Organizado</strong> é sua plataforma completa para estudos jurídicos. 
              Organize anotações, planeje estudos e acompanhe seu progresso de forma inteligente.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Principais Funcionalidades',
      subtitle: 'Tudo que você precisa em um só lugar',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      title: 'Pronto para começar?',
      subtitle: 'Vamos configurar sua experiência',
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Tour Guiado</h4>
              <p className="text-orange-700 text-sm">
                Faça um tour rápido pelas principais funcionalidades (recomendado para novos usuários)
              </p>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Explorar Livremente</h4>
              <p className="text-slate-600 text-sm">
                Comece a usar a plataforma imediatamente e descubra as funcionalidades no seu ritmo
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStartTour = () => {
    onClose();
    onStartTour();
  };

  const handleSkipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <FocusTrap active={true}>
        <EnhancedCard 
          variant="elevated" 
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-slate-600">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="px-6 pb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Progresso</span>
                <span>{currentStep + 1} de {steps.length}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <div className="animate-fade-in">
                {currentStepData.content}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
              {currentStep < steps.length - 1 ? (
                <div className="flex justify-between">
                  <EnhancedButton
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                  >
                    Anterior
                  </EnhancedButton>
                  
                  <EnhancedButton
                    variant="primary"
                    onClick={handleNext}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </EnhancedButton>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <EnhancedButton
                    variant="outline"
                    onClick={handleSkipTour}
                    className="flex-1"
                  >
                    Explorar Livremente
                  </EnhancedButton>
                  
                  <EnhancedButton
                    variant="primary"
                    onClick={handleStartTour}
                    className="flex-1"
                  >
                    Iniciar Tour Guiado
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </EnhancedButton>
                </div>
              )}
            </div>
          </CardContent>
        </EnhancedCard>
      </FocusTrap>
    </div>
  );
};

