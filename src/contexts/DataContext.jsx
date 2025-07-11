import { createContext, useContext, useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'
import { saveTestResult, getUserTestResults } from '../services/quizService'
import { nanoid } from 'nanoid';

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user } = useAuth()
  
  // Estados para todas as funcionalidades
  const [notes, setNotes] = useState([])
  const [studyPlans, setStudyPlans] = useState([])
  const [events, setEvents] = useState([])
  const [testResults, setTestResults] = useState([])
  const [supportTickets, setSupportTickets] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar dados do Firebase quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      // Limpar dados quando usuário não estiver autenticado
      setNotes([])
      setStudyPlans([])
      setEvents([])
      setTestResults([])
      setSupportTickets([])
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await Promise.all([
        loadNotes(),
        loadStudyPlans(),
        loadEvents(),
        loadTestResults(),
        loadSupportTickets()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Funções para carregar dados do Firebase
  const loadNotes = async () => {
    try {
      const q = query(
        collection(db, 'users', user.id, 'notes'),
        orderBy('lastModified', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const notesData = []
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() })
      })
      setNotes(notesData)
    } catch (error) {
      console.error('Erro ao carregar anotações:', error)
    }
  }

  const loadStudyPlans = async () => {
    try {
      const q = query(
        collection(db, 'users', user.id, 'studyPlans'),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const plansData = []
      querySnapshot.forEach((doc) => {
        plansData.push({ id: doc.id, ...doc.data() })
      })
      setStudyPlans(plansData)
    } catch (error) {
      console.error('Erro ao carregar planos de estudo:', error)
    }
  }

  const loadEvents = async () => {
    try {
      const q = query(
        collection(db, 'users', user.id, 'events'),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const eventsData = []
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() })
      })
      setEvents(eventsData)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    }
  }

  const loadTestResults = async () => {
    try {
      const result = await getUserTestResults(user.id)
      if (result.success) {
        setTestResults(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar resultados de testes:', error)
    }
  }

  const loadSupportTickets = async () => {
    try {
      const q = query(
        collection(db, 'users', user.id, 'supportTickets'),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const ticketsData = []
      querySnapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() })
      })
      setSupportTickets(ticketsData)
    } catch (error) {
      console.error('Erro ao carregar tickets de suporte:', error)
    }
  }

  // Funções para gerenciar anotações
  const addNote = async (noteData) => {
    if (!user) return
    
    try {
      const newNote = {
        ...noteData,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'users', user.id, 'notes'), newNote)
      const noteWithId = { id: docRef.id, ...newNote }
      setNotes(prev => [noteWithId, ...prev])
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar anotação:', error)
      return { success: false, error: error.message }
    }
  }

  const updateNote = async (id, noteData) => {
    if (!user) return
    
    try {
      const updatedData = {
        ...noteData,
        lastModified: new Date().toISOString()
      }
      
      await updateDoc(doc(db, 'users', user.id, 'notes', id), updatedData)
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updatedData } : note
      ))
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteNote = async (id) => {
    if (!user) return
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'notes', id))
      setNotes(prev => prev.filter(note => note.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar anotação:', error)
      return { success: false, error: error.message }
    }
  }

  const toggleNoteFavorite = async (id) => {
    if (!user) return
    
    try {
      const note = notes.find(n => n.id === id)
      if (!note) return { success: false, error: 'Anotação não encontrada' }
      
      const updatedData = {
        isFavorite: !note.isFavorite,
        lastModified: new Date().toISOString()
      }
      
      await updateDoc(doc(db, 'users', user.id, 'notes', id), updatedData)
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updatedData } : note
      ))
      return { success: true }
    } catch (error) {
      console.error('Erro ao alterar favorito da anotação:', error)
      return { success: false, error: error.message }
    }
  }

  // Funções para gerenciar planos de estudo
  const addStudyPlan = async (planData) => {
    if (!user) return
    
    try {
      const newPlan = {
        ...planData,
        date: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'users', user.id, 'studyPlans'), newPlan)
      const planWithId = { id: docRef.id, ...newPlan }
      setStudyPlans(prev => [planWithId, ...prev])
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar plano de estudo:', error)
      return { success: false, error: error.message }
    }
  }

  const updateStudyPlan = async (id, planData) => {
    if (!user) return
    
    try {
      const updatedData = {
        ...planData,
        lastModified: new Date().toISOString()
      }
      
      await updateDoc(doc(db, 'users', user.id, 'studyPlans', id), updatedData)
      setStudyPlans(prev => prev.map(plan => 
        plan.id === id ? { ...plan, ...updatedData } : plan
      ))
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar plano de estudo:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteStudyPlan = async (id) => {
    if (!user) return
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'studyPlans', id))
      setStudyPlans(prev => prev.filter(plan => plan.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar plano de estudo:', error)
      return { success: false, error: error.message }
    }
  }

  // Funções para gerenciar eventos da agenda
  const addEvent = async (eventData) => {
    if (!user) return
    
    try {
      const newEvent = {
        ...eventData,
        created: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'users', user.id, 'events'), newEvent)
      const eventWithId = { id: docRef.id, ...newEvent }
      setEvents(prev => [eventWithId, ...prev])
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar evento:', error)
      return { success: false, error: error.message }
    }
  }

  const updateEvent = async (id, eventData) => {
    if (!user) return
    
    try {
      const updatedData = {
        ...eventData,
        lastModified: new Date().toISOString()
      }
      
      await updateDoc(doc(db, 'users', user.id, 'events', id), updatedData)
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updatedData } : event
      ))
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteEvent = async (id) => {
    if (!user) return
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'events', id))
      setEvents(prev => prev.filter(event => event.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar evento:', error)
      return { success: false, error: error.message }
    }
  }

  // Funções para gerenciar resultados de testes
  const addTestResult = async (resultData) => {
    if (!user) return
    
    try {
      const result = await saveTestResult(user.id, resultData)
      if (result.success) {
        const newResult = {
          id: result.id,
          ...resultData,
          userId: user.id,
          date: new Date().toISOString()
        }
        setTestResults(prev => [newResult, ...prev])
      }
      return result
    } catch (error) {
      console.error('Erro ao adicionar resultado de teste:', error)
      return { success: false, error: error.message }
    }
  }

  // Funções para gerenciar tickets de suporte
  const addSupportTicket = async (ticketData) => {
    if (!user) return
    
    try {
      const newTicket = {
        ...ticketData,
        status: 'aberto',
        date: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'users', user.id, 'supportTickets'), newTicket)
      const ticketWithId = { id: docRef.id, ...newTicket }
      setSupportTickets(prev => [ticketWithId, ...prev])
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar ticket de suporte:', error)
      return { success: false, error: error.message }
    }
  }
    // Funções para gerenciar subtarefas (tasks) dentro de um plano de estudo
  const addTaskToStudyPlan = async (planId, taskText) => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    if (!planId || !taskText.trim()) return { success: false, error: 'Dados da tarefa inválidos.' };

    const newTask = {
      id: nanoid(), // Gera um ID único para a tarefa
      text: taskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    try {
      const planDocRef = doc(db, 'users', user.id, 'studyPlans', planId);
      await updateDoc(planDocRef, {
        tasks: arrayUnion(newTask) // Adiciona a nova tarefa ao array 'tasks'
      });
      // Atualizar o estado local 'studyPlans'
      setStudyPlans(prevPlans => prevPlans.map(plan =>
        plan.id === planId ? { ...plan, tasks: [...(plan.tasks || []), newTask] } : plan
      ));
      return { success: true, taskId: newTask.id };
    } catch (error) {
      console.error('Erro ao adicionar tarefa ao plano:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleTaskCompletion = async (planId, taskId, isCompleted) => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    if (!planId || !taskId) return { success: false, error: 'IDs de plano ou tarefa inválidos.' };

    try {
      const planDocRef = doc(db, 'users', user.id, 'studyPlans', planId);
      
      // Encontra o plano no estado local para pegar a tarefa a ser modificada
      const planToUpdate = studyPlans.find(p => p.id === planId);
      if (!planToUpdate) return { success: false, error: 'Plano não encontrado localmente.' };

      const taskToToggle = planToUpdate.tasks?.find(task => task.id === taskId);
      if (!taskToToggle) return { success: false, error: 'Tarefa não encontrada.' };

      const updatedTask = { ...taskToToggle, completed: isCompleted };

      // Remover a tarefa antiga e adicionar a tarefa atualizada ao array 'tasks'
      // ATENÇÃO: Isso exige que o objeto seja IDÊNTICO, incluindo createdAt.
      await updateDoc(planDocRef, {
        tasks: arrayRemove(taskToToggle) // Remove a versão antiga da tarefa
      });
      await updateDoc(planDocRef, {
        tasks: arrayUnion(updatedTask) // Adiciona a versão atualizada da tarefa
      });

      // Atualizar o estado local 'studyPlans'
      setStudyPlans(prevPlans => prevPlans.map(plan => {
        if (plan.id === planId) {
          const updatedTasks = (plan.tasks || []).map(task =>
            task.id === taskId ? updatedTask : task
          );
          return { ...plan, tasks: updatedTasks };
        }
        return plan;
      }));
      return { success: true };
    } catch (error) {
      console.error('Erro ao alternar conclusão da tarefa:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteTaskFromStudyPlan = async (planId, taskId) => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    if (!planId || !taskId) return { success: false, error: 'IDs de plano ou tarefa inválidos.' };

    try {
      const planDocRef = doc(db, 'users', user.id, 'studyPlans', planId);
      
      // Encontra o plano no estado local para pegar a tarefa a ser removida
      const planToUpdate = studyPlans.find(p => p.id === planId);
      if (!planToUpdate) return { success: false, error: 'Plano não encontrado localmente.' };

      const taskToRemove = planToUpdate.tasks?.find(task => task.id === taskId);
      if (!taskToRemove) return { success: false, error: 'Tarefa não encontrada localmente.' };

      await updateDoc(planDocRef, {
        tasks: arrayRemove(taskToRemove) // Remove a tarefa do array 'tasks'
      });
      // Atualizar o estado local 'studyPlans'
      setStudyPlans(prevPlans => prevPlans.map(plan =>
        plan.id === planId ? { ...plan, tasks: (plan.tasks || []).filter(task => task.id !== taskId) } : plan
      ));
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir tarefa do plano:', error);
      return { success: false, error: error.message };
    }
  };


  const value = {
    // Estados
    isLoading,
    
    // Anotações
    notes,
    addNote,
    updateNote,
    deleteNote,
    toggleNoteFavorite,
    
    // Planos de estudo
    studyPlans,
    addStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
    
    // Eventos da agenda
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    
    // Resultados de testes
    testResults,
    addTestResult,
    
    // Tickets de suporte
    supportTickets,
    addSupportTicket,
    
    // Funções para subtarefas
    addTaskToStudyPlan,
    toggleTaskCompletion, 
    deleteTaskFromStudyPlan,

    // Função para recarregar dados
    loadUserData
  }
  
  


  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

