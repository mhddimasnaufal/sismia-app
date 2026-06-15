import React, { createContext, useState, useContext, useEffect } from 'react'
import { loginUser, getCurrentUser, isAuthenticated, logoutUser } from '../services/api'

const AuthContext = createContext()
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Safe checking untuk fungsi yang mungkin undefined
        const authenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null
        
        if (authenticated && currentUser) {
          setIsAuthenticated(true)
          setUser(currentUser)
        } else {
          setIsAuthenticated(false)
          setUser(null)
          sessionStorage.removeItem('auth_token')
          sessionStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // LOGIN
  const login = async (username, password, role) => {
    try {
      const result = await loginUser(username, password)
      
      if (result.user.role !== role) {
        return false
      }
      
      sessionStorage.setItem('auth_token', result.token)
      sessionStorage.setItem('user', JSON.stringify(result.user))
      
      setIsAuthenticated(true)
      setUser(result.user)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // LOGOUT
  const logout = () => {
    if (typeof logoutUser === 'function') {
      logoutUser()
    }
    setIsAuthenticated(false)
    setUser(null)
  }

  // UPDATE PASSWORD
  const updatePassword = async (userId, oldPassword, newPassword) => {
    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, oldPassword, newPassword })
      })
      const data = await response.json()
      return { 
        success: response.ok, 
        message: data.message || (response.ok ? 'Password berhasil diubah' : 'Gagal mengubah password') 
      }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, message: 'Terjadi kesalahan pada server' }
    }
  }

  // UPDATE USERNAME
  const updateUsername = async (userId, newUsername, currentPassword) => {
    try {
      const response = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newUsername, currentPassword })
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null
        if (currentUser && currentUser.id === userId) {
          currentUser.username = newUsername
          sessionStorage.setItem('user', JSON.stringify(currentUser))
          setUser(currentUser)
        }
      }
      return { 
        success: response.ok, 
        message: data.message || (response.ok ? 'Username berhasil diubah' : 'Gagal mengubah username') 
      }
    } catch (error) {
      console.error('Update username error:', error)
      return { success: false, message: 'Terjadi kesalahan pada server' }
    }
  }

  // RESET PASSWORD
  const resetPassword = async (username, newPassword) => {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword })
      })
      const data = await response.json()
      return { 
        success: response.ok, 
        message: data.message || (response.ok ? 'Password berhasil direset' : 'Gagal mereset password') 
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, message: error.message || 'Terjadi kesalahan pada server' }
    }
  }

  // GET ALL USERS
  const getAllUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Get users error:', error)
      return []
    }
  }

  // REGISTER USER
  const register = async (username, password, role, name) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ username, password, role, name })
      })
      const data = await response.json()
      return { 
        success: response.ok, 
        message: data.message || (response.ok ? 'User berhasil ditambahkan' : 'Gagal menambahkan user') 
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Terjadi kesalahan pada server' }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updatePassword,
    updateUsername,
    getAllUsers,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}