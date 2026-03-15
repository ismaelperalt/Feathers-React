import { useEffect, useState } from "react"
import { getClients } from "../api/clientService"
import { getCities, getAddresses } from "../api/publicService"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

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

  useEffect(() => {
    Promise.all([
      getClients(),
      getCities(),
      getAddresses(),
      api.get("/users").then(r => r.data)
    ]).then(([clients, cities, addresses, users]) => {
      setStats({
        clients: clients.length,
        cities: cities.length,
        addresses: addresses.length,
        users: users.total ?? 0
      })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: "Clientes",    value: stats.clients,   color: "bg-blue-500",   path: "/clients"   },
    { label: "Ciudades",    value: stats.cities,    color: "bg-green-500",  path: "/cities"    },
    { label: "Direcciones", value: stats.addresses, color: "bg-yellow-500", path: "/addresses" },
    { label: "Usuarios",    value: stats.users,     color: "bg-purple-500", path: "/users"     },
  ]

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-lg">{card.value}</span>
            </div>
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Accesos rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Nuevo cliente",   path: "/clients/create"   },
          { label: "Nueva ciudad",    path: "/cities/create"    },
          { label: "Nueva dirección", path: "/addresses/create" },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition text-left"
          >
            + {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}