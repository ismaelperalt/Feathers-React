import { useEffect, useState } from "react"
import { getClients, deleteClient } from "../api/clientService"
import type { Client } from "../api/clientService"
import feathersClient from "../api/feathers"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

interface FeathersService {
  on(event: string, handler: (data: unknown) => void): void
  off(event: string, handler: (data: unknown) => void): void
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const navigate = useNavigate()   // ← reemplaza window.location.href

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(() => setError("Error al cargar los clientes"))
      .finally(() => setLoading(false))

    const service = feathersClient.service("clients") as unknown as FeathersService

    const handleCreated = (data: unknown) => {
      const newClient = data as Client
      if (newClient?.id) setClients(prev => [...prev, newClient])
    }
    const handlePatched = (data: unknown) => {
      const updated = data as Client
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
    }
    const handleRemoved = (data: unknown) => {
      const removed = data as Client
      setClients(prev => prev.filter(c => c.id !== removed.id))
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
    if (!confirm("¿Eliminar este cliente?")) return
    try {
      await deleteClient(id)
    } catch {
      setError("Error al eliminar el cliente")
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
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        {isAdmin && (
          <button
            onClick={() => navigate("/clients/create")}  // ← navigate
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Nuevo cliente
          </button>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="text-center text-gray-400 py-16">No hay clientes registrados.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Ciudad</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{client.email}</td>
                  <td className="px-4 py-3 text-gray-600">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{client.address?.street ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{client.address?.city?.name ?? "—"}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/clients/edit/${client.id}`)}  // ← navigate
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
        </div>
      )}
    </div>
  )
}