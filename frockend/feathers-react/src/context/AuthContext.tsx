import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
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

      // Token expirado → limpiar
      if (payload.exp && payload.exp < now) {
        sessionStorage.removeItem("feathers-jwt")
        setLoading(false)
        return
      }

      
      feathersClient.authenticate({ strategy: "jwt", accessToken: token })
        .then(async () => {
          const userData = await feathersClient.service("users").get(payload.sub)
          setUser(userData as User)
        })
        .catch(() => {
          sessionStorage.removeItem("feathers-jwt")
        })
        .finally(() => setLoading(false))

    } catch {
      sessionStorage.removeItem("feathers-jwt")
      setLoading(false)
    }
  }, [])

  // Escucha cambios de rol y eliminación en tiempo real
  useEffect(() => {
    if (!user) return

    const service = feathersClient.service("users")

    const handlePatched = (data: User) => {
      if (data.id === user.id) {
        setUser(prev => prev ? { ...prev, ...data } : prev)
      }
    }

    const handleRemoved = (data: User) => {
      if (data.id === user.id) {
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
  }, [user?.id])

  
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true)
    try {
      const response = await feathersClient.authenticate({
        strategy: "local",
        email,
        password
      })

      const loggedUser = response.user as User
      setUser(loggedUser)
      return loggedUser
    } finally {
      setLoading(false)
    }
  }

 
  const logout = async () => {
    await feathersClient.logout()
    sessionStorage.removeItem("feathers-jwt")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === "admin"
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