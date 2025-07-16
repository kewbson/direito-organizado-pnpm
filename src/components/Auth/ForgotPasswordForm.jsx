import { useState } from 'react'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export function ForgotPasswordForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { forgotPassword, isLoading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Por favor, digite seu e-mail')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido')
      return
    }

    const result = await forgotPassword(email)
    if (result.success) {
      setSuccess(result.message)
    } else {
      setError(result.error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-amber-600">
          Recuperar senha
        </CardTitle>
        <CardDescription>
          Digite seu e-mail e enviaremos instruções para redefinir sua senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                  if (success) setSuccess('')
                }}
                placeholder="seu@email.com"
                className="pl-10"
                required
              />
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
                Enviando...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar instruções
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao login
            </button>
          </div>

          {success && (
            <div className="text-center text-sm text-gray-600">
              Não recebeu o e-mail? Verifique sua caixa de spam ou{' '}
              <button
                type="button"
                onClick={handleSubmit}
                className="text-amber-600 hover:text-amber-700 hover:underline"
              >
                tente novamente
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

