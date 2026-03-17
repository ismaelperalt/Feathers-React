import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import feathersClient from "../../api/feathers"
import type { City } from "../../api/publicService"

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

  useEffect(() => {
    const addressService = feathersClient.service("addresses")
    const cityService = feathersClient.service("cities")

    // ✅ Cargar ciudades (ANTES getCities)
    cityService.find()
      .then((res: any) => setCities(res.data))
      .catch(() => setError("Error al cargar ciudades"))

    // ✅ Cargar dirección (ANTES getAddress)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // ✅ Validaciones (igual que tenías)
    if (!street.trim()) {
      setError("La calle es obligatoria")
      return
    }
    if (!cityId) {
      setError("Debes seleccionar una ciudad")
      return
    }

    setLoading(true)

    try {
      const data = {
        street,
        number,
        reference,
        city_id: Number(cityId)
      }

      const service = feathersClient.service("addresses")

      // ✅ create / patch (ANTES createAddress/updateAddress)
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

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/addresses")}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Editar dirección" : "Nueva dirección"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
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
              onChange={e => { setStreet(e.target.value); setError(null) }}
              placeholder="Ej: Av. Loja"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:border-transparent transition
                ${!street.trim() && error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
            />
          </div>

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <input
              type="text"
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="Ej: 123"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Ej: Cerca del mall"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <select
              value={cityId}
              onChange={e => { setCityId(Number(e.target.value)); setError(null) }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:border-transparent transition
                ${!cityId && error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
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