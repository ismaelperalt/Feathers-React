import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { login as loginService, logout as logoutService } from "../api/authService"
import api from "../api/axios"
import feathersClient from "../api/feathers"

interface User {
  id: number
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem("feathers-jwt")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))

      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        sessionStorage.removeItem("feathers-jwt")
        setLoading(false)
        return
      }

      api.get(`/users/${payload.sub}`)
        .then(res => setUser(res.data))
        .catch(() => sessionStorage.removeItem("feathers-jwt"))
        .finally(() => setLoading(false))

      feathersClient.authenticate({ strategy: "jwt", accessToken: token })
        .then(() => console.log("Socket autenticado ✓"))
        .catch(err => console.warn("Socket sin autenticar:", err))

    } catch {
      sessionStorage.removeItem("feathers-jwt")
      setLoading(false)
    }
  }, [])

  // ✅ Escucha cambios de rol en tiempo real
  useEffect(() => {
    if (!user) return

    const service = feathersClient.service("users")

    const handlePatched = (data: User) => {
      // Solo actualiza si es el usuario actualmente logueado
      if (data.id === user.id) {
        setUser(prev => prev ? { ...prev, ...data } : prev)
      }
    }

    const handleRemoved = (data: User) => {
      // Si eliminan al usuario logueado, forzar logout
      if (data.id === user.id) {
        logoutService()
        feathersClient.logout()
        sessionStorage.removeItem("feathers-jwt")
        setUser(null)
        window.location.href = "/login"
      }
    }

    service.on("patched", handlePatched)
    service.on("removed", handleRemoved)

    return () => {
      service.off("patched", handlePatched)
      service.off("removed", handleRemoved)
    }
  }, [user?.id]) // ✅ solo se re-suscribe si cambia el id del usuario

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true)
    try {
      const response = await loginService(email, password)
      const loggedUser = response.user as User
      setUser(loggedUser)

      await feathersClient.authenticate({
        strategy: "jwt",
        accessToken: response.accessToken
      })

      return loggedUser
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await logoutService()
    await feathersClient.logout()
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