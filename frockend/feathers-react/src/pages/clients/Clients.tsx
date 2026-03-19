import { useEffect, useState } from "react"
import type { Client } from "../../types"
import feathersClient from "../../api/feathers"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-purple-500",
    "bg-amber-500", "bg-rose-500", "bg-cyan-500",
    "bg-indigo-500", "bg-pink-500"
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

// Badge de tipo de cliente
const clientTypeBadge = (type?: string) => {
  switch (type) {
    case "vip":
      return "bg-amber-50 text-amber-700 border-amber-100"
    case "empresa":
      return "bg-purple-50 text-purple-700 border-purple-100"
    default:
      return "bg-gray-50 text-gray-600 border-gray-200"
  }
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const service = feathersClient.service("clients")

    const handleCreated = (data: Client) => {
      if (data?.id) setClients(prev => [...prev, data])
    }
    const handlePatched = (data: Client) => {
      setClients(prev => prev.map(c => c.id === data.id ? data : c))
    }
    const handleRemoved = (data: Client) => {
      setClients(prev => prev.filter(c => c.id !== data.id))
    }

    service.on("created", handleCreated)
    service.on("patched", handlePatched)
    service.on("removed", handleRemoved)

    service.find()
      .then((res: any) => setClients(res.data))
      .catch(() => setError("Error al cargar los clientes"))
      .finally(() => setLoading(false))

    return () => {
      service.off("created", handleCreated)
      service.off("patched", handlePatched)
      service.off("removed", handleRemoved)
    }
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return
    try {
      await feathersClient.service("clients").remove(id)
    } catch {
      setError("Error al eliminar el cliente")
    }
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{clients.length} registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/clients/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo cliente
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
          placeholder="Buscar por nombre o email..."
          className="w-full sm:w-80 pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            {search ? `Sin resultados para "${search}"` : "No hay clientes registrados"}
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
                <th className="px-4 py-3">Correo del Usario</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition">

                  {/* Email + avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(client.email ?? "?")} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">
                          {client.email?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{client.email}</span>
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(client.name ?? "?")} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">
                          {client.name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{client.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">{client.phone ?? "—"}</td>

                  {/* Ciudad */}
                  <td className="px-4 py-3">
                    {client.address?.city?.name ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {client.address.city.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Tipo de cliente */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${clientTypeBadge(client.client_type)}`}>
                      {client.client_type ?? "regular"}
                    </span>
                  </td>

                  {/*Estado activo */}
                  <td className="px-4 py-3">
                    {client.active !== false ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Inactivo
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/clients/edit/${client.id}`)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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
            Mostrando {filtered.length} de {clients.length} clientes
          </div>
        </div>
      )}
    </div>
  )
}