import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3030",
  withCredentials: true
})

// Interceptor que agrega el token automáticamente
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("feathers-jwt")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api