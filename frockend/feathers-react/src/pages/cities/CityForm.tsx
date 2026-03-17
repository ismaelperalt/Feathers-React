import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import feathersClient from "../../api/feathers"

interface City {
  id: number
  name: string
  state?: string
}

export default function CityForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [name, setName] = useState("")
  const [state, setState] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; state?: string }>({})

  useEffect(() => {
    if (!isEdit) return

    const service = feathersClient.service("cities")

    // Reemplazo de getCity()
    service.get(Number(id))
      .then((city: City) => {
        setName(city.name)
        setState(city.state ?? "")
      })
      .catch(() => setError("Error al cargar la ciudad"))
  }, [id])

  // Validación
  const handleBlur = (field: "name" | "state") => {
    if (field === "name") {
      if (!name.trim()) setFieldErrors(p => ({ ...p, name: "El nombre es obligatorio" }))
      else if (name.trim().length < 2) setFieldErrors(p => ({ ...p, name: "Mínimo 2 caracteres" }))
      else setFieldErrors(p => ({ ...p, name: undefined }))
    }
    if (field === "state") {
      if (state && state.trim().length < 2) setFieldErrors(p => ({ ...p, state: "Mínimo 2 caracteres" }))
      else setFieldErrors(p => ({ ...p, state: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError("El nombre de la ciudad es obligatorio"); return }
    if (name.trim().length < 2) { setError("El nombre debe tener al menos 2 caracteres"); return }
    if (state && state.trim().length < 2) { setError("La provincia debe tener al menos 2 caracteres"); return }

    setLoading(true)

    try {
      const service = feathersClient.service("cities")

      if (isEdit) {
        // Reemplazo de updateCity()
        await service.patch(Number(id), { name, state })
      } else {
        // Reemplazo de createCity()
        await service.create({ name, state })
      }

      navigate("/cities")

    } catch {
      setError("Error al guardar la ciudad")
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

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/cities")}
           className="text-gray-400 hover:text-gray-600 transition"
        >  ← Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Editar ciudad" : "Nueva ciudad"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Los campos con <span className="text-red-500">*</span> son obligatorios
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: undefined })) }}
              onBlur={() => handleBlur("name")}
              placeholder="Ej: Cuenca"
              className={inputClass(fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Provincia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={state}
              onChange={e => { setState(e.target.value); setFieldErrors(p => ({ ...p, state: undefined })) }}
              onBlur={() => handleBlur("state")}
              placeholder="Ej: Azuay"
              className={inputClass(fieldErrors.state)}
            />
            {fieldErrors.state && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                {fieldErrors.state}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/cities")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? "Guardando..." : (isEdit ? "Actualizar" : "Crear ciudad")}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}