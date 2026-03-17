// src/api/clientService.ts
import api from "../api/axios"

export interface City {
  id: number
  name: string
  state?: string
  [key: string]: any
}

export interface Address {
  id: number
  street: string
  number?: string
  reference?: string
  city?: City
  [key: string]: any
}

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  address_id?: number
  user_id?: number
  address?: Address
  [key: string]: any
}

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  const res = await api.get<{ data: Client[] }>("/clients")
  return res.data.data
}



