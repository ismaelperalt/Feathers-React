import { useEffect, useState } from "react"
import { getUsers, updateUserRole, deleteUser } from "../api/userService"
import type { User } from "../api/userService"
import feathersClient from "../api/feathers"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const service = feathersClient.service("users")

    const handleCreated = (data: User) => {
      if (data?.id) setUsers(prev => [...prev, data])
    }
    const handlePatched = (data: User) => {
      setUsers(prev => prev.map(u => u.id === data.id ? data : u))
    }
    const handleRemoved = (data: User) => {
      setUsers(prev => prev.filter(u => u.id !== data.id))
    }

    service.on("created", handleCreated)
    service.on("patched", handlePatched)
    service.on("removed", handleRemoved)

    getUsers()
      .then(setUsers)
      .catch(() => setError("Error al cargar los usuarios"))
      .finally(() => setLoading(false))

    return () => {
      service.off("created", handleCreated)
      service.off("patched", handlePatched)
      service.off("removed", handleRemoved)
    }
  }, [])

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateUserRole(id, role)
    } catch {
      setError("Error al actualizar el rol")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return
    try {
      await deleteUser(id)
    } catch {
      setError("Error al eliminar el usuario")
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
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button
          onClick={() => navigate("/users/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {u.email}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      Tú
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.id === currentUser?.id ? (
                    <span className="text-gray-500 capitalize">{u.role}</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {u.id !== currentUser?.id && (
                    <>
                      {/* ✅ Botón editar agregado */}
                      <button
                        onClick={() => navigate(`/users/edit/${u.id}`)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}