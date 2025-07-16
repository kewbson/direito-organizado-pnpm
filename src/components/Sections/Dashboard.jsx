import { useState, useEffect } from 'react'
import { Calendar, BookOpen, Target, TrendingUp, FileText, Play, CalendarDays, Clock, Award, BarChart3, PieChart, Activity, Bell, Filter, ChevronRight, Users, Zap, Star, CheckCircle, AlertCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/contexts/DataContext'
import { PieChart as RechartsPieChart, Cell, Tooltip, ResponsiveContainer, Pie } from 'recharts'


const motivationalQuotes = [
"Aprendei a fazer o bem; buscai a justiça, livrai o oprimido. Isaías 1:17", "Defende o direito do pobre e do órfão; faz justiça ao aflito e ao necessitado. Salmo 82:3", "O Senhor ama a justiça e não desampara os seus santos. Salmo 37:28", "Bem-aventurados os que têm fome e sede de justiça, porque serão fartos. Mateus 5:6", "O justo juiz governa a terra e eleva os humildes, mas destrói os ímpios. Salmo 75:7", "Seja feita a tua vontade, assim na terra como no céu. Mateus 6:10", "A lei do Senhor é perfeita, restaura a alma. Salmo 19:7", "O Senhor é justo em todos os seus caminhos e bondoso em todas as suas obras. Salmo 145:17", "Fazendo justiça ao órfão e à viúva, amando o estrangeiro. Deuteronômio 10:18", "A justiça é a base do teu trono, o amor e a fidelidade vão diante de ti. Salmo 89:14", "Os juízos do Senhor são verdadeiros, todos igualmente justos. Salmo 19:9", "O Senhor dará a vitória ao justo, ele será o seu escudo e defensor. Salmo 37:6", "A justiça exalta as nações, mas o pecado é o opróbrio dos povos. Provérbios 14:34", "A justiça que vem de Deus é revelada pela fé em Jesus Cristo para todos os que creem. Romanos 3:22", "Buscai a paz e a prosperidade da cidade para onde vos fiz transportar. Jeremias 29:7", "Onde não há conselho, o povo cai; mas na multidão de conselheiros há segurança. Provérbios 11:14", "Não retardeis o bem aos seus donos, estando nas tuas mãos fazê-lo. Provérbios 3:27", "Se alguém não cuida dos seus, especialmente dos de sua própria casa, negou a fé. 1 Timóteo 5:8", "Melhor é o pouco com justiça do que a abundância de bens com injustiça. Provérbios 16:8", "O juízo do Senhor é verdadeiro e justo. Salmo 19:9", "O Senhor é justo em todos os seus caminhos, e é benigno em todas as suas obras. Salmo 145:17", "A boca do justo é manancial de vida, mas a violência cobre a boca dos ímpios. Provérbios 10:11", "Feliz o homem que teme ao Senhor e anda nos seus caminhos. Salmo 128:1", "O Senhor sabe livrar da provação os piedosos. 2 Pedro 2:9", "Onde não há visão, o povo perece. Provérbios 29:18", "O Senhor levanta os que estão caídos e endireita os que estão tortuosos. Salmo 146:8", "Ninguém será justificado diante de Deus pelas obras da lei. Romanos 3:20", "Não há acepção de pessoas diante de Deus. Romanos 2:11", "Os olhos do Senhor estão sobre os justos e os seus ouvidos atentos ao seu clamor. 1 Pedro 3:12", "A boca do justo exala sabedoria, e a sua língua fala o que é reto. Salmo 37:30", "O Senhor é o refúgio do oprimido, uma torre segura na hora da angústia. Salmo 9:9", "A misericórdia e a verdade se encontram; a justiça e a paz se beijam. Salmo 85:10", "O que anda em integridade anda seguro, mas o que perverte os seus caminhos será conhecido. Provérbios 10:9", "O Senhor é justiça, ele faz o que é certo. 2 Crônicas 9:8", "O Senhor conhece o caminho dos justos, mas o caminho dos ímpios perecerá. Salmo 1:6", "Quem anda com os sábios será sábio, mas o companheiro dos tolos sofrerá. Provérbios 13:20", "Os olhos do Senhor estão sobre os justos, e seus ouvidos atentos ao seu clamor. Salmo 34:15", "Onde não há juízes fiéis, os pobres são oprimidos. Isaías 10:2", "O Senhor não retarda a sua promessa, como alguns a julgam demorada. 2 Pedro 3:9", "O que semeia a injustiça colherá a opressão. Provérbios 22:8", "O justo é liberto da angústia, mas o ímpio chega ao seu fim. Provérbios 11:8", "A sabedoria é a principal coisa; adquire a sabedoria, e com todos os bens adquiridos, adquire o entendimento. Provérbios 4:7", "A boa fama vale mais que riquezas. Provérbios 22:1", "Os pobres são oprimidos, mas o Senhor livra da opressão os que nele confiam. Salmo 12:5", "O Senhor defende os direitos dos aflitos. Salmo 103:6", "O que anda em retidão e em integridade será salvo, mas o ímpio será derrubado. Provérbios 28:18", "A boca do justo fala sabedoria, e a sua língua diz o que é reto. Salmo 37:30", "Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei. Mateus 11:28", "Os que semeiam com lágrimas, com júbilo ceifarão. Salmo 126:5", "A justiça será a cinta dos seus lombos, e a fidelidade o cinto dos seus rins. Isaías 11:5"
]

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa']

export function Dashboard({ onSectionChange }) {
  const [currentQuote, setCurrentQuote] = useState('')
  const [timeFilter, setTimeFilter] = useState('week')
  const [activeTab, setActiveTab] = useState('overview')
  const { notes, events, studyPlans } = useData()

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentQuote(randomQuote)
  }, [])

  // Função para filtrar dados por período
  const filterByPeriod = (items, dateField, period) => {
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    return items.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= startDate && itemDate <= now
    })
  }

  // Calcular próximos eventos
  const getUpcomingEvents = () => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= today && eventDate <= nextWeek
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // Calcular anotações recentes
  const getRecentNotes = () => {
    return filterByPeriod(notes, 'lastModified', timeFilter)
      .sort((a, b) => new Date(b.lastModified || b.date) - new Date(a.lastModified || a.date))
  }

  // Calcular metas do período
  const getGoalsForPeriod = () => {
    const filteredPlans = filterByPeriod(studyPlans, 'dueDate', timeFilter)
    const completedPlans = filteredPlans.filter(plan => plan.status === 'concluido')
    
    return {
      total: filteredPlans.length,
      completed: completedPlans.length,
      inProgress: filteredPlans.filter(plan => plan.status === 'em-andamento').length,
      pending: filteredPlans.filter(plan => plan.status === 'pendente').length
    }
  }

  // Calcular progresso geral
  const getOverallProgress = () => {
    const filteredPlans = filterByPeriod(studyPlans, 'dueDate', timeFilter)
    if (filteredPlans.length === 0) return 0
    
    const totalProgress = filteredPlans.reduce((sum, plan) => sum + (plan.progress || 0), 0)
    return Math.round(totalProgress / filteredPlans.length)
  }


  // Dados para gráfico de pizza (distribuição por matéria)
  const getSubjectDistribution = () => {
    const subjects = {}
    notes.forEach(note => {
      subjects[note.subject] = (subjects[note.subject] || 0) + 1
    })
    
    return Object.entries(subjects)
      .map(([subject, count]) => ({ name: subject, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  // Estatísticas de produtividade
  const getProductivityStats = () => {
    const thisWeek = filterByPeriod([...notes, ...studyPlans], 'lastModified', 'week').length
    const lastWeek = filterByPeriod([...notes, ...studyPlans], 'lastModified', 'week').length // Simplificado para demo
    
    const weeklyGrowth = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100) : 0
    
    return {
      thisWeek,
      weeklyGrowth: Math.round(weeklyGrowth),
      streak: 3, // Simplificado para demo
      totalHours: studyPlans.reduce((sum, plan) => sum + parseInt(plan.estimatedHours || 0), 0)
    }
  }

  const upcomingEvents = getUpcomingEvents()
  const recentNotes = getRecentNotes()
  const goals = getGoalsForPeriod()
  const overallProgress = getOverallProgress()
  const subjectData = getSubjectDistribution()
  const productivityStats = getProductivityStats()

  // Atividades recentes melhoradas
  const getRecentActivities = () => {
    const activities = []
    
    // Adicionar eventos recentes
    upcomingEvents.slice(0, 3).forEach(event => {
      activities.push({
        type: 'event',
        title: event.title,
        description: `Evento agendado para ${new Date(event.date).toLocaleDateString('pt-BR')}`,
        time: event.date,
        icon: Calendar,
        color: 'blue',
        priority: 'high'
      })
    })
    
    // Adicionar anotações recentes
    recentNotes.slice(0, 3).forEach(note => {
      activities.push({
        type: 'note',
        title: note.title,
        description: `Anotação em ${note.subject}`,
        time: note.lastModified || note.date,
        icon: BookOpen,
        color: 'green',
        priority: 'medium'
      })
    })

    // Adicionar planos recentes
    studyPlans.slice(0, 2).forEach(plan => {
      activities.push({
        type: 'plan',
        title: plan.title,
        description: `Plano de ${plan.subject} - ${plan.progress}% concluído`,
        time: plan.createdAt || plan.dueDate,
        icon: Target,
        color: 'orange',
        priority: plan.priority === 'alta' ? 'high' : 'medium'
      })
    })
    
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
  }

  const recentActivities = getRecentActivities()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'em-andamento': return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'pendente': return <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      default: return <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header melhorado */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Meu Painel
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Acompanhe seu progresso, visualize estatísticas detalhadas e mantenha-se motivado em sua jornada de estudos.
        </p>
      </div>

      {/* Filtro de período */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Quick Access Card melhorado */}
      <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-400 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700 dark:text-orange-400">
            <Zap className="h-5 w-5 mr-2" />
            Acesso Rápido
          </CardTitle>
          <CardDescription>
            Ações rápidas para impulsionar seus estudos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button 
            onClick={() => onSectionChange && onSectionChange('notebook')}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer group"
          >
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Nova Anotação</span>
          </button>
          
          <button 
            onClick={() => onSectionChange && onSectionChange('vademecum')}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer group"
          >
            <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Vade Mecum</span>
          </button>
          
          <button 
            onClick={() => onSectionChange && onSectionChange('planning')}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer group"
          >
            <CalendarDays className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Novo Plano</span>
          </button>
          
          <button 
            onClick={() => onSectionChange && onSectionChange('calendar')}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer group"
          >
            <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Agenda</span>
          </button>
          
          <button 
            onClick={() => onSectionChange && onSectionChange('tests')}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer group"
          >
            <Award className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Testes</span>
          </button>
          
          <button 
            onClick={() => onSectionChange && onSectionChange('profile')}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer group"
          >
            <Users className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Perfil</span>
          </button>
        </CardContent>
      </Card>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-center">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Análises
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards melhorados */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
                <Calendar className="h-4 w-4 text-blue-400 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{upcomingEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingEvents.length === 0 
                    ? "Nenhum evento futuro" 
                    : `Próximos 7 dias`
                  }
                </p>
                {upcomingEvents.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {upcomingEvents[0].title}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anotações</CardTitle>
                <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{recentNotes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {timeFilter === 'today' ? 'Hoje' : 
                   timeFilter === 'week' ? 'Esta semana' :
                   timeFilter === 'month' ? 'Este mês' : 'Este trimestre'}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400">+{Math.max(0, recentNotes.length - 1)} vs anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metas</CardTitle>
                <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{goals.completed}/{goals.total}</div>
                <p className="text-xs text-muted-foreground">
                  Metas concluídas
                </p>
                <div className="mt-2">
                  <Progress 
                    value={goals.total > 0 ? (goals.completed / goals.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 bg-gradient-purple-300 from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{overallProgress}%</div>
                <p className="text-xs text-muted-foreground">
                  Média dos planos
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {overallProgress >= 75 ? 'Excelente!' : overallProgress >= 50 ? 'Bom progresso' : 'Continue assim!'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Versiculo do dia */}
          <Card className="hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary dark:primary/90">
                <Star className="h-5 w-5 mr-2" />
                Versículo do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-primary dark:primary/90 italic text-lg text-center font-medium leading-relaxed">
                "{currentQuote}"
              </blockquote>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
                    setCurrentQuote(newQuote)
                  }}
                  className="text-primary dark:text-primary/90 border-blue-300 dark:border-blue-300 hover:bg-primary/90 dark:hover:bg-primary"
                >
                  Novo Versículo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Matéria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Matéria
                </CardTitle>
                <CardDescription>
                  Suas anotações organizadas por disciplina
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de Produtividade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estatísticas de Produtividade
                </CardTitle>
                <CardDescription>
                  Métricas detalhadas do seu desempenho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{productivityStats.thisWeek}</div>
                    <div className="text-sm text-muted-foreground">Atividades esta semana</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{productivityStats.streak}</div>
                    <div className="text-sm text-muted-foreground">Dias consecutivos</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Crescimento Semanal</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{Math.abs(productivityStats.weeklyGrowth)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Horas Planejadas</span>
                    <span className="text-sm font-medium">{productivityStats.totalHours}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Eficiência</span>
                    <Badge variant="secondary">
                      {overallProgress >= 75 ? 'Alta' : overallProgress >= 50 ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Atividade Recente melhorada */}
      <Card className="hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400 gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Suas últimas ações na plataforma
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent >
          <div className="space-y-4 ">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon
                const timeAgo = new Date(activity.time).toLocaleDateString('pt-BR')
                
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.color === 'blue' ? 'bg-blue-500' : 
                      activity.color === 'green' ? 'bg-green-500' : 
                      activity.color === 'orange' ? 'bg-orange-500' : 'bg-muted-foreground'
                    }`}></div>
                    <div className={`p-2 rounded-lg ${
                      activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                      activity.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">Alta</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Bem-vindo à plataforma!</p>
                  <p className="text-xs text-muted-foreground">Comece explorando as funcionalidades</p>
                </div>
                <span className="text-xs text-muted-foreground">Agora</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Planos em Destaque */}
      {studyPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Planos em Destaque
            </CardTitle>
            <CardDescription>
              Seus planos de estudo mais importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPlans.slice(0, 4).map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(plan.status)}
                      <h4 className="font-medium text-sm">{plan.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {plan.subject}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Prazo: {new Date(plan.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge 
                        variant={plan.priority === 'alta' ? 'destructive' : plan.priority === 'media' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {plan.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

