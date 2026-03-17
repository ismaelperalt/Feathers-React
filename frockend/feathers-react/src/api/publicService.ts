// src/api/publicService.ts
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
  city_id?: number
  city?: City
  [key: string]: any
}

// ── Cities ──────────────────────────────────────
export const getCities = async (): Promise<City[]> => {
  const res = await api.get<{ data: City[] }>("/cities")
  return res.data.data
}

export const createCity = async (data: Partial<City>): Promise<City> => {
  const res = await api.post<City>("/cities", data)
  return res.data
}

export const updateCity = async (id: number, data: Partial<City>): Promise<City> => {
  const res = await api.patch<City>(`/cities/${id}`, data)
  return res.data
}

export const deleteCity = async (id: number): Promise<void> => {
  await api.delete(`/cities/${id}`)
}
export const getCity = async (id: number): Promise<City> => {
  const res = await api.get<City>(`/cities/${id}`)
  return res.data
}

// ── Addresses ────────────────────────────────────
export const getAddresses = async (): Promise<Address[]> => {
  const res = await api.get<{ data: Address[] }>("/addresses")
  return res.data.data
}

export const createAddress = async (data: Partial<Address>): Promise<Address> => {
  const res = await api.post<Address>("/addresses", data)
  return res.data
}

export const updateAddress = async (id: number, data: Partial<Address>): Promise<Address> => {
  const res = await api.patch<Address>(`/addresses/${id}`, data)
  return res.data
}

export const deleteAddress = async (id: number): Promise<void> => {
  await api.delete(`/addresses/${id}`)
}

export const getAddress = async (id: number): Promise<Address> => {
  const res = await api.get<Address>(`/addresses/${id}`)
  return res.data
}