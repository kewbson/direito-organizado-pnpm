import { useState, useEffect } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, BookOpen, 
  AlertCircle, CheckCircle, Target, Filter, Grid3X3, List, 
  Bell, Star, MapPin, Users, Repeat, Download, Upload,
  ChevronLeft, ChevronRight, Search, Settings, Eye,
  TrendingUp, BarChart3, PieChart, Activity, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { GradientCard } from '@/components/ui/gradient-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useData } from '@/contexts/DataContext'

export function Calendar() {
  const { events, studyPlans, addEvent, updateEvent, deleteEvent } = useData()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingId, setEditingId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [allEngagements, setAllEngagements] = useState([])
  const [viewMode, setViewMode] = useState('month') // month, week, list
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNotifications, setShowNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'aula',
    description: '',
    location: '',
    priority: 'medium',
    reminder: '15',
    recurring: false
  })
  
  // Esta função cria um array de objetos Date para os dias que têm compromissos
  const getDatesWithEngagements = () => {
    if (!allEngagements) return []
    
    const dates = new Set()
    allEngagements.forEach(engagement => {
      dates.add(new Date(engagement.date.replace(/-/g, '\/')))
    })
    
    return Array.from(dates)
  }
  
  // Este useEffect combina eventos e planos de estudo em uma única lista
  useEffect(() => {
    const planEvents = studyPlans.map(plan => ({
      id: `plan-${plan.id}`,
      title: `Prazo: ${plan.title}`,
      date: plan.dueDate,
      time: '23:59',
      type: 'studyPlan',
      priority: 'high',
      originalPlan: plan,
    }))

    const combinedEngagements = [...events, ...planEvents]
    setAllEngagements(combinedEngagements)
  }, [events, studyPlans])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setFormData({ 
      title: '', date: '', time: '', type: 'aula', description: '',
      location: '', priority: 'medium', reminder: '15', recurring: false
    })
    setEditingId(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      description: event.description || '',
      location: event.location || '',
      priority: event.priority || 'medium',
      reminder: event.reminder || '15',
      recurring: event.recurring || false
    })
    setEditingId(event.id)
    setIsDialogOpen(true)
  }

  const handleOpenNewEventDialog = () => {
    const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    setFormData({
      title: '',
      date: dateString,
      time: '',
      type: 'aula',
      description: '',
      location: '',
      priority: 'medium',
      reminder: '15',
      recurring: false
    })
    setEditingId(null)
    setIsDialogOpen(true)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.date || !formData.time) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsLoading(true)
    let result
    if (editingId) {
      result = await updateEvent(editingId, formData)
    } else {
      result = await addEvent(formData)
    }

    if (result && result.success) {
      handleCancel()
    } else {
      alert("Ocorreu um erro ao salvar o evento.")
    }
    setIsLoading(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      if (!id.startsWith('plan-')) {
        deleteEvent(id)
      }
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'prova': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'aula': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'estudo': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'prazo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'studyPlan': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'prova': return <AlertCircle className="h-4 w-4" />
      case 'aula': return <BookOpen className="h-4 w-4" />
      case 'estudo': return <CheckCircle className="h-4 w-4" />
      case 'prazo': return <Clock className="h-4 w-4" />
      case 'studyPlan': return <Target className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  // Filtrar eventos
  const getFilteredEvents = () => {
    let filtered = allEngagements

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType)
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return filtered
  }

  // Filtrar eventos por data selecionada
  const eventsForSelectedDate = getFilteredEvents().filter(event => {
    if (!selectedDate || !event.date) return false
    const selectedDateString = selectedDate.toISOString().split('T')[0]
    return event.date === selectedDateString
  })

  // Obter próximos eventos
  const getUpcomingEvents = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return getFilteredEvents().filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= today && eventDate <= nextWeek
    }).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
  }

  // Obter eventos de hoje
  const getTodayEvents = () => {
    const today = new Date().toISOString().split('T')[0]
    return getFilteredEvents().filter(event => event.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  // Obter estatísticas
  const getStats = () => {
    const filtered = getFilteredEvents()
    const today = new Date()
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      total: filtered.length,
      today: filtered.filter(e => e.date === today.toISOString().split('T')[0]).length,
      thisWeek: filtered.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate >= today && eventDate <= thisWeek
      }).length,
      thisMonth: filtered.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
      }).length,
      provas: filtered.filter(e => e.type === 'prova').length,
      aulas: filtered.filter(e => e.type === 'aula').length,
      estudos: filtered.filter(e => e.type === 'estudo').length
    }
  }

  const stats = getStats()
  const upcomingEvents = getUpcomingEvents()
  const todayEvents = getTodayEvents()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString.slice(0, 5)
  }

  const isToday = (dateString) => {
    return dateString === new Date().toISOString().split('T')[0]
  }

  const isPast = (dateString, timeString) => {
    const eventDateTime = new Date(dateString + ' ' + timeString)
    return eventDateTime < new Date()
  }

  // Renderizar visualização em lista
  const renderListView = () => {
    const sortedEvents = getFilteredEvents()
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))

    return (
      <div className="space-y-3">
        {sortedEvents.map((event) => (
          <GradientCard key={event.id} variant="glass" className="p-4 hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                  {getTypeIcon(event.type)}
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={getTypeColor(event.type)}>
                    {event.type === 'studyPlan' ? 'Plano de Estudo' : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                  {isPast(event.date, event.time) && (
                    <Badge variant="secondary">Finalizado</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(event.time)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                {event.type !== 'studyPlan' && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </GradientCard>
        ))}
      </div>
    )
  }

  // Renderizar visualização semanal
  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayString = day.toISOString().split('T')[0]
          const dayEvents = getFilteredEvents().filter(event => event.date === dayString)
          const isSelected = dayString === selectedDate.toISOString().split('T')[0]
          const isCurrentDay = isToday(dayString)

          return (
            <GradientCard 
              key={index} 
              variant={isSelected ? "orange" : "glass"} 
              className={`p-3 cursor-pointer hover-lift ${isCurrentDay ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${isCurrentDay ? 'text-orange-600' : ''}`}>
                  {day.getDate()}
                </div>
                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div 
                      key={eventIndex}
                      className={`text-xs p-1 rounded ${getTypeColor(event.type)} truncate`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            </GradientCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden px-2 sm:px-4 md:px-8 box-border">
      <div className="space-y-6 animate-slide-up">
        {/* Header melhorado */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                Agenda
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Organize suas aulas, provas e prazos com nossa agenda moderna e intuitiva. Mantenha-se sempre organizado.
          </p>
        </div>

        {/* Controles e Filtros melhorados */}
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700 dark:text-orange-400">
              <Filter className="h-5 w-5 mr-2" />
              Controles e Filtros
            </CardTitle>
            <CardDescription>
              Personalize a visualização da sua agenda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Controles de Visualização */}
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="month" className="flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      Mês
                    </TabsTrigger>
                    <TabsTrigger value="week" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Semana
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Lista
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Busca e Filtros */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 text-base"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="aula">Aulas</SelectItem>
                    <SelectItem value="prova">Provas</SelectItem>
                    <SelectItem value="estudo">Estudos</SelectItem>
                    <SelectItem value="prazo">Prazos</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleOpenNewEventDialog}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full max-w-full md:max-w-6xl mx-auto">
          <GradientCard className="text-center p-4 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">
              <AnimatedCounter value={stats.total} />
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </GradientCard>

          <GradientCard className="text-center p-4 hover-lift over:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter value={stats.today} />
            </div>
            <div className="text-xs text-muted-foreground">Hoje</div>
          </GradientCard>

          <GradientCard className="text-center p-4 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              <AnimatedCounter value={stats.thisWeek} />
            </div>
            <div className="text-xs text-muted-foreground">Esta Semana</div>
          </GradientCard>

          <GradientCard className="text-center p-4 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-purple-300 from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              <AnimatedCounter value={stats.thisMonth} />
            </div>
            <div className="text-xs text-muted-foreground">Este Mês</div>
          </GradientCard>

          <GradientCard className="text-center p-4 hover-lift over:shadow-md transition-all duration-200 bg-gradient-red-300 from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-600">
              <AnimatedCounter value={stats.provas} />
            </div>
            <div className="text-xs text-muted-foreground">Provas</div>
          </GradientCard>

          <GradientCard className="text-center p-4 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              <AnimatedCounter value={stats.aulas} />
            </div>
            <div className="text-xs text-muted-foreground">Aulas</div>
          </GradientCard>

          <GradientCard className="text-center p-4 hover-lift over:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter value={stats.estudos} />
            </div>
            <div className="text-xs text-muted-foreground">Estudos</div>
          </GradientCard>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-full md:max-w-6xl mx-auto">
          {/* Área Principal do Calendário */}
          <div className="lg:col-span-3 space-y-6 w-full overflow-x-auto">
            {viewMode === 'month' && (
              <GradientCard className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-orange-600" />
                    Calendário do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{ hasEngagements: getDatesWithEngagements() }}
                    modifiersClassNames={{ hasEngagements: 'day-with-engagement' }}
                  />
                </CardContent>
              </GradientCard>
            )}

            {viewMode === 'week' && (
              <GradientCard className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                      Visualização Semanal
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setDate(selectedDate.getDate() - 7)
                          setSelectedDate(newDate)
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setDate(selectedDate.getDate() + 7)
                          setSelectedDate(newDate)
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderWeekView()}
                </CardContent>
              </GradientCard>
            )}

            {viewMode === 'list' && (
              <GradientCard className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-orange-600" />
                    Lista de Eventos
                  </CardTitle>
                  <CardDescription>
                    {getFilteredEvents().length} evento(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getFilteredEvents().length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">Nenhum evento encontrado</p>
                      <p className="text-muted-foreground text-sm">Tente ajustar os filtros ou criar um novo evento</p>
                    </div>
                  ) : (
                    renderListView()
                  )}
                </CardContent>
              </GradientCard>
            )}

            {/* Eventos do Dia Selecionado (apenas para visualização mensal) */}
            {viewMode === 'month' && (
              <GradientCard className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-orange-600" />
                      {formatDate(selectedDate)}
                    </div>
                    {isToday(selectedDate.toISOString().split('T')[0]) && (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                        Hoje
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {eventsForSelectedDate.length} evento(s) neste dia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Nenhum evento neste dia</p>
                      <Button 
                        onClick={handleOpenNewEventDialog}
                        variant="outline"
                        className="mt-3"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Evento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {eventsForSelectedDate
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((event) => (
                        <GradientCard 
                          key={event.id} 
                          variant={isPast(event.date, event.time) ? "default" : "glass"}
                          className={`p-4 hover-lift ${isPast(event.date, event.time) ? 'opacity-75' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                                {getTypeIcon(event.type)}
                                <h4 className="font-medium">{event.title}</h4>
                                <Badge className={getTypeColor(event.type)}>
                                  {event.type === 'studyPlan' ? 'Plano de Estudo' : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                                {isPast(event.date, event.time) && (
                                  <Badge variant="secondary">Finalizado</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(event.time)}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                )}
                                {event.reminder && (
                                  <div className="flex items-center gap-1">
                                    <Bell className="h-3 w-3" />
                                    {event.reminder}min antes
                                  </div>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {event.type !== 'studyPlan' && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(event.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </GradientCard>
                      ))}
                    </div>
                  )}
                </CardContent>
              </GradientCard>
            )}
          </div>

          {/* Sidebar com Informações */}
          <div className="space-y-6 w-full overflow-x-auto">
            {/* Eventos de Hoje */}
            <GradientCard className="p-4 sm:p-6 over:shadow-md transition-all duration-200 bg-gradient-red-300 from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Zap className="h-5 w-5" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum evento hoje</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(event.type)}
                          <h5 className="font-medium text-sm truncate">{event.title}</h5>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(event.time)}
                        </div>
                      </div>
                    ))}
                    {todayEvents.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{todayEvents.length - 3} mais eventos
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </GradientCard>

            {/* Próximos Eventos */}
            <GradientCard className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                  Próximos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                          {getTypeIcon(event.type)}
                          <h5 className="font-medium text-sm truncate">{event.title}</h5>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('pt-BR', {
                            month: 'short',
                            day: 'numeric'
                          })} às {formatTime(event.time)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </GradientCard>
          </div>
        </div>

        {/* Modal Dialog para Criar/Editar Eventos */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-xs sm:max-w-[600px]" onEscapeKeyDown={handleCancel} onPointerDownOutside={handleCancel}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Faça alterações no seu evento.' : 'Adicione um novo evento à sua agenda.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Aula de Direito Civil"
                    required 
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Input 
                    id="time" 
                    name="time" 
                    type="time" 
                    value={formData.time} 
                    onChange={handleInputChange} 
                    required 
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aula">Aula</SelectItem>
                      <SelectItem value="prova">Prova</SelectItem>
                      <SelectItem value="estudo">Sessão de Estudo</SelectItem>
                      <SelectItem value="prazo">Prazo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Sala 101, Auditório Principal"
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder">Lembrete</Label>
                  <Select value={formData.reminder} onValueChange={(value) => handleSelectChange('reminder', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutos antes</SelectItem>
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="1440">1 dia antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="recurring" 
                    checked={formData.recurring}
                    onCheckedChange={(checked) => handleSelectChange('recurring', checked)}
                  />
                  <Label htmlFor="recurring" className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Evento recorrente
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={3}
                  placeholder="Adicione detalhes sobre o evento..."
                  className="text-base"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingId ? 'Salvar Alterações' : 'Criar Evento'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

