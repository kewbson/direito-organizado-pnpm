import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}


        {/* Auth Form */}
        {renderCurrentView()}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Direito Organizado. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

