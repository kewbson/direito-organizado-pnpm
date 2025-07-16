import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, Target, Clock, CheckCircle, AlertCircle, Circle, CalendarDays, Filter, Search, BookOpen, Trophy, TrendingUp, Users, FileText, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useData } from '@/contexts/DataContext'
import { StudyPlanViewer } from './StudyPlanViewer'
import { useIsMobile } from '@/hooks/use-mobile'

// Templates de planos de estudo
const STUDY_TEMPLATES = [
  {
    id: 'oab',
    name: 'Preparação OAB',
    description: 'Plano estruturado para o exame da OAB',
    icon: '⚖️',
    subjects: ['Direito Constitucional', 'Direito Civil', 'Direito Penal', 'Direito Processual Civil', 'Direito Processual Penal', 'Direito Administrativo', 'Direito do Trabalho', 'Direito Tributário', 'Ética Profissional'],
    defaultDuration: 90, // dias
    priority: 'alta'
  },
  {
    id: 'concurso',
    name: 'Concurso Público',
    description: 'Preparação para concursos jurídicos',
    icon: '🏛️',
    subjects: ['Direito Constitucional', 'Direito Administrativo', 'Direito Civil', 'Direito Penal', 'Português', 'Raciocínio Lógico'],
    defaultDuration: 120,
    priority: 'alta'
  },
  {
    id: 'graduacao',
    name: 'Graduação - Semestre',
    description: 'Organização de estudos semestrais',
    icon: '🎓',
    subjects: ['Matéria 1', 'Matéria 2', 'Matéria 3', 'Matéria 4'],
    defaultDuration: 120,
    priority: 'media'
  },
  {
    id: 'revisao',
    name: 'Revisão Intensiva',
    description: 'Revisão rápida de conteúdos',
    icon: '📚',
    subjects: ['Matéria Principal'],
    defaultDuration: 30,
    priority: 'alta'
  }
]

