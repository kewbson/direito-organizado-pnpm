import { useState, useEffect } from 'react'
import { User, Save, X, Edit, Camera, Mail, Calendar, BookOpen, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useDarkMode } from '@/hooks/useDarkMode'

export function Profile() {
  const { user, updateUser, updateUserPreferences } = useAuth()
  const { notes, testResults, events, studyPlans } = useData()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    studyGoal: user?.studyGoal || '',
    favoriteSubjects: user?.favoriteSubjects || []
  })

  // Estados para preferências sincronizadas
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    studyReminders: user?.preferences?.studyReminders ?? true
  })

  // Atualizar preferências quando o usuário mudar
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        emailNotifications: user.preferences.emailNotifications ?? true,
        studyReminders: user.preferences.studyReminders ?? true
      })
    }
  }, [user])

  // Atualizar dados de edição quando o usuário mudar
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        studyGoal: user.studyGoal || '',
        favoriteSubjects: user.favoriteSubjects || []
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    const result = await updateUser({
      name: editData.name,
      studyGoal: editData.studyGoal,
      favoriteSubjects: editData.favoriteSubjects
    })
    
    if (result?.success) {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      studyGoal: user?.studyGoal || '',
      favoriteSubjects: user?.favoriteSubjects || []
    })
    setIsEditing(false)
  }

  const handlePreferenceChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    
    // Salvar no Firebase
    await updateUserPreferences(newPreferences)
  }

  const handleDarkModeToggle = async () => {
    await toggleDarkMode()
  }

  // Calcular estatísticas dinâmicas
  const calculateStats = () => {
    const notesCount = notes?.length || 0
    const testsCount = testResults?.length || 0
    
    // Calcular dias de estudo únicos baseado em datas de atividades
    const uniqueDates = new Set()
    
    // Adicionar datas das anotações
    notes?.forEach(note => {
      if (note.date) {
        const date = new Date(note.date).toDateString()
        uniqueDates.add(date)
      }
    })
    
    // Adicionar datas dos testes
    testResults?.forEach(test => {
      if (test.date) {
        const date = new Date(test.date).toDateString()
        uniqueDates.add(date)
      }
    })
    
    // Adicionar datas dos eventos
    events?.forEach(event => {
      if (event.date) {
        const date = new Date(event.date).toDateString()
        uniqueDates.add(date)
      }
    })
    
    // Adicionar datas dos planos de estudo
    studyPlans?.forEach(plan => {
      if (plan.date) {
        const date = new Date(plan.date).toDateString()
        uniqueDates.add(date)
      }
    })
    
    const studyDays = uniqueDates.size
    
    // Calcular média de acertos dos testes
    const totalQuestions = testResults?.reduce((sum, test) => sum + (test.totalQuestions || 0), 0) || 0
    const correctAnswers = testResults?.reduce((sum, test) => sum + (test.correctAnswers || 0), 0) || 0
    const averageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    
    return {
      notesCount,
      testsCount,
      studyDays,
      averageScore
    }
  }

  const stats = calculateStats()
  
  const statsData = [
    {
      label: 'Anotações criadas',
      value: stats.notesCount,
      icon: BookOpen
    },
    {
      label: 'Testes realizados',
      value: stats.testsCount,
      icon: Edit
    },
    {
      label: 'Dias de estudo',
      value: stats.studyDays,
      icon: Calendar
    },
    {
      label: 'Média de acertos',
      value: `${stats.averageScore}%`,
      icon: User
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <User className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">Meu Perfil</h1>
        </div>
        <p className="text-muted-foreground text-lg">Gerencie suas informações e preferências</p>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary/90 mt-4"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Informações Pessoais</CardTitle>
              <CardDescription className="text-muted-foreground">
                Suas informações básicas na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" alt="Foto do perfil" />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-card-foreground">{user?.name || 'Usuário'}</h3>
                  <p className="text-sm text-muted-foreground">Estudante de Direito</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      placeholder="Como você gostaria de ser chamado(a)?"
                      className="bg-background border-input"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md text-foreground">
                      {user?.name || 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center text-foreground border border-input">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{user?.email || 'email@desenvolvimento.com'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studyGoal">Objetivo de Estudo</Label>
                  {isEditing ? (
                    <Input
                      id="studyGoal"
                      name="studyGoal"
                      value={editData.studyGoal}
                      onChange={handleInputChange}
                      placeholder="Qual seu objetivo principal?"
                      className="bg-background border-input"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md text-foreground">
                      {user?.studyGoal || 'Não definido'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Membro desde</Label>
                  <div className="p-2 bg-muted rounded-md flex items-center text-foreground">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('pt-BR') : 'Não informado'}
                  </div>
                </div>
              </div>

              {/* Favorite Subjects */}
              <div className="space-y-2">
                <Label>Matérias Favoritas</Label>
                <div className="flex flex-wrap gap-2">
                  {user?.favoriteSubjects?.length > 0 ? (
                    user.favoriteSubjects.map((subject, index) => (
                      <Badge key={index} variant="secondary">
                        {subject}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma matéria favorita definida</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Preferências</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure como você quer usar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-card-foreground">Notificações por e-mail</p>
                    <p className="text-sm text-muted-foreground">Receber lembretes e atualizações</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-card-foreground">Modo escuro</p>
                    <p className="text-sm text-muted-foreground">Usar tema escuro na interface</p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-card-foreground">Lembretes de estudo</p>
                    <p className="text-sm text-muted-foreground">Notificações para manter a rotina</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.studyReminders}
                  onCheckedChange={(value) => handlePreferenceChange('studyReminders', value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Estatísticas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Seu progresso na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm text-card-foreground">{stat.label}</span>
                    </div>
                    <span className="font-medium text-card-foreground">{stat.value}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Alterar senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Exportar dados
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                Excluir conta
              </Button>
            </CardContent>
          </Card>
            
        <Card className="bg-card border-border">
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center">
                    <img src="/logo-completa-retangular.svg" alt="Logo da Empresa" className="w-24 h-auto sm:w-100 p-7" />
            </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

