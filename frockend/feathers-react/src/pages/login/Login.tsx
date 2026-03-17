import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// ── Helpers de validación ──────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

const validateFields = (email: string, password: string): string | null => {
  if (!email.trim()) return "El correo es obligatorio"
  if (!isValidEmail(email)) return "Ingresa un correo electrónico válido"
  if (!password) return "La contraseña es obligatoria"
  if (password.length < 4) return "La contraseña debe tener al menos 4 caracteres"
  return null
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const { login, loading } = useAuth() // ✅ ya no necesitamos "user" aquí
  const navigate = useNavigate()

  const handleBlur = (field: "email" | "password") => {
    if (field === "email") {
      if (!email.trim()) setFieldErrors(p => ({ ...p, email: "El correo es obligatorio" }))
      else if (!isValidEmail(email)) setFieldErrors(p => ({ ...p, email: "Correo no válido" }))
      else setFieldErrors(p => ({ ...p, email: undefined }))
    }
    if (field === "password") {
      if (!password) setFieldErrors(p => ({ ...p, password: "La contraseña es obligatoria" }))
      else if (password.length < 4) setFieldErrors(p => ({ ...p, password: "Mínimo 4 caracteres" }))
      else setFieldErrors(p => ({ ...p, password: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateFields(email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const loggedUser = await login(email, password) // ✅ fix race condition
      navigate(loggedUser?.role === 'admin' ? '/dashboard' : '/clients')
    } catch {
      setError("Credenciales incorrectas o error del servidor")
    }
  }

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2
     focus:border-transparent transition duration-200
     ${hasError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8 md:px-8 lg:px-0">

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl
                      flex flex-col lg:flex-row
                      bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* ── Panel izquierdo — solo visible en lg ── */}
        <div className="hidden lg:flex lg:w-1/2
                        bg-blue-600 flex-col items-center justify-center
                        px-10 py-16 text-white text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto opacity-90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3">¡Hola de nuevo!</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Inicia sesión para gestionar tus clientes, reportes y mucho más desde un solo lugar.
          </p>
        </div>

        {/* ── Panel derecho — formulario ── */}
        <div className="w-full lg:w-1/2 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Bienvenido</h1>
            <p className="text-gray-500 mt-1 text-sm">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })) }}
                onBlur={() => handleBlur("email")}
                placeholder="tucorreo@ejemplo.com"
                className={inputClass(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })) }}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={inputClass(fieldErrors.password)}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                         text-white font-semibold py-2.5 rounded-lg text-sm
                         transition duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Ingresando...
                </span>
              ) : "Ingresar"}
            </button>

          </form>

          <p className="text-center lg:text-left text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline font-medium"
            >
              Regístrate
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}