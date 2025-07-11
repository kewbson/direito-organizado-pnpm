import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// A coleção de resultados agora é uma subcoleção dentro de cada usuário
const getTestResultsCollectionRef = (userId) => {
  return collection(db, 'users', userId, 'testResults');
};

// Função para salvar resultado de teste
export const saveTestResult = async (userId, testResult) => {
  try {
    const testData = {
      // Não precisamos mais salvar o userId aqui, pois ele já faz parte do caminho
      subject: testResult.subject,
      score: testResult.score,
      totalQuestions: testResult.totalQuestions,
      correctAnswers: testResult.correctAnswers,
      duration: testResult.duration,
      date: new Date().toISOString(),
      timestamp: new Date()
    };

    // Salva na subcoleção correta do usuário
    const docRef = await addDoc(getTestResultsCollectionRef(userId), testData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar resultado do teste:', error);
    return { success: false, error: error.message };
  }
};

// Função para buscar resultados de testes do usuário
export const getUserTestResults = async (userId) => {
  try {
    // A query agora é feita diretamente na subcoleção do usuário
    const q = query(
      getTestResultsCollectionRef(userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: results };
  } catch (error) {
    console.error('Erro ao buscar resultados dos testes:', error);
    return { success: false, error: error.message };
  }
};

// Função para buscar estatísticas do usuário
export const getUserStats = async (userId) => {
  try {
    const querySnapshot = await getDocs(getTestResultsCollectionRef(userId));
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });
    
    const stats = {
      totalTests: results.length,
      averageScore: 0,
      bestScore: 0,
      subjectStats: {}
    };
    
    if (results.length > 0) {
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      stats.averageScore = Math.round(totalScore / results.length);
      stats.bestScore = Math.max(...results.map(result => result.score));
      
      results.forEach(result => {
        if (!stats.subjectStats[result.subject]) {
          stats.subjectStats[result.subject] = {
            count: 0,
            totalScore: 0,
            bestScore: 0
          };
        }
        
        const subjectData = stats.subjectStats[result.subject];
        subjectData.count++;
        subjectData.totalScore += result.score;
        subjectData.bestScore = Math.max(subjectData.bestScore, result.score);
      });
      
      Object.keys(stats.subjectStats).forEach(subject => {
        const subjectData = stats.subjectStats[subject];
        subjectData.averageScore = Math.round(subjectData.totalScore / subjectData.count);
      });
    }
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, error: error.message };
  }
};

// Função para deletar resultado de teste
export const deleteTestResult = async (userId, resultId) => {
  try {
    const docRef = doc(db, 'users', userId, 'testResults', resultId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar resultado:', error);
    return { success: false, error: error.message };
  }
};