export function StudyPlanning() {
  const { studyPlans, addStudyPlan, updateStudyPlan, deleteStudyPlan, notes } = useData()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewingPlan, setViewingPlan] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [showGoals, setShowGoals] = useState(false)
  const isMobile = useIsMobile()

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'media',
    status: 'pendente',
    linkedNotes: [],
    estimatedHours: '',
    tags: []
  })

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('study-goals')
    return saved ? JSON.parse(saved) : {
      weeklyHours: 20,
      monthlyPlans: 4,
      currentWeekHours: 0,
      currentMonthPlans: 0
    }
  })

  // Salvar metas no localStorage
  useEffect(() => {
    localStorage.setItem('study-goals', JSON.stringify(goals))
  }, [goals])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateSelect = (date) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      
      setFormData(prev => ({
        ...prev,
        dueDate: dateString
      }))
    }
  }

  const handleNoteSelection = (noteId) => {
    setFormData(prev => ({
      ...prev,
      linkedNotes: prev.linkedNotes.includes(noteId)
        ? prev.linkedNotes.filter(id => id !== noteId)
        : [...prev.linkedNotes, noteId]
    }))
  }

  const handleTemplateSelect = (template) => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + template.defaultDuration)
    
    setFormData({
      title: template.name,
      subject: template.subjects[0] || '',
      description: template.description,
      dueDate: dueDate.toISOString().split('T')[0],
      priority: template.priority,
      status: 'pendente',
      linkedNotes: [],
      estimatedHours: template.defaultDuration * 2, // 2 horas por dia
      tags: template.subjects.slice(1) // outras matérias como tags
    })
    setShowTemplates(false)
    setIsCreating(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.subject.trim() || !formData.dueDate) {
      return
    }

    const planData = {
      ...formData,
      progress: editingId ? studyPlans.find(p => p.id === editingId)?.progress || 0 : 0,
      createdAt: editingId ? studyPlans.find(p => p.id === editingId)?.createdAt : new Date().toISOString()
    }

    if (editingId) {
      updateStudyPlan(editingId, planData)
      setEditingId(null)
    } else {
      addStudyPlan(planData)
      setIsCreating(false)
      // Atualizar meta de planos mensais
      setGoals(prev => ({
        ...prev,
        currentMonthPlans: prev.currentMonthPlans + 1
      }))
    }

    setFormData({
      title: '',
      subject: '',
      description: '',
      dueDate: '',
      priority: 'media',
      status: 'pendente',
      linkedNotes: [],
      estimatedHours: '',
      tags: []
    })
  }

  const handleEdit = (plan) => {
    setFormData({
      title: plan.title,
      subject: plan.subject,
      description: plan.description || '',
      dueDate: plan.dueDate,
      priority: plan.priority,
      status: plan.status,
      linkedNotes: plan.linkedNotes || [],
      estimatedHours: plan.estimatedHours || '',
      tags: plan.tags || []
    })
    setEditingId(plan.id)
    setIsCreating(true)
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      dueDate: '',
      priority: 'media',
      status: 'pendente',
      linkedNotes: [],
      estimatedHours: '',
      tags: []
    })
    setIsCreating(false)
    setEditingId(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano de estudo?')) {
      deleteStudyPlan(id)
    }
  }

  const handleProgressUpdate = (id, newProgress) => {
    const plan = studyPlans.find(p => p.id === id)
    if (plan) {
      const status = newProgress === 100 ? 'concluido' : newProgress > 0 ? 'em-andamento' : 'pendente'
      updateStudyPlan(id, { progress: newProgress, status })
      
      // Se concluído, atualizar horas semanais estimadas
      if (newProgress === 100 && plan.estimatedHours) {
        setGoals(prev => ({
          ...prev,
          currentWeekHours: prev.currentWeekHours + parseInt(plan.estimatedHours || 0)
        }))
      }
    }
  }

  // Filtrar e ordenar planos
  const filteredAndSortedPlans = studyPlans
    .filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = filterStatus === 'all' || plan.status === filterStatus
      const matchesPriority = filterPriority === 'all' || plan.priority === filterPriority
      
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'subject':
          return a.subject.localeCompare(b.subject)
        case 'priority':
          const priorityOrder = { 'alta': 3, 'media': 2, 'baixa': 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'progress':
          return b.progress - a.progress
        case 'dueDate':
        default:
          return new Date(a.dueDate) - new Date(b.dueDate)
      }
    })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'baixa': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'em-andamento': return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'pendente': return <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      default: return <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  const isOverdue = (dueDate, status) => {
    return status !== 'concluido' && new Date(dueDate) < new Date()
  }

  const stats = {
    total: studyPlans.length,
    concluidos: studyPlans.filter(p => p.status === 'concluido').length,
    emAndamento: studyPlans.filter(p => p.status === 'em-andamento').length,
    pendentes: studyPlans.filter(p => p.status === 'pendente').length,
    atrasados: studyPlans.filter(p => isOverdue(p.dueDate, p.status)).length
  }

  // Funções para o calendário
  const getPlansForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return studyPlans.filter(plan => plan.dueDate === dateString)
  }

  const getDatesWithPlans = () => {
    return studyPlans.map(plan => new Date(plan.dueDate.replace(/-/g, '\/')))
  }

  const getSelectedDatePlans = () => {
    if (!selectedDate) return []

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    return studyPlans.filter(plan => plan.dueDate === dateString)
  }

  return (
    <div className="space-y-6">
      {/* Header melhorado */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Planejamento de Estudos
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Organize seus estudos, defina metas e acompanhe seu progresso de forma inteligente. Crie planos estruturados e alcance seus objetivos.
        </p>
      </div>

      {/* Barra de ações melhorada */}
      <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
            <Target className="h-5 w-5 mr-2" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Crie novos planos ou gerencie suas metas de estudo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </Button>

              <Button 
                variant="outline"
                onClick={() => setShowGoals(!showGoals)}
                className="bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Metas
                {goals.currentWeekHours > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {goals.currentWeekHours}h
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filtros e busca */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 bg-white dark:bg-gray-800"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="p-2">
                <Label className="text-xs font-medium">Prioridade</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="p-2">
                <Label className="text-xs font-medium">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Data Limite</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="subject">Matéria</SelectItem>
                    <SelectItem value="priority">Prioridade</SelectItem>
                    <SelectItem value="progress">Progresso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>

      {/* Modal de Templates */}
      {showTemplates && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates de Planos de Estudo
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                ✕
              </Button>
            </div>
            <CardDescription>
              Escolha um template para começar rapidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STUDY_TEMPLATES.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-muted hover:border-orange-300 dark:hover:border-orange-700"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(template.priority)}>
                            {template.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.defaultDuration} dias
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Painel de Metas */}
      {showGoals && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Metas de Estudo
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGoals(false)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Meta Semanal de Horas</Label>
                    <span className="text-sm text-muted-foreground">
                      {goals.currentWeekHours}/{goals.weeklyHours}h
                    </span>
                  </div>
                  <Progress 
                    value={(goals.currentWeekHours / goals.weeklyHours) * 100} 
                    className="h-2"
                  />
                  <Input
                    type="number"
                    value={goals.weeklyHours}
                    onChange={(e) => setGoals(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                    className="mt-2"
                    min="1"
                    max="168"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Meta Mensal de Planos</Label>
                    <span className="text-sm text-muted-foreground">
                      {goals.currentMonthPlans}/{goals.monthlyPlans}
                    </span>
                  </div>
                  <Progress 
                    value={(goals.currentMonthPlans / goals.monthlyPlans) * 100} 
                    className="h-2"
                  />
                  <Input
                    type="number"
                    value={goals.monthlyPlans}
                    onChange={(e) => setGoals(prev => ({ ...prev, monthlyPlans: parseInt(e.target.value) || 0 }))}
                    className="mt-2"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGoals(prev => ({ ...prev, currentWeekHours: 0 }))}
              >
                Resetar Semana
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGoals(prev => ({ ...prev, currentMonthPlans: 0 }))}
              >
                Resetar Mês
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renderiza o StudyPlanViewer se um plano estiver selecionado para visualização */}
      {viewingPlan && (
        <StudyPlanViewer
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          onEdit={(planToEdit) => {
            setViewingPlan(null)
            handleEdit(planToEdit)
          }}
          onDelete={(planToDelete) => handleDelete(planToDelete.id)}
        />
      )}

      {/* Estatísticas melhoradas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary dark:text-primary/90">{stats.total}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="over:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.concluidos}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Concluídos</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-yellow-300 from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.emAndamento}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Em Andamento</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-purple-300 from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-500">{stats.pendentes}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-red-300 from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-600">{stats.atrasados}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Atrasados</div>
          </CardContent>
        </Card>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {filteredAndSortedPlans.length > 0 ? (
            <span className="flex items-center gap-2">
              Mostrando {filteredAndSortedPlans.length} plano(s)
              {filteredAndSortedPlans.length !== studyPlans.length && 
                ` de ${studyPlans.length} total`
              }
              {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
                <Badge variant="outline" className="text-xs">
                  Filtrado
                </Badge>
              )}
            </span>
          ) : (
            <span>Nenhum plano encontrado</span>
          )}
        </div>
      </div>

      {/* Tabs para Lista e Calendário */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-center">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Lista de Planos
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Formulário de criação/edição melhorado */}
          {isCreating && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingId ? 'Editar Plano de Estudo' : 'Novo Plano de Estudo'}
                </CardTitle>
                <CardDescription>
                  {editingId ? 'Modifique as informações do seu plano' : 'Crie um novo plano de estudos personalizado'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Ex: Direito Civil - Contratos"
                        required
                        className="focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Matéria *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Ex: Direito Civil"
                        required
                        className="focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Limite *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {formData.dueDate ? formatDate(formData.dueDate) : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                            onSelect={handleDateSelect}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <RadioGroup
                        value={formData.priority}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="baixa" id="baixa" />
                          <Label htmlFor="baixa" className="text-sm">Baixa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="media" id="media" />
                          <Label htmlFor="media" className="text-sm">Média</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="alta" id="alta" />
                          <Label htmlFor="alta" className="text-sm">Alta</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedHours">Horas Estimadas</Label>
                      <Input
                        id="estimatedHours"
                        name="estimatedHours"
                        type="number"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                        placeholder="Ex: 40"
                        min="1"
                        className="focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descreva os tópicos que serão estudados, metodologia, recursos necessários..."
                      rows={3}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  {/* Vinculação com anotações do Caderno Digital */}
                  {notes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Vincular Anotações do Caderno Digital</Label>
                      <div className="max-h-40 overflow-y-auto border border-muted rounded-md p-3 space-y-2 bg-muted/30">
                        {notes.map((note) => (
                          <div key={note.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`note-${note.id}`}
                              checked={formData.linkedNotes.includes(note.id)}
                              onChange={() => handleNoteSelection(note.id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor={`note-${note.id}`} className="flex-1 text-sm cursor-pointer">
                              <span className="font-medium">{note.title}</span>
                              <span className="text-muted-foreground ml-2">({note.subject})</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      {formData.linkedNotes.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {formData.linkedNotes.length} anotação(ões) selecionada(s)
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                      {editingId ? 'Salvar Alterações' : 'Criar Plano'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de planos melhorada */}
          {filteredAndSortedPlans.length === 0 ? (
            <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {studyPlans.length === 0 ? 'Nenhum plano de estudo criado' : 'Nenhum plano encontrado'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {studyPlans.length === 0 
                    ? 'Comece criando seu primeiro plano de estudos ou use um template'
                    : 'Tente ajustar os filtros ou termo de busca'
                  }
                </p>
                {studyPlans.length === 0 && (
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => setIsCreating(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeiro plano
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowTemplates(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Templates
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
                    isOverdue(plan.dueDate, plan.status) 
                      ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30' 
                      : plan.status === 'concluido'
                      ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30'
                      : plan.status === 'em-andamento'
                      ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'
                      : 'border-l-gray-300 dark:border-l-gray-600 hover:border-l-orange-500 dark:hover:border-l-orange-400'
                  }`}
                  onClick={() => setViewingPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(plan.status)}
                          <CardTitle className="text-lg">{plan.title}</CardTitle>
                          {isOverdue(plan.dueDate, plan.status) && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              Atrasado
                            </Badge>
                          )}
                          {plan.estimatedHours && (
                            <Badge variant="outline" className="text-xs">
                              {plan.estimatedHours}h
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">{plan.subject}</Badge>
                          <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(plan.dueDate)}
                          </div>
                          {plan.linkedNotes && plan.linkedNotes.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {plan.linkedNotes.length} nota(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleEdit(plan); }}
                          className="hover:bg-orange-100 dark:hover:bg-orange-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {plan.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{plan.description}</p>
                    )}
                    
                    {/* Progress melhorado */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Progresso
                        </span>
                        <span className="text-sm text-muted-foreground">{plan.progress}%</span>
                      </div>
                      <Progress 
                        value={plan.progress} 
                        className="h-2"
                      />
                      <div className="flex space-x-2">
                        {[0, 25, 50, 75, 100].map((value) => (
                          <Button
                            key={value}
                            size="sm"
                            variant={plan.progress === value ? "default" : "outline"}
                            onClick={(e) => { e.stopPropagation(); handleProgressUpdate(plan.id, value); }}
                            className={`text-xs ${
                              plan.progress === value 
                                ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700' 
                                : 'hover:bg-orange-100 dark:hover:bg-orange-900/20'
                            }`}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendário melhorado */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Calendário de Estudos
                  </CardTitle>
                  <CardDescription>
                    Clique em uma data para ver os planos de estudo programados
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasPlans: getDatesWithPlans(),
                      selectedDay: selectedDate,
                      today: new Date(),
                    }}
                    modifiersStyles={{
                      hasPlans: {
                        backgroundColor: 'rgb(234 88 12)', // orange-600
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '0.25rem',
                      },
                      selectedDay: {
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)',
                        border: '2px solid var(--ring)',
                        fontWeight: 'bold',
                        borderRadius: '0.5rem',
                      },
                      today: {
                        backgroundColor: 'var(--foreground)',
                        color: 'var(--background)',
                        border: '2px solid var(--border)',
                        fontWeight: 'bold',
                        borderRadius: '0.5rem',
                      },
                    }}
                    classNames={{
                      day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      day_today: "bg-foreground text-background border border-border",
                      day_hasPlans: "bg-orange-600 text-white hover:bg-orange-700",
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Planos da data selecionada melhorados */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                  </CardTitle>
                  {getSelectedDatePlans().length > 0 && (
                    <CardDescription>
                      {getSelectedDatePlans().length} plano(s) programado(s)
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {getSelectedDatePlans().length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Nenhum plano de estudo programado para esta data
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => {
                          const dateString = selectedDate.toISOString().split('T')[0]
                          setFormData(prev => ({ ...prev, dueDate: dateString }))
                          setIsCreating(true)
                          setActiveTab('list')
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar plano para esta data
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSelectedDatePlans().map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                            isOverdue(plan.dueDate, plan.status)
                              ? 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-400 dark:bg-red-950 dark:hover:bg-red-900'
                              : 'border-muted bg-muted/30 hover:bg-muted/50 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                          onClick={() => setViewingPlan(plan)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(plan.status)}
                              <h4 className="font-medium text-sm">
                                {plan.title}
                              </h4>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); handleEdit(plan); }}
                              className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {plan.subject}
                            </Badge>
                            <Badge className={`${getPriorityColor(plan.priority)} text-xs`}>
                              {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                            </Badge>
                            {isOverdue(plan.dueDate, plan.status) && (
                              <Badge variant="destructive" className="text-xs">
                                Atrasado
                              </Badge>
                            )}
                            {plan.estimatedHours && (
                              <Badge variant="outline" className="text-xs">
                                {plan.estimatedHours}h
                              </Badge>
                            )}
                          </div>

                          {plan.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {plan.description}
                            </p>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Progresso</span>
                              <span className="text-xs text-muted-foreground">{plan.progress}%</span>
                            </div>
                            <Progress
                              value={plan.progress}
                              className="h-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

