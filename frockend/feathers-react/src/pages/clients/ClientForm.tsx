import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import feathersClient from "../../api/feathers"
import type { Address, User } from "../../types"
import { useAuth } from "../../context/AuthContext"

// ✅ Email estándar
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

// ✅ Nombre: solo letras, tildes y espacios, entre 3 y 50 caracteres
const isValidName = (name: string) =>
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,50}$/.test(name.trim())

// ✅ Teléfono: validación en orden correcto
const isValidPhone = (phone: string) => {
  const digits = phone.trim()
  if (!/^[0-9]+$/.test(digits)) return "solo-numeros"
  if (digits.length < 7) return "muy-corto"
  if (digits.length > 15) return "muy-largo"
  return "ok"
}

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
  const [active, setActive] = useState(true)
  const [clientType, setClientType] = useState("regular")
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

    addressService.find().then((res: any) => setAddresses(res.data))
    if (isAdmin) userService.find().then((res: any) => setUsers(res.data))

    if (isEdit) {
      clientService.get(Number(id)).then((client: any) => {
        setName(client.name)
        setEmail(client.email)
        setPhone(client.phone ?? "")
        setAddressId(client.address_id ?? "")
        setUserId(client.user_id ?? "")
        setActive(client.active ?? true)
        setClientType(client.client_type ?? "regular")
      })
    }

    const handlePatched = (data: any) => {
      if (isEdit && data.id === Number(id)) {
        setName(data.name)
        setEmail(data.email)
        setPhone(data.phone ?? "")
        setAddressId(data.address_id ?? "")
        setUserId(data.user_id ?? "")
        setActive(data.active ?? true)
        setClientType(data.client_type ?? "regular")
      }
    }

    const handleAddressCreated = (data: Address) => setAddresses(prev => [...prev, data])
    const handleAddressRemoved = (data: Address) => setAddresses(prev => prev.filter(a => a.id !== data.id))
    const handleUserCreated = (data: User) => { if (isAdmin) setUsers(prev => [...prev, data]) }

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
        if (!name.trim())
          setFieldErrors(p => ({ ...p, name: "El nombre es obligatorio" }))
        else if (!isValidName(name))
          setFieldErrors(p => ({ ...p, name: "Solo letras y espacios, entre 3 y 50 caracteres" }))
        else
          setFieldErrors(p => ({ ...p, name: undefined }))
        break
      case "email":
        if (email && !isValidEmail(email))
          setFieldErrors(p => ({ ...p, email: "Ingresa un correo válido (ej: correo@dominio.com)" }))
        else
          setFieldErrors(p => ({ ...p, email: undefined }))
        break
      case "phone":
        if (phone) {
          const result = isValidPhone(phone)
          if (result === "solo-numeros") setFieldErrors(p => ({ ...p, phone: "Solo se permiten números" }))
          else if (result === "muy-corto") setFieldErrors(p => ({ ...p, phone: "Mínimo 7 dígitos" }))
          else if (result === "muy-largo") setFieldErrors(p => ({ ...p, phone: "Máximo 15 dígitos" }))
          else setFieldErrors(p => ({ ...p, phone: undefined }))
        } else {
          setFieldErrors(p => ({ ...p, phone: undefined }))
        }
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError("El nombre es obligatorio"); return }
    if (!isValidName(name)) { setError("El nombre solo puede contener letras y espacios (3-50 caracteres)"); return }
    if (email && !isValidEmail(email)) { setError("El correo no es válido"); return }
    if (phone) {
      const phoneResult = isValidPhone(phone)
      if (phoneResult === "solo-numeros") { setError("El teléfono solo puede contener números"); return }
      if (phoneResult === "muy-corto") { setError("El teléfono debe tener al menos 7 dígitos"); return }
      if (phoneResult === "muy-largo") { setError("El teléfono no puede tener más de 15 dígitos"); return }
    }
    if (!addressId) { setError("Debes seleccionar una dirección"); return }
    if (isAdmin && !userId) { setError("Debes seleccionar un usuario"); return }

    setLoading(true)
    try {
      const data: any = {
        name, email, phone,
        address_id: Number(addressId),
        active,
        client_type: clientType
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

  return (
    <div className="p-6 max-w-lg mx-auto">

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/clients")} className="text-gray-400 hover:text-gray-600 transition">
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

          {/* USUARIO */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignar a usuario <span className="text-red-500">*</span>
              </label>
              <select value={userId} onChange={handleUserChange} className={inputClass(fieldErrors.userId)}>
                <option value="">Selecciona un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
                ))}
              </select>
              {fieldErrors.userId && <p className="text-red-500 text-xs mt-1">{fieldErrors.userId}</p>}
            </div>
          )}

          {/* EMAIL INFO */}
          {isAdmin && email && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
              <span className="text-sm text-blue-700 font-medium">{email}</span>
            </div>
          )}

          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: undefined })) }}
              onBlur={() => handleBlur("name")}
              placeholder="Ej: Juan Pérez"
              className={inputClass(fieldErrors.name)}
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          {/* TELEFONO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              value={phone}
              onChange={e => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: undefined })) }}
              onBlur={() => handleBlur("phone")}
              placeholder="Ej: 0987654321"
              className={inputClass(fieldErrors.phone)}
            />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>

          {/* DIRECCION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <select
              value={addressId}
              onChange={e => { setAddressId(Number(e.target.value)); setFieldErrors(p => ({ ...p, addressId: undefined })) }}
              className={inputClass(fieldErrors.addressId)}
            >
              <option value="">Selecciona una dirección</option>
              {addresses.map(a => (
                <option key={a.id} value={a.id}>{a.street} {a.number} — {a.city?.name}</option>
              ))}
            </select>
            {fieldErrors.addressId && <p className="text-red-500 text-xs mt-1">{fieldErrors.addressId}</p>}
          </div>

          {/* TIPO DE CLIENTE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cliente
            </label>
            <select
              value={clientType}
              onChange={e => setClientType(e.target.value)}
              className={inputClass()}
            >
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>

          {/* ACTIVO - Toggle */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Cliente activo</p>
              <p className="text-xs text-gray-400">Desactiva para ocultar el cliente</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(prev => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200
                ${active ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${active ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/clients")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm transition"
            >
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}