import React, { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'

const VadeMecumSearch = ({ onSearch, onFilterByType, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
    onFilterByType(type === 'all' ? null : type)
  }

  const documentTypes = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'constituicao', label: 'Constituição' },
    { value: 'lei', label: 'Lei' },
    { value: 'decreto', label: 'Decreto' },
    { value: 'portaria', label: 'Portaria' },
    { value: 'resolucao', label: 'Resolução' },
    { value: 'instrucao_normativa', label: 'Instrução Normativa' },
    { value: 'medida_provisoria', label: 'Medida Provisória' },
    { value: 'emenda_constitucional', label: 'Emenda Constitucional' },
    { value: 'codigo', label: 'Código' },
    { value: 'sumula', label: 'Súmula' }
  ]

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Barra de busca */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por título, conteúdo, referência ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedType} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VadeMecumSearch

