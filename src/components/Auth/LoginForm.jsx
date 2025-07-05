import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

// Ícone do Google como componente SVG
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const { login, isLoading } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    const result = await login(formData.email, formData.password)
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login. Verifique suas credenciais e tente novamente.')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsGoogleLoading(true)
    
    try {
      // Simular integração com Google OAuth
      // Em produção, aqui seria a integração real com Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simular falha ocasional para demonstrar tratamento de erro
      if (Math.random() > 0.7) {
        throw new Error('Falha na autenticação com Google')
      }
      
      // Simular login bem-sucedido
      const result = await login('usuario@gmail.com', 'google_auth_token')
      if (!result.success) {
        setError('Erro ao autenticar com Google. Tente novamente.')
      }
    } catch (err) {
      setError('Não foi possível conectar com o Google. Verifique sua conexão e tente novamente.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
          
        <CardTitle className="text-2xl font-bold text-amber-600">
            <img src="/logo-completa-retangular.svg" alt="Logo da Página de Login" className="w-28 sm:w-36 md:w-40 h-auto mx-auto mb-0" />
          Bem-vindo de volta!
        </CardTitle>
        <CardDescription>
          Acesse já sua conta e continue seus estudos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Sua senha"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              Esqueceu sua senha?
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Conectando com Google...
              </div>
            ) : (
              <>
                <GoogleIcon />
                <span className="ml-2">Entrar com Google</span>
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Não tem uma conta? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-amber-600 hover:text-amber-700 hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

