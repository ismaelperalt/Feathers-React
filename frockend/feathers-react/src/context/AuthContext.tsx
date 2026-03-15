import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { login as loginService, logout as logoutService } from "../api/authService"
import api from "../api/axios"

interface User {
  id: number
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // ← true al inicio

  // Al iniciar recupera el usuario si hay token
 useEffect(() => {
  const token = sessionStorage.getItem("feathers-jwt")
  if (!token) {
    setLoading(false)
    return
  }

  try {
    // Decodifica el token para obtener el id del usuario
    const payload = JSON.parse(atob(token.split(".")[1]))
    const userId = payload.sub

    api.get(`/users/${userId}`).then(res => {
      setUser(res.data)
    }).catch(() => {
      sessionStorage.removeItem("feathers-jwt")
    }).finally(() => setLoading(false))

  } catch {
    sessionStorage.removeItem("feathers-jwt")
    setLoading(false)
  }
}, [])
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await loginService(email, password)
      if (response.user) {
        setUser(response.user as User)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await logoutService()
    setUser(null)
    sessionStorage.removeItem("feathers-jwt")
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return context
}