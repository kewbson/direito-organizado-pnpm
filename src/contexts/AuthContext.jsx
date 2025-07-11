import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { seedNewUser } from '../utils/seedNewUser'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar dados adicionais do usuário no Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || userData.name,
              ...userData
            })
          } else {
            // Se não existe documento do usuário, criar um básico
            const basicUserData = {
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email,
              joinDate: new Date().toISOString().split('T')[0],
              studyGoal: 'Não definido',
              favoriteSubjects: [],
              preferences: {
                emailNotifications: true,
                darkMode: false,
                studyReminders: true
              }
            }
            
            await setDoc(userDocRef, basicUserData);
            setUser({
              id: firebaseUser.uid,
              ...basicUserData
            });
            // Chamar a função de seed de dados para novos usuários
            await seedNewUser(db, firebaseUser.uid);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error)
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Usuário'
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      let errorMessage = 'Erro ao fazer login'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado'
          break
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta'
          break
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde'
          break
        default:
          errorMessage = 'E-mail ou senha incorretos'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    setIsLoading(true)
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const firebaseUser = userCredential.user
      
      // Atualizar o perfil do usuário no Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: userData.name
      })
      
      // Criar documento do usuário no Firestore
      const userDocData = {
        name: userData.name,
        email: userData.email,
        joinDate: new Date().toISOString().split('T')[0],
        studyGoal: userData.studyGoal || 'Não definido',
        favoriteSubjects: []
      }
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userDocData)
      
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      let errorMessage = 'Erro ao criar conta'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'E-mail já cadastrado'
          break
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido'
          break
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres'
          break
        default:
          errorMessage = 'Erro ao criar conta. Tente novamente'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const updateUser = async (updatedData) => {
    if (!user) return
    
    try {
      const userDocRef = doc(db, 'users', user.id)
      await updateDoc(userDocRef, updatedData)
      
      // Atualizar estado local
      setUser(prevUser => ({ ...prevUser, ...updatedData }))
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      return { success: false, error: 'Erro ao atualizar dados' }
    }
  }

  const forgotPassword = async (email) => {
    setIsLoading(true)
    
    try {
      await sendPasswordResetEmail(auth, email)
      setIsLoading(false)
      return { success: true, message: 'E-mail de recuperação enviado com sucesso!' }
    } catch (error) {
      setIsLoading(false)
      let errorMessage = 'Erro ao enviar e-mail de recuperação'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'E-mail não encontrado'
          break
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido'
          break
        default:
          errorMessage = 'Erro ao enviar e-mail. Tente novamente'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const updateUserPreferences = async (preferences) => {
    if (!user) return
    
    try {
      const userDocRef = doc(db, 'users', user.id)
      await updateDoc(userDocRef, { preferences })
      
      // Atualizar estado local
      setUser(prevUser => ({ 
        ...prevUser, 
        preferences: { ...prevUser.preferences, ...preferences }
      }))
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error)
      return { success: false, error: 'Erro ao atualizar preferências' }
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateUserPreferences,
    forgotPassword,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

