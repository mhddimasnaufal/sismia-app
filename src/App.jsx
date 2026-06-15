import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BahanBaku from './pages/BahanBaku'
import Alat from './pages/Alat'
import Produksi from './pages/Produksi'
import Penjualan from './pages/Penjualan'
import Keuangan from './pages/Keuangan'
import Laporan from './pages/Laporan'
import Layout from './components/layout/Layout'

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated } = useAuth()
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route 
          path="bahan-baku" 
          element={
            <PrivateRoute requiredRole="admin">
              <BahanBaku />
            </PrivateRoute>
          } 
        />
        <Route 
          path="alat" 
          element={
            <PrivateRoute requiredRole="admin">
              <Alat />
            </PrivateRoute>
          } 
        />
        <Route 
          path="produksi" 
          element={
            <PrivateRoute>
              <Produksi />
            </PrivateRoute>
          } 
        />
        <Route 
          path="penjualan" 
          element={
            <PrivateRoute requiredRole="admin">
              <Penjualan />
            </PrivateRoute>
          } 
        />
        <Route 
          path="keuangan" 
          element={
            <PrivateRoute requiredRole="admin">
              <Keuangan />
            </PrivateRoute>
          } 
        />
        <Route 
          path="laporan" 
          element={
            <PrivateRoute requiredRole="admin">
              <Laporan />
            </PrivateRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App