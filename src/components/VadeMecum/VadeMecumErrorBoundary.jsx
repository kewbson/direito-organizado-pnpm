import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class VadeMecumErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    console.error('Erro no Vade Mecum:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Erro no Vade Mecum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Ocorreu um erro inesperado no Vade Mecum. Isso pode ser devido a:
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Problemas de conexão com o Firebase</li>
              <li>Dados mal formatados na coleção</li>
              <li>Erro de permissões no Firestore</li>
              <li>Problema na estrutura dos componentes</li>
            </ul>

            {this.state.error && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Erro técnico:</p>
                <p className="text-xs text-red-700 mt-1 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleReset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <p>Se o problema persistir, verifique:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Configuração do Firebase</li>
                <li>Regras de segurança do Firestore</li>
                <li>Console do navegador para mais detalhes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export default VadeMecumErrorBoundary

