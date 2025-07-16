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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                {/* Replace with your actual logo/icon */}
                <span className="text-white text-3xl font-bold">DO</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-gradient-orange">
              Direito Organizado
            </h1>
          </div>
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

// Add a new CSS class for text gradient
// This should be added to your global CSS file (e.g., index.css or App.css)
// .text-gradient-orange {
//   background-image: linear-gradient(to right, var(--orange-500), var(--orange-600));
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
// }

// Ensure your tailwind.config.js has these colors defined:
// theme: {
//   extend: {
//     colors: {
//       orange: {
//         500: '#f97316',
//         600: '#ea580c',
//         700: '#c2410c',
//       },
//     },
//   },
// },

// Also, ensure you have the `animate-fade-in` utility in your CSS/Tailwind config.
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(-10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in {
//   animation: fadeIn 0.5s ease-out forwards;
// }

