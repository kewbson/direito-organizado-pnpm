// 🛠️ Debug de Categorias do Vade Mecum
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { getAllDocumentTypesWithCounts } from '../../services/vadeMecumServiceImproved'

const VadeMecumCategoriesDebug = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Carregando categorias...')
      const result = await getAllDocumentTypesWithCounts()
      console.log('Resultado categorias:', result)

      if (result.success) {
        setCategories(result.types)
        setStats({
          totalDocuments: result.totalDocuments,
          totalTypes: result.types.length
        })
        console.log(`✅ ${result.types.length} categorias encontradas`)
      } else {
        setError(`Categories Error: ${result.error}`)
      }

    } catch (err) {
      console.error('💥 Erro ao carregar categorias:', err)
      setError(`General Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>🔄 Carregando categorias...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="m-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">❌ Erro nas Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-700 bg-red-50 p-3 rounded">{error}</p>
            <Button onClick={loadCategories} className="w-full">
              🔄 Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📁 Categorias - Debug
            <Badge variant="outline">{categories.length} tipos</Badge>
            {stats && <Badge variant="outline">{stats.totalDocuments} docs</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.type} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize">{category.type}</h3>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>📊 {category.count} documento{category.count !== 1 ? 's' : ''}</p>
                      <p>📈 {((category.count / (stats?.totalDocuments || 1)) * 100).toFixed(1)}% do total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {stats && (
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">📈 Resumo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Total de Documentos:</p>
                    <p className="text-lg text-blue-600">{stats.totalDocuments}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tipos Encontrados:</p>
                    <p className="text-lg text-green-600">{stats.totalTypes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VadeMecumCategoriesDebug
