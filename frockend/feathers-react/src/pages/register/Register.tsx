import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirm?: string
  }>({})

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    let errors: any = {}

    if (!email.trim()) errors.email = "El correo es obligatorio"
    else if (!isValidEmail(email)) errors.email = "Correo no válido"

    if (!password) errors.password = "La contraseña es obligatoria"
    else if (password.length < 4) errors.password = "Mínimo 4 caracteres"

    if (!confirm) errors.confirm = "Confirma tu contraseña"
    else if (password !== confirm) errors.confirm = "No coinciden"

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setLoading(true)
    try {
      await api.post("/users", { email, password })
      navigate("/login")
    } catch {
      setError("Error al crear la cuenta. El correo puede estar en uso.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2
     focus:border-transparent transition duration-200
     ${hasError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8 animate-fade-in">

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl
                      flex flex-col lg:flex-row
                      bg-white rounded-2xl shadow-2xl overflow-hidden
                      animate-slide-up">

        {/* 🔵 PANEL IZQUIERDO (igual al login) */}
        <div className="hidden lg:flex lg:w-1/2
                        bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900
                        flex-col items-center justify-center
                        px-10 py-16 text-white text-center relative overflow-hidden">

          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-500 opacity-10" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-purple-500 opacity-10" />

          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black">TechStore</h2>
            <p className="text-blue-400 text-xs mt-1 uppercase tracking-widest">
              Registro de usuarios
            </p>
          </div>

          <h3 className="text-3xl font-bold mb-4">
            Crea tu <span className="text-blue-400">cuenta</span>
          </h3>

          <p className="text-gray-400 text-sm max-w-xs">
            Únete y comienza a gestionar tu sistema en tiempo real.
          </p>
        </div>

        {/* 🟢 FORMULARIO */}
        <div className="w-full lg:w-1/2 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Crear cuenta
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Completa los datos para registrarte
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setFieldErrors(p => ({ ...p, email: undefined }))
                }}
                className={inputClass(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    setFieldErrors(p => ({ ...p, password: undefined }))
                  }}
                  className={`${inputClass(fieldErrors.password)} pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    // cerrado
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12
            C3.226 16.338 7.244 19.5 12 19.5
            c.993 0 1.953-.138 2.863-.395
            M6.228 6.228A10.45 10.45 0 0112 4.5
            c4.756 0 8.773 3.162 10.065 7.498
            a10.523 10.523 0 01-4.293 5.774
            M6.228 6.228L3 3m3.228 3.228l3.65 3.65
            m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65
            m0 0a3 3 0 10-4.243-4.243
            m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // abierto
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639
            C3.423 7.51 7.36 4.5 12 4.5
            c4.638 0 8.573 3.007 9.963 7.178
            .07.207.07.431 0 .639
            C20.577 16.49 16.64 19.5 12 19.5
            c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* CONFIRM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => {
                    setConfirm(e.target.value)
                    setFieldErrors(p => ({ ...p, confirm: undefined }))
                  }}
                  className={`${inputClass(fieldErrors.confirm)} pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirm ? (
                    // cerrado
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12
            C3.226 16.338 7.244 19.5 12 19.5
            c.993 0 1.953-.138 2.863-.395
            M6.228 6.228A10.45 10.45 0 0112 4.5
            c4.756 0 8.773 3.162 10.065 7.498
            a10.523 10.523 0 01-4.293 5.774
            M6.228 6.228L3 3m3.228 3.228l3.65 3.65
            m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65
            m0 0a3 3 0 10-4.243-4.243
            m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // abierto
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639
            C3.423 7.51 7.36 4.5 12 4.5
            c4.638 0 8.573 3.007 9.963 7.178
            .07.207.07.431 0 .639
            C20.577 16.49 16.64 19.5 12 19.5
            c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {fieldErrors.confirm && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirm}</p>
              )}
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700
                         hover:from-blue-700 hover:to-blue-800
                         disabled:from-blue-300 disabled:to-blue-300
                         text-white font-semibold py-2.5 rounded-lg text-sm
                         transition shadow-md"
            >
              {loading ? "Creando..." : "Registrarse"}
            </button>

          </form>

          <p className="text-center lg:text-left text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión
            </button>
          </p>

        </div>
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
      `}</style>

    </div>
  )
}