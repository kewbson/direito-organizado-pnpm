import { useState, useEffect } from 'react'
import { Play, RotateCcw, CheckCircle, XCircle, Clock, Trophy, Target, BookOpen, Loader2, Plus, TrendingUp, Award, Brain, Zap, Star, ChevronRight, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { GradientCard } from '@/components/ui/gradient-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getAvailableSubjects, 
  getRandomQuestions, 
  getSubjectInfo 
} from '@/services/questionsService'

export function QuickTests() {
  const { testResults, addTestResult } = useData()
  const { user } = useAuth()
  
  // Estados do componente
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('todos')
  const [selectedQuestionCount, setSelectedQuestionCount] = useState('5')
  const [subjectInfo, setSubjectInfo] = useState(null)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  
  // Estados do quiz
  const [isTestActive, setIsTestActive] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [testQuestions, setTestQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [testStartTime, setTestStartTime] = useState(null)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // Carregar matérias disponíveis ao montar o componente
  useEffect(() => {
    loadAvailableSubjects()
  }, [])

  // Carregar informações da matéria quando selecionada
  useEffect(() => {
    if (selectedSubject) {
      loadSubjectInfo(selectedSubject)
    } else {
      setSubjectInfo(null)
    }
  }, [selectedSubject])

  const loadAvailableSubjects = async () => {
    setIsLoadingSubjects(true)
    try {
      const result = await getAvailableSubjects()
      if (result.success) {
        setAvailableSubjects(result.data)
      } else {
        console.error('Erro ao carregar matérias:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar matérias:', error)
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  const loadSubjectInfo = async (subjectId) => {
    try {
      const result = await getSubjectInfo(subjectId)
      if (result.success) {
        setSubjectInfo(result.data)
      } else {
        console.error('Erro ao carregar informações da matéria:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar informações da matéria:', error)
    }
  }

  const startTest = async () => {
    if (!selectedSubject) {
      alert('Por favor, selecione uma matéria.')
      return
    }

    const numQuestions = parseInt(selectedQuestionCount)
    setIsLoadingQuestions(true)
    
    try {
      const result = await getRandomQuestions(
        selectedSubject, 
        numQuestions, 
        selectedPeriod === 'todos' ? null : selectedPeriod
      )
      
      if (result.success && result.data.length > 0) {
        // Converter formato das questões do Firebase para o formato do componente
        const formattedQuestions = result.data.map((q, index) => ({
          id: index + 1,
          question: q.q,
          options: [q.opts[0], q.opts[1], q.opts[2], q.opts[3]],
          correct: q.a,
          explanation: q.expl || 'Explicação não disponível.',
          periodo: q.periodo
        }))

        setTestQuestions(formattedQuestions)
        setCurrentQuestionIndex(0)
        setUserAnswers([])
        setTestStartTime(Date.now())
        setTestCompleted(false)
        setTestResult(null)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setIsTestActive(true)
        setShowConfigModal(false)
      } else {
        alert(result.error || 'Nenhuma questão encontrada para os critérios selecionados.')
      }
    } catch (error) {
      console.error('Erro ao iniciar teste:', error)
      alert('Erro ao carregar questões. Tente novamente.')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const selectAnswer = (answerIndex) => {
    if (showExplanation) return
    setSelectedAnswer(answerIndex)
  }

  const confirmAnswer = () => {
    if (selectedAnswer === null) return

    const currentQuestion = testQuestions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correct
    
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      correct: isCorrect,
      question: currentQuestion.question
    }

    setUserAnswers(prev => [...prev, newAnswer])
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      finishTest()
    }
  }

  const finishTest = async () => {
    const duration = Math.floor((Date.now() - testStartTime) / 1000)
    const correctAnswers = userAnswers.filter(answer => answer.correct).length
    const score = Math.round((correctAnswers / testQuestions.length) * 100)

    const result = {
      subject: availableSubjects.find(s => s.id === selectedSubject)?.name || selectedSubject,
      score,
      totalQuestions: testQuestions.length,
      correctAnswers,
      duration
    }

    setTestResult(result)
    setTestCompleted(true)
    
    // Salvar resultado no Firebase
    try {
      await addTestResult(result)
    } catch (error) {
      console.error('Erro ao salvar resultado:', error)
    }
  }

  const resetTest = () => {
    setIsTestActive(false)
    setTestCompleted(false)
    setSelectedSubject('')
    setSelectedPeriod('todos')
    setSelectedQuestionCount('5')
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setTestQuestions([])
    setUserAnswers([])
    setTestResult(null)
    setSubjectInfo(null)
    setShowConfigModal(false)
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  const getRecentResults = () => {
    return testResults
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }

  const getSubjectStats = () => {
    const stats = {}
    testResults.forEach(result => {
      if (!stats[result.subject]) {
        stats[result.subject] = {
          count: 0,
          totalScore: 0,
          bestScore: 0
        }
      }
      stats[result.subject].count++
      stats[result.subject].totalScore += result.score
      stats[result.subject].bestScore = Math.max(stats[result.subject].bestScore, result.score)
    })

    return Object.entries(stats).map(([subject, data]) => ({
      subject,
      averageScore: Math.round(data.totalScore / data.count),
      bestScore: data.bestScore,
      testsCount: data.count
    }))
  }

  const getPerformanceData = () => {
    const last7Tests = testResults
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .reverse()

    return last7Tests.map((result, index) => ({
      test: `T${index + 1}`,
      score: result.score,
      subject: result.subject
    }))
  }

  const getPieChartData = () => {
    if (testResults.length === 0) return []
    
    const totalCorrect = testResults.reduce((acc, result) => acc + result.correctAnswers, 0)
    const totalQuestions = testResults.reduce((acc, result) => acc + result.totalQuestions, 0)
    const totalIncorrect = totalQuestions - totalCorrect

    return [
      { name: 'Acertos', value: totalCorrect, color: '#10b981' },
      { name: 'Erros', value: totalIncorrect, color: '#ef4444' }
    ]
  }

  // Renderização da tela de resultado
  if (testCompleted && testResult) {
    const pieData = [
      { name: 'Acertos', value: testResult.correctAnswers, color: '#10b981' },
      { name: 'Erros', value: testResult.totalQuestions - testResult.correctAnswers, color: '#ef4444' }
    ]

    return (
      <div className="min-h-screen">
        <div className="space-y-8 animate-slide-up">
          {/* Header de Resultado */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Trophy className={`h-12 w-12 ${getScoreColor(testResult.score)} animate-bounce-in`} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Star className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
              Teste Concluído!
            </h1>
            <p className="text-muted-foreground text-lg">
              Confira seu desempenho em <span className="font-semibold text-orange-600 dark:text-orange-400">{testResult.subject}</span>
            </p>
          </div>

          {/* Card Principal de Resultado */}
          <GradientCard variant="rainbow" className="max-w-4xl mx-auto group">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(testResult.score)} animate-bounce-in`}>
                    <AnimatedCounter value={testResult.score} suffix="%" duration={2000} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Sua Pontuação</p>
                </div>
                
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <Badge variant={getScoreBadgeVariant(testResult.score)} className="text-lg px-4 py-2">
                {testResult.correctAnswers} de {testResult.totalQuestions} questões corretas
              </Badge>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Estatísticas do Teste */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GradientCard variant="green" className="text-center p-4">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    <AnimatedCounter value={testResult.correctAnswers} />
                  </div>
                  <div className="text-sm text-muted-foreground">Acertos</div>
                </GradientCard>

                <GradientCard variant="orange" className="text-center p-4">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">
                    <AnimatedCounter value={testResult.totalQuestions - testResult.correctAnswers} />
                  </div>
                  <div className="text-sm text-muted-foreground">Erros</div>
                </GradientCard>

                <GradientCard variant="blue" className="text-center p-4">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(testResult.duration)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo</div>
                </GradientCard>

                <GradientCard variant="purple" className="text-center p-4">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">
                    <AnimatedCounter value={Math.round((testResult.duration / testResult.totalQuestions))} suffix="s" />
                  </div>
                  <div className="text-sm text-muted-foreground">Por Questão</div>
                </GradientCard>
              </div>

              {/* Barra de Progresso Animada */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Desempenho</span>
                  <span className={getScoreColor(testResult.score)}>{testResult.score}%</span>
                </div>
                <Progress value={testResult.score} className="h-4 animate-slide-in-right" />
              </div>

              {/* Revisão das Questões */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Revisão das Questões
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {userAnswers.map((answer, index) => (
                    <GradientCard 
                      key={index} 
                      variant={answer.correct ? "green" : "orange"}
                      className="p-4 hover-lift"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {answer.correct ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">Questão {index + 1}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {answer.question}
                          </p>
                        </div>
                        <Badge variant={answer.correct ? "default" : "destructive"} className="flex-shrink-0">
                          {answer.correct ? 'Correto' : 'Incorreto'}
                        </Badge>
                      </div>
                    </GradientCard>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={resetTest} 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover-lift"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Fazer Outro Teste
                </Button>
                <Button 
                  onClick={() => { setShowConfigModal(true); setTestCompleted(false); }} 
                  variant="outline" 
                  className="flex-1 hover-lift"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Repetir Teste
                </Button>
              </div>
            </CardContent>
          </GradientCard>
        </div>
      </div>
    )
  }

  // Renderização da tela de teste ativo
  if (isTestActive) {
    const currentQuestion = testQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100

    return (
      <div className="min-h-screen">
        <div className="space-y-6 animate-slide-up">
          {/* Header do Teste */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                {availableSubjects.find(s => s.id === selectedSubject)?.name || selectedSubject}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Questão {currentQuestionIndex + 1} de {testQuestions.length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(Math.floor((Date.now() - testStartTime) / 1000))}
                </span>
              </div>
            </div>
            <Button onClick={resetTest} variant="outline" className="hover-lift">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Teste</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 animate-slide-in-right" />
          </div>

          {/* Card da Questão */}
          <GradientCard variant="glass" className="max-w-4xl mx-auto group">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestion.question}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Opções de Resposta */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-300 hover-lift micro-bounce ${
                      showExplanation
                        ? index === currentQuestion.correct
                          ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300' // Resposta correta
                          : selectedAnswer === index
                          ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300' // Resposta incorreta selecionada
                          : 'border-border bg-background/50'
                        : selectedAnswer === index
                        ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300 shadow-lg' // Resposta selecionada
                        : 'border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10' // Padrão
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        selectedAnswer === index
                          ? showExplanation
                            ? index === currentQuestion.correct
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-red-500 bg-red-500 text-white'
                            : 'border-orange-500 bg-orange-500 text-white'
                          : showExplanation && index === currentQuestion.correct
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showExplanation && (
                        <div className="flex-shrink-0">
                          {index === currentQuestion.correct ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : selectedAnswer === index ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explicação */}
              {showExplanation && (
                <GradientCard variant="blue" className="p-4 animate-slide-up">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-600 dark:text-blue-300 mb-2">Explicação:</h4>
                      <p className="text-blue-800 dark:text-blue-400 text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </GradientCard>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3">
                {!showExplanation ? (
                  <Button 
                    onClick={confirmAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover-lift disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Resposta
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover-lift"
                  >
                    {currentQuestionIndex < testQuestions.length - 1 ? (
                      <>
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Próxima Questão
                      </>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Finalizar Teste
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </GradientCard>
        </div>
      </div>
    )
  }

  // Renderização da tela principal
  return (
    <div className="min-h-screen">
      <div className="space-y-8 animate-slide-up">
        {/* Header melhorado */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                Testes Rápidos
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Teste seus conhecimentos, acompanhe seu progresso e prepare-se para os desafios com nossa plataforma inteligente.
          </p>
        </div>

        {/* Seção de Início Rápido melhorada */}
        <Card className="hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-400">
              <Brain className="h-6 w-6" />
              Centro de Comando
            </CardTitle>
            <CardDescription className="text-base">
              Configure e inicie seu teste personalizado
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center ">
            <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-200">
                  <Play className="h-6 w-6 mr-3" />
                  Iniciar Novo Teste
                  <Zap className="h-5 w-5 ml-3" />
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-lg hover:shadow-md transition-all duration-200 ">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Configurar Teste
                  </DialogTitle>
                  <DialogDescription>
                    Personalize seu teste para uma experiência otimizada
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Seletor de Matéria */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                      Escolha a Matéria
                    </label>
                    {isLoadingSubjects ? (
                      <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/50">
                        <LoadingSpinner size="sm" className="text-orange-600" />
                        <span>Carregando matérias...</span>
                      </div>
                    ) : (
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Escolha uma matéria" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Seletor de Período */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      Selecione seu Período(em desenvolvimento)
                    </label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Todas as questões" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as questões</SelectItem>
                        {[1,2,3,4,5,6,7,8,9,10].map(period => (
                          <SelectItem key={period} value={period.toString()}>
                            Questões para {period}º Período
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Número de Questões */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      Número de Questões
                    </label>
                    <Select value={selectedQuestionCount} onValueChange={setSelectedQuestionCount}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 questões (Rápido)</SelectItem>
                        <SelectItem value="10">10 questões (Médio)</SelectItem>
                        <SelectItem value="15">15 questões (Longo)</SelectItem>
                        <SelectItem value="20">20 questões (Intensivo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    
                  {/* Aviso de questões insuficientes */}
                  {subjectInfo &&
                    (subjectInfo.questionsByPeriod[selectedPeriod] ?? subjectInfo.questionsCount) < parseInt(selectedQuestionCount) && (
                    <GradientCard variant="orange" className="p-3">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Não há questões suficientes para os filtros selecionados. Escolha um número menor.
                      </p>
                    </GradientCard>
                  )}
                    
                  {/* Informações da Matéria */}
                  {subjectInfo && (
                    <GradientCard variant="blue" className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600 dark:text-blue-300">Informações</span>
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                        <div><strong>{subjectInfo.questionsCount}</strong> questões disponíveis</div>
                        {selectedPeriod !== 'todos' && subjectInfo.questionsByPeriod[selectedPeriod] && (
                          <div>
                            <strong>{subjectInfo.questionsByPeriod[selectedPeriod]}</strong> questões no período selecionado
                          </div>
                        )}
                      </div>
                    </GradientCard>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 hover-lift"
                      disabled={!selectedSubject}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Pergunta
                    </Button>
                    <Button 
                      onClick={startTest}
                      disabled={
                        !selectedSubject ||
                        isLoadingQuestions ||
                        (subjectInfo &&
                          (subjectInfo.questionsByPeriod[selectedPeriod] ?? subjectInfo.questionsCount) < parseInt(selectedQuestionCount))
                      }
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover-lift"
                    >
                      {isLoadingQuestions ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Começar Teste
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GradientCard className="text-center p-6 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-orange-300 from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <Target className="h-8 w-8 mx-auto mb-3 text-orange-600" />
            <div className="text-3xl font-bold text-orange-600">
              <AnimatedCounter value={testResults.length} />
            </div>
            <div className="text-sm text-muted-foreground">Testes Realizados</div>
          </GradientCard>
          
          <GradientCard className="text-center p-6 hover-lift over:shadow-md transition-all duration-200 bg-gradient-green-300 from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <Trophy className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <div className="text-3xl font-bold text-green-600">
              <AnimatedCounter 
                value={testResults.length > 0 ? Math.max(...testResults.map(r => r.score)) : 0} 
                suffix="%" 
              />
            </div>
            <div className="text-sm text-muted-foreground">Melhor Pontuação</div>
          </GradientCard>
          
          <GradientCard className="text-center p-6 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <div className="text-3xl font-bold text-blue-600">
              <AnimatedCounter 
                value={testResults.length > 0 ? Math.round(testResults.reduce((acc, r) => acc + r.score, 0) / testResults.length) : 0} 
                suffix="%" 
              />
            </div>
            <div className="text-sm text-muted-foreground">Média Geral</div>
          </GradientCard>
          
          <GradientCard className="text-center p-6 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-purple-300 from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <Clock className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <div className="text-3xl font-bold text-purple-600">
              {testResults.length > 0 ? formatDuration(Math.round(testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length)) : '0:00'}
            </div>
            <div className="text-sm text-muted-foreground">Tempo Médio</div>
          </GradientCard>
        </div>

        {/* Gráficos e Análises */}
        {testResults.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gráfico de Performance */}
            <GradientCard className="p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Evolução do Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="test" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#ea580c" 
                        strokeWidth={3}
                        dot={{ fill: '#ea580c', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#ea580c', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </GradientCard>

            {/* Gráfico de Acertos vs Erros */}
            <GradientCard className="p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Distribuição Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Acertos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Erros</span>
                  </div>
                </div>
              </CardContent>
            </GradientCard>
          </div>
        )}

        {/* Histórico Recente */}
        {testResults.length > 0 && (
          <GradientCard className="p-6 hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecentResults().map((result, index) => (
                  <GradientCard key={index} variant="default" className="p-4 hover-lift hover:shadow-md transition-all duration-200 bg-gradient-blue-400 from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{result.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.correctAnswers}/{result.totalQuestions}
                        </div>
                      </div>
                    </div>
                  </GradientCard>
                ))}
              </div>
            </CardContent>
          </GradientCard>
        )}

        {/* Estado Vazio */}
        {testResults.length === 0 && (
          <GradientCard variant="glass" className="max-w-2xl mx-auto text-center p-12">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Comece sua jornada de aprendizado!</h3>
              <p className="text-muted-foreground">
                Ainda não há testes realizados. Que tal começar agora e acompanhar seu progresso?
              </p>
              <Button 
                onClick={() => setShowConfigModal(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover-lift"
              >
                <Play className="h-4 w-4 mr-2" />
                Fazer Primeiro Teste
              </Button>
            </div>
          </GradientCard>
        )}
      </div>
    </div>
  )
}

