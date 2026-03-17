import api from "../api/axios"

interface LoginResponse {
  accessToken: string
  user?: {
    id: number
    email: string
    role: string
    [key: string]: any
  }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/authentication", {
    strategy: "local",
    email,
    password
  })

  // ✅ sessionStorage — cada pestaña tiene su propia sesión
  sessionStorage.setItem("feathers-jwt", response.data.accessToken)

  return response.data
}

export const logout = async (): Promise<void> => {
  await api.delete("/authentication")
  // ✅ sessionStorage
  sessionStorage.removeItem("feathers-jwt")
}