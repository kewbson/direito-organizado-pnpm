import { useState } from 'react'
import { Plus, Edit, Trash2, Calendar, Target, Clock, CheckCircle, AlertCircle, Circle, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { useData } from '@/contexts/DataContext'
import { StudyPlanViewer } from './StudyPlanViewer';

export function StudyPlanning() {
  const { studyPlans, addStudyPlan, updateStudyPlan, deleteStudyPlan, notes } = useData()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewingPlan, setViewingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'media',
    status: 'pendente',
    linkedNotes: []
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNoteSelection = (noteId) => {
    setFormData(prev => ({
      ...prev,
      linkedNotes: prev.linkedNotes.includes(noteId)
        ? prev.linkedNotes.filter(id => id !== noteId)
        : [...prev.linkedNotes, noteId]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.subject.trim() || !formData.dueDate) {
      return
    }

    const planData = {
      ...formData,
      progress: editingId ? studyPlans.find(p => p.id === editingId)?.progress || 0 : 0
    }

    if (editingId) {
      updateStudyPlan(editingId, planData)
      setEditingId(null)
    } else {
      addStudyPlan(planData)
      setIsCreating(false)
    }

    setFormData({
      title: '',
      subject: '',
      description: '',
      dueDate: '',
      priority: 'media',
      status: 'pendente'
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
      linkedNotes: plan.linkedNotes || []
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
      linkedNotes: []
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
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'em-andamento': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'pendente': return <Circle className="h-4 w-4 text-gray-400" />
      default: return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

const formatDate = (dateString) => {
    // Adiciona { timeZone: 'UTC' } para que a data não seja deslocada pelo fuso horário local.
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

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
    // Substituir hifens por barras força o JavaScript a interpretar a data no fuso horário local, e não em UTC.
    return studyPlans.map(plan => new Date(plan.dueDate.replace(/-/g, '\/')))
  }

  const getSelectedDatePlans = () => {
    if (!selectedDate) return [];

    // Constrói a data no formato YYYY-MM-DD a partir da data local para evitar problemas de fuso horário.
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // getMonth() é 0-indexed
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    return studyPlans.filter(plan => plan.dueDate === dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
          <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
        <div>
        <div className="flex items-center justify-center gap-3">
      <CalendarDays className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <h1 className="text-center text-3xl font-bold text-orange-600 dark:text-orange-400">
            Planejamento de Estudos
          </h1>
            </div>
            <p className="text-muted-foreground text-lg text-center">
          Organize seus estudos e acompanhe seu progresso
        </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
                  <Button 
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-primary/90 mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>
              </div>
              
{/* Renderiza o StudyPlanViewer se um plano estiver selecionado para visualização */}
      {viewingPlan && (
        <StudyPlanViewer
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          onEdit={(planToEdit) => {
            setViewingPlan(null); // Fecha o visualizador
            handleEdit(planToEdit); // Abre o formulário de edição
          }}
          onDelete={(planToDelete) => handleDelete(planToDelete.id)} // Passa a função de deleção
        />
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary hover:primary/90">{stats.total}</div>
            <div className="text-xs md:text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.concluidos}</div>
            <div className="text-xs md:text-sm text-gray-600">Concluídos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.emAndamento}</div>
            <div className="text-xs md:text-sm text-gray-600">Em Andamento</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-gray-600">{stats.pendentes}</div>
            <div className="text-xs md:text-sm text-gray-600">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-red-600">{stats.atrasados}</div>
            <div className="text-xs md:text-sm text-gray-600">Atrasados</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Lista e Calendário */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Lista de Planos
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Visualizar em Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Formulário de criação/edição */}
          {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Plano de Estudo' : 'Novo Plano de Estudo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Direito Civil - Contratos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Matéria</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Ex: Direito Civil"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data Limite</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva os tópicos que serão estudados..."
                  rows={3}
                />
              </div>
              
              {/* Vinculação com anotações do Caderno Digital */}
              {notes.length > 0 && (
                <div className="space-y-2">
                  <Label>Vincular Anotações do Caderno Digital</Label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`note-${note.id}`}
                          checked={formData.linkedNotes.includes(note.id)}
                          onChange={() => handleNoteSelection(note.id)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor={`note-${note.id}`} className="flex-1 text-sm cursor-pointer">
                          <span className="font-medium">{note.title}</span>
                          <span className="text-gray-500 ml-2">({note.subject})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.linkedNotes.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {formData.linkedNotes.length} anotação(ões) selecionada(s)
                    </p>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
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

      {/* Lista de planos */}
      {studyPlans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium bgprimary hover:primary/900 mb-2">
              Nenhum plano de estudo criado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando seu primeiro plano de estudos
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="primary hover:primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro plano
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {studyPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${ // Adicionado cursor-pointer
                isOverdue(plan.dueDate, plan.status) ? 'border-red-200 bg-red-50' : ''
              }`}
              onClick={() => setViewingPlan(plan)} // <-- ADICIONADO onClick aqui
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(plan.status)}
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      {isOverdue(plan.dueDate, plan.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary">{plan.subject}</Badge>
                      <Badge className={getPriorityColor(plan.priority)}>
                        {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(plan.dueDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {/* Estes botões precisam de e.stopPropagation() */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleEdit(plan); }} 
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {plan.description && (
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                )}
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-gray-500">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                  <div className="flex space-x-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={plan.progress === value ? "default" : "outline"}
                        onClick={() => handleProgressUpdate(plan.id, value)}
                        className="text-xs"
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
            {/* Calendário */}
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
                      hasPlans: { // Indicador para dias com planos
                        backgroundColor: 'oklch(0.646 0.222 41.116)', // Laranja vibrante (Chart-1 do seu tema)
                        color: 'white', // Texto branco fixo
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
                        backgroundColor: 'var(--foreground)', // foreground do tema
                        color: 'var(--background)', // background do tema
                        border: '2px solid var(--border)', // borda sutil
                        fontWeight: 'bold',
                        borderRadius: '0.5rem',
                      },
                    }}
                    // Adiciona classes para o dia selecionado para que o tailwind possa aplicar
                    classNames={{
                      day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      day_today: "bg-foreground text-background border border-border",
                      day_hasPlans: "bg-orange-600 text-white", // <-- ADICIONE ESTA LINHA OU AJUSTE
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Planos da data selecionada */}
<div className="lg:col-span-1">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">
        Planos para {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {getSelectedDatePlans().length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nenhum plano de estudo programado para esta data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {getSelectedDatePlans().map((plan) => (
            <div
              key={plan.id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  isOverdue(plan.dueDate, plan.status)
                    ? 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-400 dark:bg-red-950 dark:hover:bg-red-900'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
                }`}
                onClick={() => setViewingPlan(plan)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(plan.status)}
                  <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                    {plan.title}
                  </h4>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleEdit(plan); }} // <-- Adicionado e.stopPropagation()
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </Button>
                </div>
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
              </div>

              {plan.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {plan.description}
                </p>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-100">Progresso</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{plan.progress}%</span>
                </div>
                <Progress
                  value={plan.progress}
                  className="h-1 bg-gray-200 dark:bg-gray-700 [&>*]:bg-primary"
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

