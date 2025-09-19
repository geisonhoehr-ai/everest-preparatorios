import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'administrator' | 'teacher'
  logged_in: boolean
}

export function useAuthTemp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const authData = localStorage.getItem('auth_user')
    if (authData) {
      try {
        const userData = JSON.parse(authData)
        if (userData.logged_in) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao parsear dados de autenticação:', error)
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const users = [
      { email: "aluno@teste.com", password: "123456", role: "student", name: "Aluno Teste" },
      { email: "admin@teste.com", password: "123456", role: "admin", name: "Admin Teste" },
      { email: "professor@teste.com", password: "123456", role: "teacher", name: "Professor Teste" }
    ]

    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData: User = {
        id: `${foundUser.role}-123`,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role as 'student' | 'administrator' | 'teacher',
        logged_in: true
      }
      
      localStorage.setItem('auth_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }
    
    return { success: false, error: 'Credenciais inválidas' }
  }

  const logout = () => {
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const isLoggedIn = () => {
    return user?.logged_in === true
  }

  const hasRole = (requiredRole: string) => {
    return user?.role === requiredRole
  }

  return {
    user,
    loading,
    login,
    logout,
    isLoggedIn,
    hasRole
  }
}
