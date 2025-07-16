import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Loader2, ChevronDown } from 'lucide-react'

const VadeMecumLoadMore = ({ 
  hasMore, 
  onLoadMore, 
  loading, 
  currentCount, 
  totalCount 
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = async () => {
    setIsLoading(true)
    try {
      await onLoadMore()
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasMore) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Todos os documentos foram carregados ({currentCount} de {totalCount})
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Mostrando {currentCount} de {totalCount} documentos
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
          <div 
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((currentCount / totalCount) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <Button
        onClick={handleLoadMore}
        disabled={loading || isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        {(loading || isLoading) ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Carregar mais documentos
          </>
        )}
      </Button>
    </div>
  )
}

export default VadeMecumLoadMore

