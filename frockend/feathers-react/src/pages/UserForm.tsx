import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import feathersClient from "../api/feathers"

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export default function UserForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  // ✅ Carga datos del usuario si es edición
  useEffect(() => {
    if (!isEdit) return
    feathersClient.service("users").get(Number(id))
      .then((user: any) => {
        setEmail(user.email)
        setRole(user.role)
      })
      .catch(() => setError("Error al cargar el usuario"))
  }, [id])

  const handleBlur = (field: "email" | "password") => {
    if (field === "email") {
      if (!email.trim()) setFieldErrors(p => ({ ...p, email: "El correo es obligatorio" }))
      else if (!isValidEmail(email)) setFieldErrors(p => ({ ...p, email: "Correo no válido" }))
      else setFieldErrors(p => ({ ...p, email: undefined }))
    }
    if (field === "password") {
      // ✅ En edición la contraseña es opcional
      if (!isEdit && !password) setFieldErrors(p => ({ ...p, password: "La contraseña es obligatoria" }))
      else if (password && password.length < 4) setFieldErrors(p => ({ ...p, password: "Mínimo 4 caracteres" }))
      else setFieldErrors(p => ({ ...p, password: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido")
      return
    }
    // ✅ Contraseña obligatoria solo al crear
    if (!isEdit && (!password || password.length < 4)) {
      setError("La contraseña debe tener al menos 4 caracteres")
      return
    }
    // ✅ Si se ingresó contraseña al editar, validar longitud
    if (isEdit && password && password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres")
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        // ✅ Solo envía contraseña si se ingresó una nueva
        const data: any = { email, role }
        if (password) data.password = password
        await feathersClient.service("users").patch(Number(id), data)
      } else {
        await feathersClient.service("users").create({ email, password, role })
      }
      navigate("/users")
    } catch (err: any) {
      if (err?.code === 409 || err?.message?.includes("duplicate")) {
        setError("El correo ya está en uso.")
      } else {
        setError("Error al guardar el usuario.")
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2
     focus:border-transparent transition duration-200
     ${hasError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/users")}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Editar usuario" : "Nuevo usuario"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })) }}
              onBlur={() => handleBlur("email")}
              placeholder="correo@ejemplo.com"
              className={inputClass(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {isEdit
                ? <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>
                : <span className="text-red-500">*</span>
              }
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })) }}
              onBlur={() => handleBlur("password")}
              placeholder={isEdit ? "Nueva contraseña (opcional)" : "••••••••"}
              className={inputClass(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear usuario"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}