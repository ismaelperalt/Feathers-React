import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import feathersClient from "../../api/feathers"
import type { Address } from "../../api/publicService"
import { useAuth } from "../../context/AuthContext"
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
    const clientService = feathersClient.service("clients")
    const addressService = feathersClient.service("addresses")
    const userService = feathersClient.service("users")

    // ✅ carga inicial
    addressService.find().then((res: any) => setAddresses(res.data))
    if (isAdmin) userService.find().then((res: any) => setUsers(res.data))

    if (isEdit) {
      clientService.get(Number(id)).then((client: any) => {
        setName(client.name)
        setEmail(client.email)
        setPhone(client.phone ?? "")
        setAddressId(client.address_id ?? "")
        setUserId(client.user_id ?? "")
      })
    }

    // ✅ sockets
    const handlePatched = (data: any) => {
      if (isEdit && data.id === Number(id)) {
        setName(data.name)
        setEmail(data.email)
        setPhone(data.phone ?? "")
        setAddressId(data.address_id ?? "")
        setUserId(data.user_id ?? "")
      }
    }

    const handleAddressCreated = (data: Address) => {
      setAddresses(prev => [...prev, data])
    }

    const handleAddressRemoved = (data: Address) => {
      setAddresses(prev => prev.filter(a => a.id !== data.id))
    }

    const handleUserCreated = (data: User) => {
      if (isAdmin) setUsers(prev => [...prev, data])
    }

    clientService.on("patched", handlePatched)
    addressService.on("created", handleAddressCreated)
    addressService.on("removed", handleAddressRemoved)
    userService.on("created", handleUserCreated)

    return () => {
      clientService.off("patched", handlePatched)
      addressService.off("created", handleAddressCreated)
      addressService.off("removed", handleAddressRemoved)
      userService.off("created", handleUserCreated)
    }
  }, [id, isAdmin, isEdit])

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value)
    setUserId(selectedId)
    setFieldErrors(p => ({ ...p, userId: undefined }))

    const selectedUser = users.find(u => u.id === selectedId)
    if (selectedUser) setEmail(selectedUser.email)
  }

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

    if (!name.trim()) { setError("El nombre es obligatorio"); return }
    if (name.trim().length < 3) { setError("El nombre debe tener al menos 3 caracteres"); return }
    if (email && !isValidEmail(email)) { setError("El correo no es válido"); return }
    if (phone && !isValidPhone(phone)) { setError("El teléfono solo debe contener números"); return }
    if (!addressId) { setError("Debes seleccionar una dirección"); return }
    if (isAdmin && !userId) { setError("Debes seleccionar un usuario"); return }

    setLoading(true)

    try {
      const data: any = {
        name,
        email,
        phone,
        address_id: Number(addressId)
      }

      if (isAdmin && userId) data.user_id = Number(userId)

      const service = feathersClient.service("clients")

      if (isEdit) {
        await service.patch(Number(id), data)
      } else {
        await service.create(data)
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

  const selectClass = inputClass

  return (
    <div className="p-6 max-w-lg mx-auto">

      {/* HEADER ORIGINAL */}
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

      {/* ERROR */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* USUARIO */}
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
            </div>
          )}

          {/* EMAIL INFO */}
          {isAdmin && email && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
              <span className="text-sm text-blue-700 font-medium">{email}</span>
            </div>
          )}

          {/* NOMBRE */}
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Nombre"
            className={inputClass(fieldErrors.name)}
          />

          {/* TELEFONO */}
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="Teléfono"
            className={inputClass(fieldErrors.phone)}
          />

          {/* DIRECCION */}
          <select
            value={addressId}
            onChange={e => setAddressId(Number(e.target.value))}
            className={selectClass(fieldErrors.addressId)}
          >
            <option value="">Selecciona una dirección</option>
            {addresses.map(a => (
              <option key={a.id} value={a.id}>
                {a.street} {a.number} — {a.city?.name}
              </option>
            ))}
          </select>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/clients")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm"
            >
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}