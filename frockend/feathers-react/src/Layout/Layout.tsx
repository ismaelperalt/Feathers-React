import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const navLinks = [
    { path: "/dashboard", label: "Dashboard",   always: false },
    { path: "/clients",   label: "Clientes",    always: true  },
    { path: "/cities",    label: "Ciudades",    always: true  },
    { path: "/addresses", label: "Direcciones", always: true  },
    { path: "/users",     label: "Usuarios",    always: false },
  ]

  const visibleLinks = navLinks.filter(link => link.always || isAdmin)

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

          {/* Logo */}
          <span
            className="text-lg font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/clients")}
          >
            TechStore
          </span>

          {/* Links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => {
              const active = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition
                    ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          {/* Usuario + logout — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              Salir
            </button>
          </div>

          {/* Botón hamburguesa — mobile */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              // X
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburguesa
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>

        {/* Menú desplegable — mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">

            {visibleLinks.map(link => {
              const active = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMenuOpen(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition
                    ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {link.label}
                </button>
              )
            })}

            {/* Separador */}
            <div className="border-t border-gray-100 pt-3 mt-2">
              <p className="text-sm font-medium text-gray-800 px-3">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize px-3 mb-2">{user?.role}</p>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
              >
                Salir
              </button>
            </div>

          </div>
        )}
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

    </div>
  )
}