import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function AuthPage() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'forgot-password'

  const renderCurrentView = () => {
    switch (currentView) {
      case 'register':
        return (
          <RegisterForm 
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )
      default:
        return (
          <LoginForm 
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        )
    }
  }

  return (
    <AnimatedBackground variant="dots" className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm shadow-2xl animate-fade-in">
        <CardHeader className="text-center space-y-3">
          {currentView !== 'login' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentView('login')}
              className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          )}

        </CardHeader>
        <CardContent>
          {renderCurrentView()}
        </CardContent>
        <div className="text-center pb-6 text-sm text-muted-foreground">
          <p>© 2025 Direito Organizado. Todos os direitos reservados.</p>
        </div>
      </Card>
    </AnimatedBackground>
  )
}

