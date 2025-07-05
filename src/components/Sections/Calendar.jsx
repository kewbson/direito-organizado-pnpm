import { useState, useEffect } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, BookOpen, AlertCircle, CheckCircle, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/contexts/DataContext'

export function Calendar() {
  const { events, studyPlans, addEvent, updateEvent, deleteEvent } = useData()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allEngagements, setAllEngagements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'aula',
    description: ''
  })
  
  // Esta função cria um array de objetos Date para os dias que têm compromissos
  const getDatesWithEngagements = () => {
    if (!allEngagements) return [];
    
    // Usamos um Set para evitar datas duplicadas
    const dates = new Set();
    allEngagements.forEach(engagement => {
      // O .replace(/-/g, '\/') é um truque para garantir que a data seja interpretada no fuso horário local,
      // evitando que o dia mude por causa do UTC.
      dates.add(new Date(engagement.date.replace(/-/g, '\/')));
    });
    
    return Array.from(dates);
  };
  
  // Este useEffect combina eventos e planos de estudo em uma única lista
  useEffect(() => {
    // 1. Transforma os planos de estudo em um formato de "evento" para a agenda
    const planEvents = studyPlans.map(plan => ({
      id: `plan-${plan.id}`, // Adiciona um prefixo para evitar conflitos de ID
      title: `Prazo: ${plan.title}`, // Adiciona um prefixo no título para clareza
      date: plan.dueDate,
      time: '23:59', // Prazos são considerados no final do dia
      type: 'studyPlan', // Tipo especial para diferenciação visual
      originalPlan: plan, // Guarda o plano original para futuras interações
    }));

    // 2. Junta os eventos normais com os prazos dos planos
    const combinedEngagements = [...events, ...planEvents];

    // 3. Atualiza nosso novo estado com a lista combinada
    setAllEngagements(combinedEngagements);
  }, [events, studyPlans]); // Esta função roda sempre que 'events' ou 'studyPlans' mudarem

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleCancel = () => {
    setFormData({ title: '', date: '', time: '', type: 'aula', description: '' });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      description: event.description || ''
    });
    setEditingId(event.id);
    setIsDialogOpen(true);
  };

  // Abre o modal para um novo evento, já com a data selecionada no calendário
  const handleOpenNewEventDialog = () => {
    const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      date: dateString,
      time: '',
      type: 'aula',
      description: ''
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date || !formData.time) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    let result;
    if (editingId) {
      result = await updateEvent(editingId, formData);
    } else {
      result = await addEvent(formData);
    }

    if (result && result.success) {
      handleCancel(); // Limpa o formulário e fecha o modal
    } else {
      alert("Ocorreu um erro ao salvar o evento.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      // Verifica se o ID pertence a um evento normal antes de deletar
      if (!id.startsWith('plan-')) {
        deleteEvent(id);
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'prova': return 'bg-red-100 text-red-800'
      case 'aula': return 'bg-blue-100 text-blue-800'
      case 'estudo': return 'bg-green-100 text-green-800'
      case 'prazo': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'prova': return <AlertCircle className="h-4 w-4" />
      case 'aula': return <BookOpen className="h-4 w-4" />
      case 'estudo': return <CheckCircle className="h-4 w-4" />
      case 'prazo': return <Clock className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  // Filtrar eventos por data selecionada
  const eventsForSelectedDate = allEngagements.filter(event => {
    if (!selectedDate || !event.date) return false;
    
    // Converte a data selecionada (objeto Date) para o formato de string "YYYY-MM-DD"
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    
    // Compara com a data do evento (que também está como "YYYY-MM-DD")
    return event.date === selectedDateString;
  });
    


  // Obter próximos eventos (próximos 7 dias a partir de hoje)
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingEvents = allEngagements.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= today && eventDate <= nextWeek
  }).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))

  // Obter os 2 próximos eventos mais próximos da data atual
  const getNextTwoEvents = () => {
    const now = new Date()
    return events.filter(event => {
      const eventDateTime = new Date(event.date + ' ' + event.time)
      return eventDateTime >= now
    }).sort((a, b) => {
      const dateTimeA = new Date(a.date + ' ' + a.time)
      const dateTimeB = new Date(b.date + ' ' + b.time)
      return dateTimeA - dateTimeB
    }).slice(0, 2)
  }

  const nextTwoEvents = getNextTwoEvents()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString.slice(0, 5) // Remove seconds if present
  }

  const isToday = (dateString) => {
    return dateString === new Date().toISOString().split('T')[0]
  }

  const isPast = (dateString, timeString) => {
    const eventDateTime = new Date(dateString + ' ' + timeString)
    return eventDateTime < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
          <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
        <div>
            <div className="flex items-center justify-center gap-3">
      <CalendarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <h1 className="text-center text-3xl font-bold text-orange-600 dark:text-orange-400">
            Agenda
          </h1>
             </div>
          <p className="text-muted-foreground text-lg text-center">
            Organize suas aulas, provas e prazos
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
<Button 
  onClick={handleOpenNewEventDialog}
  className="bg-primary hover:bg-primary/90 mt-4"
>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>
              </div>
{/* Modal Dialog para Criar/Editar Eventos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]" onEscapeKeyDown={handleCancel} onPointerDownOutside={handleCancel}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Faça alterações no seu evento.' : 'Adicione um novo evento à sua agenda.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" name="time" type="time" value={formData.time} onChange={handleInputChange} required />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type" name="type" value={formData.type} onChange={handleInputChange}
                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="aula">Aula</option>
                <option value="prova">Prova</option>
                <option value="estudo">Sessão de Estudo</option>
                <option value="prazo">Prazo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
              <Button type="submit">{editingId ? 'Salvar Alterações' : 'Criar Evento'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seletor de Data e Eventos do Dia */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-center"><CalendarIcon className="h-5 w-5 mr-2" />Selecione um dia</CardTitle>
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
          </Card>

         

          {/* Eventos do Dia Selecionado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {formatDate(selectedDate)}
                {isToday(selectedDate) && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800">Hoje</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {eventsForSelectedDate.length} evento(s) neste dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum evento neste dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventsForSelectedDate
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((event) => (
                    <div 
  key={event.id} 
  className={`p-4 border rounded-lg transition-colors ${
    isPast(event.date, event.time) ? 'bg-muted/50' : 'bg-card'
  }`}
>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
{event.type === 'studyPlan' ? (
  // Se for um Prazo de Plano de Estudo
  <>
    <Target className="h-4 w-4 text-purple-600" /> {/* Ícone de Alvo */}
    <h4 className="font-medium">{event.title}</h4>
    <Badge className="bg-purple-100 text-purple-800">
      Plano de Estudo
    </Badge>
  </>
) : (
  // Se for um Evento Normal (lógica que já existia)
  <>
    {getTypeIcon(event.type)}
    <h4 className="font-medium">{event.title}</h4>
    <Badge className={getTypeColor(event.type)}>
      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
    </Badge>
  </>
)}
                            {isPast(event.date, event.time) && (
                              <Badge variant="secondary">Finalizado</Badge>
                            )}
                          </div>
<div className="flex items-center text-sm text-muted-foreground mb-2">
  <Clock className="h-3 w-3 mr-1" />
  {formatTime(event.time)}
</div>
{event.description && (
  <p className="text-sm text-muted-foreground">{event.description}</p>
)}
                        </div>
                        <div className="flex space-x-1">
  {event.type !== 'studyPlan' && (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleEdit(event)}
      >
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Próximos Eventos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>
                Os 2 eventos mais próximos da data atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextTwoEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nextTwoEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(event.type)}
                        <h5 className="font-medium text-sm">{event.title}</h5>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          month: 'short',
                          day: 'numeric'
                        })} às {formatTime(event.time)}
                      </div>
                      <Badge className={`${getTypeColor(event.type)} text-xs mt-1`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Total de Eventos</span>
                </div>
                <span className="font-medium">{allEngagements.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Provas</span>
                </div>
                <span className="font-medium">
                  {events.filter(e => e.type === 'prova').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Aulas</span>
                </div>
                <span className="font-medium">
                  {events.filter(e => e.type === 'aula').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Próximos 7 dias</span>
                </div>
                <span className="font-medium">{upcomingEvents.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

