import { useEffect, useState } from "react"
import { getClients } from "../../api/clientService"
import { getCities, getAddresses } from "../../api/publicService"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"
import feathersClient, { socket } from "../../api/feathers"
import { useAuth } from "../../context/AuthContext"

interface Stats {
  clients: number
  cities: number
  addresses: number
  users: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ clients: 0, cities: 0, addresses: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const setupListeners = () => {
      const clientsService   = feathersClient.service("clients")
      const citiesService    = feathersClient.service("cities")
      const addressesService = feathersClient.service("addresses")
      const usersService     = feathersClient.service("users")

      const onClientCreated   = () => setStats(p => ({ ...p, clients:   p.clients   + 1 }))
      const onClientRemoved   = () => setStats(p => ({ ...p, clients:   p.clients   - 1 }))
      const onCityCreated     = () => setStats(p => ({ ...p, cities:    p.cities    + 1 }))
      const onCityRemoved     = () => setStats(p => ({ ...p, cities:    p.cities    - 1 }))
      const onAddressCreated  = () => setStats(p => ({ ...p, addresses: p.addresses + 1 }))
      const onAddressRemoved  = () => setStats(p => ({ ...p, addresses: p.addresses - 1 }))
      const onUserCreated     = () => setStats(p => ({ ...p, users:     p.users     + 1 }))
      const onUserRemoved     = () => setStats(p => ({ ...p, users:     p.users     - 1 }))

      clientsService.on("created",   onClientCreated)
      clientsService.on("removed",   onClientRemoved)
      citiesService.on("created",    onCityCreated)
      citiesService.on("removed",    onCityRemoved)
      addressesService.on("created", onAddressCreated)
      addressesService.on("removed", onAddressRemoved)
      usersService.on("created",     onUserCreated)
      usersService.on("removed",     onUserRemoved)

      return () => {
        clientsService.off("created",   onClientCreated)
        clientsService.off("removed",   onClientRemoved)
        citiesService.off("created",    onCityCreated)
        citiesService.off("removed",    onCityRemoved)
        addressesService.off("created", onAddressCreated)
        addressesService.off("removed", onAddressRemoved)
        usersService.off("created",     onUserCreated)
        usersService.off("removed",     onUserRemoved)
      }
    }

    let cleanup: (() => void) | undefined

    if (socket.connected) {
      cleanup = setupListeners()
    } else {
      socket.once("connect", () => {
        cleanup = setupListeners()
      })
    }

    Promise.all([
      getClients(),
      getCities(),
      getAddresses(),
      api.get("/users").then(r => r.data)
    ]).then(([clients, cities, addresses, users]) => {
      setStats({
        clients:   clients.length,
        cities:    cities.length,
        addresses: addresses.length,
        users:     users.total ?? 0
      })
    }).finally(() => setLoading(false))

    return () => { if (cleanup) cleanup() }
  }, [])

  const cards = [
    {
      label: "Clientes",
      value: stats.clients,
      gradient: "from-blue-500 to-blue-700",
      path: "/clients",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
    {
      label: "Ciudades",
      value: stats.cities,
      gradient: "from-emerald-500 to-emerald-700",
      path: "/cities",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      )
    },
    {
      label: "Direcciones",
      value: stats.addresses,
      gradient: "from-amber-500 to-amber-700",
      path: "/addresses",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      )
    },
    {
      label: "Usuarios",
      value: stats.users,
      gradient: "from-purple-500 to-purple-700",
      path: "/users",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
  ]

  const quickLinks = [
    {
      label: "Nuevo cliente",
      path: "/clients/create",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
      color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
    },
    {
      label: "Nueva ciudad",
      path: "/cities/create",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ),
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
    },
    {
      label: "Nueva dirección",
      path: "/addresses/create",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600"
    },
  ]

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Sección de bienvenida */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl px-6 py-8 flex items-center justify-between shadow-md">
        <div>
          <p className="text-gray-400 text-sm mb-1">Bienvenido de nuevo </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {user?.email?.split("@")[0]}
          </h1>
          <span className="inline-block mt-2 text-xs font-medium bg-blue-500 text-white px-3 py-1 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
        {/* Ícono decorativo */}
        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v6.75" />
          </svg>
        </div>
      </div>

      {/*  Cards con gradiente e iconos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumen general</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(card => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-lg transition group overflow-hidden"
            >
              {/* Fondo decorativo */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition`} />

              {/* Ícono */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-md`}>
                {card.icon}
              </div>

              {/* Info */}
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>

              {/*  Flecha indicador */}
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-400 group-hover:text-blue-500 transition">
                <span>Ver todos</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos mejorados */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 border rounded-xl px-4 py-4 text-sm font-medium transition group ${item.color}`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <span>{item.label}</span>
              {/*  Flecha */}
              <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}