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

      {/* Navbar oscuro */}
      <nav className="bg-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/clients")}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md group-hover:bg-blue-400 transition">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white group-hover:text-blue-400 transition">
              TechStore
            </span>
          </div>

          {/* Links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => {
              const active = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition group"
                >
                  {/* Texto */}
                  <span className={`relative z-10 transition
                    ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`}
                  >
                    {link.label}
                  </span>

                  {/* Fondo hover */}
                  <span className={`absolute inset-0 rounded-lg transition
                    ${active ? "bg-blue-500" : "bg-transparent group-hover:bg-gray-700"}`}
                  />

                  {/* ✅ Punto indicador activo — debajo del link */}
                  {active && (
                    <span className="absolute -bottom-[17px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      {/* Punto */}
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Usuario + logout — desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white leading-tight">{user?.email}</p>
                <p className="text-xs text-blue-400 capitalize font-medium">{user?.role}</p>
              </div>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-red-400 font-medium transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>

          {/* Botón hamburguesa — mobile */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition"
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>

        {/* Menú desplegable — mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-700 px-4 py-3 space-y-1 bg-gray-900">
            {visibleLinks.map(link => {
              const active = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMenuOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition
                    flex items-center gap-3
                    ${active
                      ? "bg-blue-500 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  {/* ✅ Punto indicador en mobile — a la izquierda del link */}
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition
                    ${active ? "bg-white" : "bg-gray-600"}`}
                  />
                  {link.label}
                </button>
              )
            })}

            <div className="border-t border-gray-700 pt-3 mt-2">
              <div className="flex items-center gap-3 px-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <p className="text-xs text-blue-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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