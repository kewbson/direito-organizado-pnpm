import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useDarkMode() {
  const { user, updateUserPreferences } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Função para aplicar o modo escuro globalmente
  const applyDarkModeToDOM = (darkMode) => {
    const htmlElement = document.documentElement
    const bodyElement = document.body
    
    if (darkMode) {
      htmlElement.classList.add('dark')
      bodyElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
      bodyElement.classList.remove('dark')
    }
    
    // Atualizar meta theme-color para dispositivos móveis
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', darkMode ? '#212121' : '#ffffff')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = darkMode ? '#212121' : '#ffffff'
      document.head.appendChild(meta)
    }
  }

  // Aplicar modo escuro na inicialização
  useEffect(() => {
    const initializeDarkMode = async () => {
      try {
        // 1. Verificar localStorage primeiro (carregamento rápido)
        const savedDarkMode = localStorage.getItem('darkMode')
        let initialDarkMode = false

        if (savedDarkMode !== null) {
          initialDarkMode = savedDarkMode === 'true'
          applyDarkModeToDOM(initialDarkMode)
          setIsDarkMode(initialDarkMode)
        }

        // 2. Se o usuário está logado, sincronizar com Firebase
        if (user?.preferences !== undefined) {
          const userDarkMode = user.preferences.darkMode ?? false
          
          // Se há diferença entre localStorage e Firebase, usar Firebase como fonte da verdade
          if (savedDarkMode === null || (savedDarkMode === 'true') !== userDarkMode) {
            applyDarkModeToDOM(userDarkMode)
            setIsDarkMode(userDarkMode)
            localStorage.setItem('darkMode', userDarkMode.toString())
          }
        }
        
        // 3. Se não há preferência salva, verificar preferência do sistema
        else if (savedDarkMode === null) {
          const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          applyDarkModeToDOM(systemPrefersDark)
          setIsDarkMode(systemPrefersDark)
          localStorage.setItem('darkMode', systemPrefersDark.toString())
        }
      } catch (error) {
        console.error('Erro ao inicializar modo escuro:', error)
        // Fallback para modo claro em caso de erro
        applyDarkModeToDOM(false)
        setIsDarkMode(false)
      }
    }

    initializeDarkMode()
  }, [user])

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      // Só aplicar mudança do sistema se não houver preferência salva
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode === null && !user?.preferences?.darkMode) {
        const systemPrefersDark = e.matches
        applyDarkModeToDOM(systemPrefersDark)
        setIsDarkMode(systemPrefersDark)
        localStorage.setItem('darkMode', systemPrefersDark.toString())
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [user])

  // Função para alternar modo escuro
  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !isDarkMode
      
      // Aplicar imediatamente na interface
      applyDarkModeToDOM(newDarkMode)
      setIsDarkMode(newDarkMode)
      
      // Salvar no localStorage
      localStorage.setItem('darkMode', newDarkMode.toString())
      
      // Salvar no Firebase se o usuário estiver logado
      if (user && updateUserPreferences) {
        await updateUserPreferences({
          ...user.preferences,
          darkMode: newDarkMode
        })
      }
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao alternar modo escuro:', error)
      return { success: false, error: 'Erro ao salvar preferência' }
    }
  }

  // Função para definir modo escuro diretamente
  const setDarkMode = async (darkMode) => {
    try {
      // Aplicar imediatamente na interface
      applyDarkModeToDOM(darkMode)
      setIsDarkMode(darkMode)
      
      // Salvar no localStorage
      localStorage.setItem('darkMode', darkMode.toString())
      
      // Salvar no Firebase se o usuário estiver logado
      if (user && updateUserPreferences) {
        await updateUserPreferences({
          ...user.preferences,
          darkMode: darkMode
        })
      }
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao definir modo escuro:', error)
      return { success: false, error: 'Erro ao salvar preferência' }
    }
  }

  return { 
    isDarkMode, 
    toggleDarkMode, 
    setDarkMode 
  }
}

