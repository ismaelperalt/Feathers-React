import { useEffect, useState } from "react"
import { getAddresses, deleteAddress } from "../api/publicService"
import type { Address } from "../api/publicService"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setError("Error al cargar las direcciones"))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta dirección?")) return
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {
      setError("Error al eliminar la dirección")
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
        <h1 className="text-2xl font-bold text-gray-800">Direcciones</h1>
        {isAdmin && (
          <button
            onClick={() => navigate("/addresses/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Nueva dirección
          </button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="text-center text-gray-400 py-16">No hay direcciones registradas.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Calle</th>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Referencia</th>
                <th className="px-4 py-3">Ciudad</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {addresses.map(address => (
                <tr key={address.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{address.street}</td>
                  <td className="px-4 py-3 text-gray-600">{address.number ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{address.reference ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{address.city?.name ?? "—"}</td>
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
        </div>
      )}
    </div>
  )
}