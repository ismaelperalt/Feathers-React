import { useEffect, useState } from "react"
import { getCities, deleteCity } from "../../api/publicService"
import type { City } from "../../api/publicService"
import feathersClient from "../../api/feathers"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

interface FeathersService {
  on(event: string, handler: (data: unknown) => void): void
  off(event: string, handler: (data: unknown) => void): void
}

export default function Cities() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const service = feathersClient.service("cities") as unknown as FeathersService

    const handleCreated = (data: unknown) => {
      const newCity = data as City
      if (newCity?.id) setCities(prev => [...prev, newCity])
    }
    const handlePatched = (data: unknown) => {
      const updated = data as City
      setCities(prev => prev.map(c => c.id === updated.id ? updated : c))
    }
    const handleRemoved = (data: unknown) => {
      const removed = data as City
      setCities(prev => prev.filter(c => c.id !== removed.id))
    }

    // 1. Primero suscribirse
    service.on("created", handleCreated)
    service.on("patched", handlePatched)
    service.on("removed", handleRemoved)

    //  2. Luego cargar datos iniciales
    getCities()
      .then(setCities)
      .catch(() => setError("Error al cargar las ciudades"))
      .finally(() => setLoading(false))

    return () => {
      service.off("created", handleCreated)
      service.off("patched", handlePatched)
      service.off("removed", handleRemoved)
    }
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta ciudad?")) return
    try {
      await deleteCity(id)
      // sin setClients manual — el socket "removed" ya lo maneja
    } catch {
      setError("Error al eliminar la ciudad")
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 m-4">
      {error}
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ciudades</h1>
        {isAdmin && (
          <button
            onClick={() => navigate("/cities/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Nueva ciudad
          </button>
        )}
      </div>

      {cities.length === 0 ? (
        <div className="text-center text-gray-400 py-16">No hay ciudades registradas.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Provincia</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cities.map(city => (
                <tr key={city.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{city.name}</td>
                  <td className="px-4 py-3 text-gray-600">{city.state ?? "—"}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/cities/edit/${city.id}`)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(city.id)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}