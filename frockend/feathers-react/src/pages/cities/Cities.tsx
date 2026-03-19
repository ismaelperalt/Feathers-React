import { useEffect, useState } from "react"
import type { City } from "../../types"
import feathersClient from "../../api/feathers"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

interface FeathersService {
  on(event: string, handler: (data: unknown) => void): void
  off(event: string, handler: (data: unknown) => void): void
  find(): Promise<any>
  remove(id: number): Promise<any>
}

//  Colores para avatares según inicial
const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-purple-500",
    "bg-amber-500", "bg-rose-500", "bg-cyan-500",
    "bg-indigo-500", "bg-pink-500"
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

export default function Cities() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
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

    service.on("created", handleCreated)
    service.on("patched", handlePatched)
    service.on("removed", handleRemoved)

    // Reemplazo de getCities()
    service.find()
      .then((res: any) => setCities(res.data))
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
      // Reemplazo de deleteCity()
      const service = feathersClient.service("cities") as unknown as FeathersService
      await service.remove(id)
    } catch {
      setError("Error al eliminar la ciudad")
    }
  }

  // Filtro por nombre o provincia
  const filtered = cities.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.toLowerCase().includes(search.toLowerCase())
  )

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ciudades</h1>
          <p className="text-sm text-gray-400 mt-0.5">{cities.length} registradas</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/cities/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva ciudad
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o provincia..."
          className="w-full sm:w-80 pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabla o estado vacío */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            {search ? `Sin resultados para "${search}"` : "No hay ciudades registradas"}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-blue-500 text-sm mt-2 hover:underline">
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Provincia</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(city => (
                <tr key={city.id} className="hover:bg-gray-50 transition">

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(city.name ?? "?")} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">
                          {city.name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{city.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {city.state ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-100">
                        {city.state}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

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

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
            Mostrando {filtered.length} de {cities.length} ciudades
          </div>
        </div>
      )}
    </div>
  )
}