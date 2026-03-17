import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createClient, updateClient, getClient } from "../../api/clientService"
import { getAddresses } from "../../api/publicService"
import type { Address } from "../../api/publicService"
import { useAuth } from "../../context/AuthContext"
import { getUsers } from "../../api/userService"
import type { User } from "../../api/userService"

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

const isValidPhone = (phone: string) =>
  /^[0-9]{7,15}$/.test(phone.trim())

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
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    phone?: string
    addressId?: string
    userId?: string
  }>({})

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

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value)
    setUserId(selectedId)
    setFieldErrors(p => ({ ...p, userId: undefined }))
    const selectedUser = users.find(u => u.id === selectedId)
    if (selectedUser) setEmail(selectedUser.email)
  }

  // ✅ Validación de campos individuales al perder foco
  const handleBlur = (field: string) => {
    switch (field) {
      case "name":
        if (!name.trim()) setFieldErrors(p => ({ ...p, name: "El nombre es obligatorio" }))
        else if (name.trim().length < 3) setFieldErrors(p => ({ ...p, name: "Mínimo 3 caracteres" }))
        else setFieldErrors(p => ({ ...p, name: undefined }))
        break
      case "email":
        if (email && !isValidEmail(email)) setFieldErrors(p => ({ ...p, email: "Correo no válido" }))
        else setFieldErrors(p => ({ ...p, email: undefined }))
        break
      case "phone":
        if (phone && !isValidPhone(phone)) setFieldErrors(p => ({ ...p, phone: "Solo números, 7-15 dígitos" }))
        else setFieldErrors(p => ({ ...p, phone: undefined }))
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // ✅ Validación completa antes de llamar al servidor
    if (!name.trim()) { setError("El nombre es obligatorio"); return }
    if (name.trim().length < 3) { setError("El nombre debe tener al menos 3 caracteres"); return }
    if (email && !isValidEmail(email)) { setError("El correo no es válido"); return }
    if (phone && !isValidPhone(phone)) { setError("El teléfono solo debe contener números (7-15 dígitos)"); return }
    if (!addressId) { setError("Debes seleccionar una dirección"); return }
    if (isAdmin && !userId) { setError("Debes seleccionar un usuario"); return }

    setLoading(true)
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

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2
     focus:border-transparent transition duration-200
     ${hasError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`

  const selectClass = (hasError?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2
     focus:border-transparent transition duration-200
     ${hasError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/clients")}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ← Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Editar cliente" : "Nuevo cliente"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Los campos con <span className="text-red-500">*</span> son obligatorios
          </p>
        </div>
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

          {/* ✅ Selector de usuario — solo admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignar a usuario <span className="text-red-500">*</span>
              </label>
              <select
                value={userId}
                onChange={handleUserChange}
                className={selectClass(fieldErrors.userId)}
              >
                <option value="">Selecciona un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.role})
                  </option>
                ))}
              </select>
              {fieldErrors.userId && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.userId}</p>
              )}
            </div>
          )}

          {/* ✅ Email — solo lectura si viene del usuario seleccionado */}
          {isAdmin && email && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="text-sm text-blue-700 font-medium">{email}</span>
              <span className="text-xs text-blue-400 ml-auto">Email asignado</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: undefined })) }}
              onBlur={() => handleBlur("name")}
              placeholder="Ej: Juan Pérez"
              className={inputClass(fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: undefined })) }}
              onBlur={() => handleBlur("phone")}
              placeholder="Ej: 0999999999"
              className={inputClass(fieldErrors.phone)}
            />
            {fieldErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <select
              value={addressId}
              onChange={e => { setAddressId(Number(e.target.value)); setFieldErrors(p => ({ ...p, addressId: undefined })) }}
              className={selectClass(fieldErrors.addressId)}
            >
              <option value="">Selecciona una dirección</option>
              {addresses.map(address => (
                <option key={address.id} value={address.id}>
                  {address.street} {address.number} — {address.city?.name ?? ""}
                </option>
              ))}
            </select>
            {fieldErrors.addressId && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.addressId}</p>
            )}
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