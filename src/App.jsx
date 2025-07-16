import { useState, useEffect } from 'react'
import { Moon, Sun, LogOut, ShieldCheck } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { useDarkMode } from './hooks/useDarkMode'
import { Button } from './components/ui/button'
import { AuthPage } from './components/Auth/AuthPage'
import { Sidebar } from './components/Layout/Sidebar'
import { MobileBottomNav } from './components/Layout/MobileBottomNav'
import { Dashboard } from './components/Sections/Dashboard'
import { DigitalNotebook } from './components/Sections/DigitalNotebook'
import { StudyPlanning } from './components/Sections/StudyPlanning'
import { Calendar } from './components/Sections/Calendar'
import { QuickTests } from './components/Sections/QuickTests'
import { Support } from './components/Sections/Support'
import { Profile } from './components/Sections/Profile'
import VadeMecumWithCategories from './components/VadeMecum/VadeMecumWithCategories'
import VadeMecumErrorBoundary from './components/VadeMecum/VadeMecumErrorBoundary'
import { LoadingSpinner } from './components/ui/loading-spinner'
import { FileText, Target, Calendar as CalendarIcon } from 'lucide-react'
import './App.css'
import { Toaster } from './components/ui/sonner'

function AppContent() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // Aplicar classe dark no body quando o componente monta
  useEffect(() => {
    document.body.className = document.body.className.replace(/\s*dark\s*/g, '')
    if (isDarkMode) {
      document.body.classList.add('dark')
    }
  }, [isDarkMode])

  // Animação de transição entre seções
  const handleSectionChange = (section) => {
    if (section === activeSection) return
    
    setIsLoading(true)
    setTimeout(() => {
      setActiveSection(section)
      setIsLoading(false)
      setIsMenuOpen(false)
    }, 300)
  }

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center transition-colors duration-300">
          <div className="text-center space-y-4">
            <LoadingSpinner size="xl" className="text-orange-500 mx-auto" />
            <p className="text-muted-foreground animate-pulse">Carregando...</p>
          </div>
      </div>
    )
  }

  // Se não estiver autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <AuthPage />
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onSectionChange={handleSectionChange} />
      case 'notebook':
        return <DigitalNotebook />
      case 'planning':
        return <StudyPlanning />
      case 'calendar':
        return <Calendar />
      case 'tests':
        return <QuickTests />
      case 'vademecum':
        return (
          <VadeMecumErrorBoundary>
            <VadeMecumWithCategories />
          </VadeMecumErrorBoundary>
        )
      case 'support':
        return <Support />
      case 'profile':
        return <Profile />
      default:
        return <Dashboard onSectionChange={handleSectionChange} />
    }
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          {/* Header moderno */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                {/* Logo e título */}
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                    <img src="/logo-retangular.svg" alt="Logo da Página de Login" className="w-28 sm:w-36 md:w-40 h-auto mx-auto mb-0" />
                    <p className="text-xs text-muted-foreground">
                      Versão 1.0 - Em desenvolvimento
                    </p>
                  </div>
                </div>

                {/* Controles do header */}
                <div className="flex items-center space-x-2">
                  {/* Dark Mode Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="bg-background/80 backdrop-blur-sm border-border shadow-md hover-lift"
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover-lift"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Sair</span>
                  </Button>
                  {user && user.role === 'admin' && (
                    <a
                      href="https://direitoorganizado-adm.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors duration-200 text-yellow-400 hover:bg-yellow-400/20"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span className="font-bold">Painel ADM</span>
                    </a>
                  )}                    
                </div>
              </div>
            </div>
          </header>

          <div className="flex">
            {/* Sidebar */}
            <Sidebar 
              activeSection={activeSection} 
              onSectionChange={handleSectionChange}
              isOpen={isMenuOpen}
              setIsOpen={setIsMenuOpen}
            />
            
            {/* Main Content */}
            <main className="flex-1 md:ml-0">
              <div className="p-4 md:p-6 pb-20 md:pb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                      <LoadingSpinner size="xl" className="text-orange-500 mx-auto" />
                      <p className="text-muted-foreground animate-pulse">
                        Carregando seção...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="animate-slide-up">
                    {renderSection()}
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}/>

      </div>
    </DataProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App


