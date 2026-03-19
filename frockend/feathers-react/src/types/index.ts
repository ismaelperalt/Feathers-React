// src/types/index.ts
// ✅ Archivo único de tipos — reemplaza userService, clientService y publicService

export interface User {
  id: number
  email: string
  role: string
  createdAt?: string
}

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
  city_id?: number
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
  active?: boolean        
  client_type?: string    
  [key: string]: any
}