import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import feathersClient from "../../api/feathers"
import type { City } from "../../types/index"

// ✅ Calle: letras, números, puntos, guiones, espacios — mínimo 3, máximo 80
const isValidStreet = (street: string) =>
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.\-]{3,80}$/.test(street.trim())

// ✅ Número: solo números y guiones (ej: 123, 12-A)
const isValidNumber = (num: string) =>
  /^[a-zA-Z0-9\-]{1,10}$/.test(num.trim())

export default function AddressForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [reference, setReference] = useState("")
  const [cityId, setCityId] = useState<number | "">("")
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    street?: string
    number?: string
    reference?: string
    cityId?: string
  }>({})

  useEffect(() => {
    const addressService = feathersClient.service("addresses")
    const cityService = feathersClient.service("cities")

    cityService.find()
      .then((res: any) => setCities(res.data))
      .catch(() => setError("Error al cargar ciudades"))

    if (!isEdit) return

    addressService.get(Number(id))
      .then((address: any) => {
        setStreet(address.street)
        setNumber(address.number ?? "")
        setReference(address.reference ?? "")
        setCityId(address.city_id ?? "")
      })
      .catch(() => setError("Error al cargar la dirección"))
  }, [id, isEdit])

  //  Validación por campo al perder foco
  const handleBlur = (field: string) => {
    switch (field) {
      case "street":
        if (!street.trim())
          setFieldErrors(p => ({ ...p, street: "La calle es obligatoria" }))
        else if (!isValidStreet(street))
          setFieldErrors(p => ({ ...p, street: "Mínimo 3 caracteres, solo letras, números y espacios" }))
        else
          setFieldErrors(p => ({ ...p, street: undefined }))
        break

      case "number":
        if (number && !isValidNumber(number))
          setFieldErrors(p => ({ ...p, number: "Solo letras, números y guiones (ej: 123 o 12-A)" }))
        else
          setFieldErrors(p => ({ ...p, number: undefined }))
        break

      case "reference":
        if (reference && reference.trim().length > 100)
          setFieldErrors(p => ({ ...p, reference: "Máximo 100 caracteres" }))
        else
          setFieldErrors(p => ({ ...p, reference: undefined }))
        break

      case "cityId":
        if (!cityId)
          setFieldErrors(p => ({ ...p, cityId: "Debes seleccionar una ciudad" }))
        else
          setFieldErrors(p => ({ ...p, cityId: undefined }))
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!street.trim()) { setError("La calle es obligatoria"); return }
    if (!isValidStreet(street)) { setError("La calle solo puede contener letras, números y espacios (mínimo 3 caracteres)"); return }
    if (number && !isValidNumber(number)) { setError("El número solo puede contener letras, números y guiones"); return }
    if (reference && reference.trim().length > 100) { setError("La referencia no puede superar los 100 caracteres"); return }
    if (!cityId) { setError("Debes seleccionar una ciudad"); return }

    setLoading(true)
    try {
      const data = { street, number, reference, city_id: Number(cityId) }
      const service = feathersClient.service("addresses")
      if (isEdit) {
        await service.patch(Number(id), data)
      } else {
        await service.create(data)
      }
      navigate("/addresses")
    } catch {
      setError("Error al guardar la dirección")
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
        <button onClick={() => navigate("/addresses")} className="text-gray-400 hover:text-gray-600 transition">
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Editar dirección" : "Nueva dirección"}
        </h1>
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

          {/* Calle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={street}
              onChange={e => { setStreet(e.target.value); setFieldErrors(p => ({ ...p, street: undefined })) }}
              onBlur={() => handleBlur("street")}
              placeholder="Ej: Av. Loja"
              className={inputClass(fieldErrors.street)}
            />
            {fieldErrors.street && <p className="text-red-500 text-xs mt-1">{fieldErrors.street}</p>}
          </div>

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={number}
              onChange={e => { setNumber(e.target.value); setFieldErrors(p => ({ ...p, number: undefined })) }}
              onBlur={() => handleBlur("number")}
              placeholder="Ej: 123 o 12-A"
              className={inputClass(fieldErrors.number)}
            />
            {fieldErrors.number && <p className="text-red-500 text-xs mt-1">{fieldErrors.number}</p>}
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => { setReference(e.target.value); setFieldErrors(p => ({ ...p, reference: undefined })) }}
              onBlur={() => handleBlur("reference")}
              placeholder="Ej: Cerca del mall"
              className={inputClass(fieldErrors.reference)}
            />
            {fieldErrors.reference && <p className="text-red-500 text-xs mt-1">{fieldErrors.reference}</p>}
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <select
              value={cityId}
              onChange={e => { setCityId(Number(e.target.value)); setFieldErrors(p => ({ ...p, cityId: undefined })) }}
              onBlur={() => handleBlur("cityId")}
              className={inputClass(fieldErrors.cityId)}
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
            {fieldErrors.cityId && <p className="text-red-500 text-xs mt-1">{fieldErrors.cityId}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/addresses")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}