import React, { useState, useEffect } from 'react'
import { BookOpen, Search, Eye, Grid, List } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import VadeMecumCategoriesImproved from './VadeMecumCategoriesImproved'
import VadeMecumStats from './VadeMecumStats'
import { getVadeMecumStats } from '../../services/vadeMecumServiceImproved'

const VadeMecumWithCategories = () => {
  const [activeTab, setActiveTab] = useState("categories")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  // Carregar estatísticas quando a aba de estatísticas for selecionada
  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats()
    }
  }, [activeTab])

  const loadStats = async () => {
    setLoading(true)
    try {
      const result = await getVadeMecumStats()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        {/* Conteúdo das abas */}
        <TabsContent value="categories" className="space-y-6 mt-0">
          <VadeMecumCategoriesImproved />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-0">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header das estatísticas */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                  <Eye className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Estatísticas
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Visão geral dos documentos do Vade Mecum
                  </p>
                </div>
              </div>
            </div>

            <VadeMecumStats stats={stats} loading={loading} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default VadeMecumWithCategories

