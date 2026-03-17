import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3030",
  withCredentials: true
})

// ✅ sessionStorage — cada pestaña tiene su propia sesión
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("feathers-jwt")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api