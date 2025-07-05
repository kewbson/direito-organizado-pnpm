import { useState, useEffect } from 'react'
import { Play, RotateCcw, CheckCircle, XCircle, Clock, Trophy, Target, BookOpen, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
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

  // Renderização da tela de resultado
  if (testCompleted && testResult) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-600 mb-2">
            Teste Concluído!
          </h1>
          <p className="text-gray-600">
            Confira seu desempenho em {testResult.subject}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Trophy className={`h-16 w-16 ${getScoreColor(testResult.score)}`} />
            </div>
            <CardTitle className="text-2xl">
              Sua pontuação: <span className={getScoreColor(testResult.score)}>{testResult.score}%</span>
            </CardTitle>
            <CardDescription>
              {testResult.correctAnswers} de {testResult.totalQuestions} questões corretas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
<div>
  <div className="text-2xl font-bold text-foreground">{testResult.correctAnswers}</div>
  <div className="text-sm text-muted-foreground">Acertos</div>
</div>
<div>
  <div className="text-2xl font-bold text-foreground">{formatDuration(testResult.duration)}</div>
  <div className="text-sm text-muted-foreground">Tempo</div>
</div>
            </div>

            <Progress value={testResult.score} className="h-3" />

            <div className="space-y-3">
              <h4 className="font-medium">Revisão das Questões:</h4>
              {userAnswers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {answer.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm flex-1">{answer.question}</span>
                  <Badge variant={answer.correct ? "default" : "destructive"}>
                    {answer.correct ? 'Correto' : 'Incorreto'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button onClick={resetTest} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Fazer Outro Teste
              </Button>
              <Button onClick={() => { setShowConfigModal(true); setTestCompleted(false); }} variant="outline" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Repetir Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderização da tela de teste ativo
  if (isTestActive) {
    const currentQuestion = testQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-600 mb-2">
              {availableSubjects.find(s => s.id === selectedSubject)?.name || selectedSubject}
            </h1>
            <p className="text-gray-600">
              Questão {currentQuestionIndex + 1} de {testQuestions.length}
            </p>
          </div>
          <Button onClick={resetTest} variant="outline">
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={showExplanation}
className={`w-full p-4 text-left border rounded-lg transition-colors text-foreground disabled:opacity-70 ${
  showExplanation
    ? index === currentQuestion.correct
      ? 'border-green-500 bg-green-500/10' // Resposta correta
      : selectedAnswer === index
      ? 'border-red-500 bg-red-500/10' // Resposta incorreta que foi selecionada
      : 'border-border'
    : selectedAnswer === index
    ? 'border-primary bg-primary/10' // Resposta selecionada (ainda não confirmada)
    : 'border-border hover:bg-accent' // Padrão
}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? showExplanation
                          ? index === currentQuestion.correct
                            ? 'border-green-500 bg-green-500'
                            : 'border-red-500 bg-red-500'
                          : 'border-amber-500 bg-amber-500'
                        : showExplanation && index === currentQuestion.correct
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {((selectedAnswer === index && showExplanation) || 
                        (showExplanation && index === currentQuestion.correct)) && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                      {selectedAnswer === index && showExplanation && index !== currentQuestion.correct && (
                        <XCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
<div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
  <h4 className="font-medium text-blue-600 dark:text-blue-300 mb-2">Explicação:</h4>
  <p className="text-blue-800 dark:text-blue-400 text-sm">{currentQuestion.explanation}</p>
</div>
            )}

            <div className="flex space-x-2">
              {!showExplanation ? (
                <Button 
                  onClick={confirmAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="bg-amber-600 hover:bg-amber-700">
                  {currentQuestionIndex < testQuestions.length - 1 ? 'Próxima Questão' : 'Finalizar Teste'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderização da tela principal
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            Testes Rápidos
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Teste seus conhecimentos e prepare-se para os desafios
        </p>
      </div>

      {/* Seção Meu Desempenho */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Meu Desempenho</CardTitle>
          <div className="mt-4">
            <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 mt-4">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Novo Teste
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurar Teste</DialogTitle>
                  <DialogDescription>
                    Configure as opções do seu teste
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Seletor de Matéria */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Escolha a Matéria</label>
                    {isLoadingSubjects ? (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Carregando matérias...</span>
                      </div>
                    ) : (
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Escolha um nível para as questões</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de Questões</label>
                    <Select value={selectedQuestionCount} onValueChange={setSelectedQuestionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    
                    {subjectInfo &&
                    (subjectInfo.questionsByPeriod[selectedPeriod] ?? subjectInfo.questionsCount) < parseInt(selectedQuestionCount) && (
                    <p className="text-xs text-red-600 mt-2">
                      Não há questões suficientes para os filtros selecionados. Por favor, escolha um número menor de questões.
                    </p>
                  )}
                    
                  {/* Informações da Matéria */}
                  {subjectInfo && (
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                      <strong>{subjectInfo.questionsCount}</strong> questões disponíveis
                      {selectedPeriod !== 'todos' && subjectInfo.questionsByPeriod[selectedPeriod] && (
                        <div>
                          <strong>{subjectInfo.questionsByPeriod[selectedPeriod]}</strong> questões no período selecionado
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
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
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                      {isLoadingQuestions ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          </div>
        </CardHeader>
        
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum teste realizado ainda.</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">
                Você já realizou <strong>{testResults.length}</strong> teste(s).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico Recente */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Matéria</th>
                    <th className="text-left p-2">Acertos</th>
                    <th className="text-left p-2">Desempenho</th>
                    <th className="text-left p-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {getRecentResults().map((result, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{result.subject}</td>
                      <td className="p-2">{result.correctAnswers}/{result.totalQuestions}</td>
                      <td className="p-2">
                        <span className={getScoreColor(result.score)}>
                          {result.score}%
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(result.date).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{testResults.length}</div>
            <div className="text-sm text-muted-foreground">Testes Realizados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {testResults.length > 0 ? Math.max(...testResults.map(r => r.score)) : 0}%
            </div>
            <div className="text-sm text-gray-600">Melhor Pontuação</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {testResults.length > 0 ? Math.round(testResults.reduce((acc, r) => acc + r.score, 0) / testResults.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Média Geral</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {testResults.length > 0 ? formatDuration(Math.round(testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length)) : '0:00'}
            </div>
            <div className="text-sm text-gray-600">Tempo Médio</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

