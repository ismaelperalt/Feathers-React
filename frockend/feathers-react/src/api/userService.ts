import feathersClient from "../api/feathers"

export interface User {
  id: number
  email: string
  role: string
  createdAt?: string
}

export const getUsers = async (): Promise<User[]> => {
  const res = await feathersClient.service("users").find()
  return (res as any).data
}

export const updateUserRole = async (id: number, role: string): Promise<User> => {
  return await feathersClient.service("users").patch(id, { role }) as User
}

export const deleteUser = async (id: number): Promise<void> => {
  await feathersClient.service("users").remove(id)
}