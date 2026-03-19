import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

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
  const [showPassword, setShowPassword] = useState(false) //  mostrar/ocultar
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const { login, loading } = useAuth()
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
      const loggedUser = await login(email, password)
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
    // Animación sutil al cargar
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8 md:px-8 lg:px-0 animate-fade-in">

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl
                      flex flex-col lg:flex-row
                      bg-white rounded-2xl shadow-2xl overflow-hidden
                      animate-slide-up">

        {/* ── Panel izquierdo — gradiente oscuro ── */}
        <div className="hidden lg:flex lg:w-1/2
                        bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900
                        flex-col items-center justify-center
                        px-10 py-16 text-white text-center relative overflow-hidden">

          {/* Círculos decorativos de fondo */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-500 opacity-10" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-purple-500 opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600 opacity-5" />

          {/* Logo y marca */}
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">TechStore</h2>
            <p className="text-blue-400 text-xs font-medium mt-1 tracking-widest uppercase">Panel de gestión</p>
          </div>

          {/* Texto */}
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 leading-tight">
              ¡Hola de <br />
              <span className="text-blue-400">nuevo!</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Gestiona tus clientes, ciudades y direcciones desde un solo lugar de manera eficiente.
            </p>
          </div>

          {/* Features */}
          <div className="relative z-10 mt-8 space-y-3 w-full max-w-xs">
            {["Gestión de clientes", "Control de usuarios", "Tiempo real con sockets"].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>

        </div>

        {/* ── Panel derecho — formulario ── */}
        <div className="w-full lg:w-1/2 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">

          {/* Logo visible solo en mobile */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-black text-gray-800">TechStore</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Iniciar sesión</h1>
            <p className="text-gray-500 mt-1 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })) }}
                  onBlur={() => handleBlur("email")}
                  placeholder="tucorreo@ejemplo.com"
                  className={inputClass(fieldErrors.email)}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              {/* ✅ Mostrar/ocultar contraseña */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })) }}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  className={`${inputClass(fieldErrors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    // Ojo cerrado
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Ojo abierto
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/*Botón con gradiente */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700
                         hover:from-blue-700 hover:to-blue-800
                         disabled:from-blue-300 disabled:to-blue-300
                         text-white font-semibold py-2.5 rounded-lg text-sm
                         transition duration-200 cursor-pointer disabled:cursor-not-allowed
                         shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Ingresar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              )}
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

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>

    </div>
  )
}