import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createClient, updateClient, getClient } from "../../api/clientService"
import { getAddresses } from "../../api/publicService"
import type { Address } from "../../api/publicService"
import { useAuth } from "../../context/AuthContext"
import { getUsers } from "../../api/userService"
import type { User } from "../../api/userService"

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { isAdmin } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [addressId, setAddressId] = useState<number | "">("")
  const [userId, setUserId] = useState<number | "">("")
  const [addresses, setAddresses] = useState<Address[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAddresses().then(setAddresses)
    if (isAdmin) getUsers().then(setUsers)
    if (!isEdit) return
    getClient(Number(id)).then(client => {
      setName(client.name)
      setEmail(client.email)
      setPhone(client.phone ?? "")
      setAddressId(client.address_id ?? "")
      setUserId(client.user_id ?? "")
    })
  }, [id])

  // Al seleccionar usuario llena el email automáticamente
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value)
    setUserId(selectedId)
    const selectedUser = users.find(u => u.id === selectedId)
    if (selectedUser) {
      setEmail(selectedUser.email)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data: any = { name, email, phone, address_id: Number(addressId) }
      if (isAdmin && userId) data.user_id = Number(userId)
      if (isEdit) {
        await updateClient(Number(id), data)
      } else {
        await createClient(data)
      }
      navigate("/clients")
    } catch {
      setError("Error al guardar el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/clients")} className="text-gray-400 hover:text-gray-600 transition">
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Editar cliente" : "Nuevo cliente"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Selector de usuario arriba - solo admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignar a usuario
              </label>
              <select
                value={userId}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Selecciona un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Email oculto - se llena automático */}
          <input type="hidden" value={email} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ej: 0999999999"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <select
              value={addressId}
              onChange={e => setAddressId(Number(e.target.value))}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Selecciona una dirección</option>
              {addresses.map(address => (
                <option key={address.id} value={address.id}>
                  {address.street} {address.number} - {address.city?.name ?? ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/clients")}
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