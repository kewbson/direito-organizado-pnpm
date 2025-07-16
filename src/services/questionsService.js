import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Função para buscar todas as matérias disponíveis
export const getAvailableSubjects = async () => {
  try {
    const quizzesRef = collection(db, 'quizzes')
    const querySnapshot = await getDocs(quizzesRef)
    
    const subjects = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.questions && data.questions.length > 0) {
        subjects.push({
          id: doc.id,
          name: data.name || doc.id,
          questionsCount: data.questions.length
        })
      }
    })
    
    return { success: true, data: subjects }
  } catch (error) {
    console.error('Erro ao buscar matérias:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar questões de uma matéria específica
export const getQuestionsBySubject = async (subjectId) => {
  try {
    const quizDocRef = doc(db, 'quizzes', subjectId)
    const quizDoc = await getDoc(quizDocRef)
    
    if (!quizDoc.exists()) {
      return { success: false, error: 'Matéria não encontrada' }
    }
    
    const data = quizDoc.data()
    const questions = data.questions || []
    
    return { success: true, data: questions }
  } catch (error) {
    console.error('Erro ao buscar questões:', error)
    return { success: false, error: error.message }
  }
}

// Função para buscar questões filtradas por período
export const getQuestionsBySubjectAndPeriod = async (subjectId, period = null) => {
  try {
    const result = await getQuestionsBySubject(subjectId)
    
    if (!result.success) {
      return result
    }
    
    let questions = result.data
    
    // Se um período específico foi fornecido, filtra as questões
    if (period && period !== 'todos') {
      questions = questions.filter(q => q.periodo == period)
    }
    
    return { success: true, data: questions }
  } catch (error) {
    console.error('Erro ao buscar questões por período:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter questões aleatórias para um quiz
export const getRandomQuestions = async (subjectId, numQuestions = 10, period = null) => {
  try {
    const result = await getQuestionsBySubjectAndPeriod(subjectId, period)
    
    if (!result.success) {
      return result
    }
    
    const questions = result.data
    
    if (questions.length === 0) {
      return { success: false, error: 'Nenhuma questão encontrada para os critérios especificados' }
    }
    
    // Embaralha as questões e pega apenas o número solicitado
    const shuffled = questions.sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, Math.min(numQuestions, questions.length))
    
    return { success: true, data: selectedQuestions }
  } catch (error) {
    console.error('Erro ao buscar questões aleatórias:', error)
    return { success: false, error: error.message }
  }
}

// Função para obter informações de uma matéria
export const getSubjectInfo = async (subjectId) => {
  try {
    const quizDocRef = doc(db, 'quizzes', subjectId)
    const quizDoc = await getDoc(quizDocRef)
    
    if (!quizDoc.exists()) {
      return { success: false, error: 'Matéria não encontrada' }
    }
    
    const data = quizDoc.data()
    const questionsCount = data.questions ? data.questions.length : 0
    
    // Conta questões por período se existir a propriedade período
    const questionsByPeriod = {}
    if (data.questions) {
      data.questions.forEach(q => {
        const period = q.periodo || 'sem-periodo'
        questionsByPeriod[period] = (questionsByPeriod[period] || 0) + 1
      })
    }
    
    return { 
      success: true, 
      data: {
        id: subjectId,
        name: data.name || subjectId,
        questionsCount,
        questionsByPeriod
      }
    }
  } catch (error) {
    console.error('Erro ao buscar informações da matéria:', error)
    return { success: false, error: error.message }
  }
}

