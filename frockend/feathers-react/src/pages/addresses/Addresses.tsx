import { useEffect, useState } from "react"
import type { Address } from "../../api/publicService"
import feathersClient from "../../api/feathers"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

// ✅ Colores para avatares según inicial
const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-purple-500",
    "bg-amber-500", "bg-rose-500", "bg-cyan-500",
    "bg-indigo-500", "bg-pink-500"
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const service = feathersClient.service("addresses")

    // ✅ CARGA INICIAL (sin axios)
    service.find()
      .then((res: any) => setAddresses(res.data))
      .catch(() => setError("Error al cargar las direcciones"))
      .finally(() => setLoading(false))

    // ✅ SOCKETS TIEMPO REAL
    const handleCreated = (data: Address) => {
      setAddresses(prev => [...prev, data])
    }

    const handlePatched = (data: Address) => {
      setAddresses(prev =>
        prev.map(a => a.id === data.id ? data : a)
      )
    }

    const handleRemoved = (data: Address) => {
      setAddresses(prev =>
        prev.filter(a => a.id !== data.id)
      )
    }

    service.on("created", handleCreated)
    service.on("patched", handlePatched)
    service.on("removed", handleRemoved)

    return () => {
      service.off("created", handleCreated)
      service.off("patched", handlePatched)
      service.off("removed", handleRemoved)
    }
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta dirección?")) return
    try {
      await feathersClient.service("addresses").remove(id)
    } catch {
      setError("Error al eliminar la dirección")
    }
  }

  // ✅ Filtro (igual que tenías)
  const filtered = addresses.filter(a =>
    a.street?.toLowerCase().includes(search.toLowerCase()) ||
    a.city?.name?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Direcciones</h1>
          <p className="text-sm text-gray-400 mt-0.5">{addresses.length} registradas</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/addresses/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva dirección
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
          placeholder="Buscar por calle o ciudad..."
          className="w-full sm:w-80 pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">
            {search ? `Sin resultados para "${search}"` : "No hay direcciones registradas"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Referencia</th>
                <th className="px-4 py-3">Ciudad</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(address => (
                <tr key={address.id} className="hover:bg-gray-50 transition">

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(address.street ?? "?")} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">
                          {address.street?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{address.street}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">{address.number ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{address.reference ?? "—"}</td>

                  <td className="px-4 py-3">
                    
                     <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {address.city?.name ?? "—"}
                      </span>
                  </td>


                

                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/addresses/edit/${address.id}`)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
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
            Mostrando {filtered.length} de {addresses.length} direcciones
          </div>
        </div>
      )}
    </div>
  )
}