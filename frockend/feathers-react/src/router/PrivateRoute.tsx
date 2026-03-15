import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface Props {
  children: React.ReactNode
  onlyAdmin?: boolean
}

export default function PrivateRoute({ children, onlyAdmin = false }: Props) {
  const { user, loading } = useAuth()

  // Espera mientras verifica el token
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (onlyAdmin && user.role !== 'admin') return <Navigate to="/clients" replace />

  return <>{children}</>
}