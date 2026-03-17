// src/App.tsx
import Login from "./pages/login/Login"
import Clients from "./pages/Clients"

export default function App() {
  const token = localStorage.getItem("token")

  return (
    <div>
      {token ? <Clients /> : <Login />}
    </div>
  )
}