import api from "./axios"

export interface User {
  id: number
  email: string
  role: string
  createdAt?: string
}

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<{ data: User[] }>("/users")
  return res.data.data
}

export const updateUserRole = async (id: number, role: string): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}`, { role })
  return res.data
}

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`)
}