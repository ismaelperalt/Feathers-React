import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import PrivateRoute from "./PrivateRoute"
import Layout from "../Layout/Layout"

import Login from "../pages/login/Login"
import Clients from "../pages/clients/Clients"
import Cities from "../pages/cities/Cities"
import Addresses from "../pages/addresses/Addresses"
import Dashboard from "../pages/dashboard/Dashboard"
import CityForm from "../pages/cities/CityForm"
import AddressForm from "../pages/addresses/AddressForm"
import ClientForm from "../pages/clients/ClientForm"
import Register from "../pages/register/Register"
import Users from "../pages/users/Users"
import UserForm from "../pages/users/UserForm"

export default function AppRouter() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>

        {/* Pública */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        <Route path="/register" element={
          user ? <Navigate to="/clients" replace /> : <Register />
        } />
        <Route path="/users" element={
          <PrivateRoute onlyAdmin>
            <Layout><Users /></Layout>
          </PrivateRoute>
        } />
        <Route path="/users/create" element={
          <PrivateRoute onlyAdmin>
            <Layout><UserForm /></Layout>
          </PrivateRoute>
        } />
        <Route path="/users/edit/:id" element={<UserForm />} />

        {/* Solo admin */}
        <Route path="/dashboard" element={
          <PrivateRoute onlyAdmin><Layout><Dashboard /></Layout></PrivateRoute>
        } />

        {/* Clientes */}
        <Route path="/clients" element={
          <PrivateRoute><Layout><Clients /></Layout></PrivateRoute>
        } />
        <Route path="/clients/create" element={
          <PrivateRoute><Layout><ClientForm /></Layout></PrivateRoute>
        } />
        <Route path="/clients/edit/:id" element={
          <PrivateRoute onlyAdmin><Layout><ClientForm /></Layout></PrivateRoute>
        } />

        {/* Ciudades */}
        <Route path="/cities" element={
          <PrivateRoute><Layout><Cities /></Layout></PrivateRoute>
        } />
        <Route path="/cities/create" element={
          <PrivateRoute onlyAdmin><Layout><CityForm /></Layout></PrivateRoute>
        } />
        <Route path="/cities/edit/:id" element={
          <PrivateRoute onlyAdmin><Layout><CityForm /></Layout></PrivateRoute>
        } />

        {/* Direcciones */}
        <Route path="/addresses" element={
          <PrivateRoute><Layout><Addresses /></Layout></PrivateRoute>
        } />
        <Route path="/addresses/create" element={
          <PrivateRoute><Layout><AddressForm /></Layout></PrivateRoute>
        } />
        <Route path="/addresses/edit/:id" element={
          <PrivateRoute onlyAdmin><Layout><AddressForm /></Layout></PrivateRoute>
        } />

        

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}