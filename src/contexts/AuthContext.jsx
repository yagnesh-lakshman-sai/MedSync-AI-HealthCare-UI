import React, { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on app start
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ms_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('ms_user')
    } finally {
      setLoading(false)
    }
  }, [])

  async function login(credentials) {
    // Call real backend
    const data = await api.login(credentials)
    // data: { token, expiresInMillis, role, staffId, staffType, specialization, ... }

    // Normalise role — backend returns a single string role
    const rawRole = data.role || data.staffType || 'staff'
    const normRole = rawRole.trim().toLowerCase()

    // Map backend role strings → our route roles
    let routeRole = 'staff'
    if (normRole === 'admin' || normRole === 'administrator') routeRole = 'admin'
    else if (normRole === 'doctor') routeRole = 'doctor'
    else if (normRole === 'receptionist') routeRole = 'receptionist'

    const userData = {
      staffId: data.staffId,
      username: data.username || credentials.email,
      displayName: data.displayName || data.firstName
        ? `${data.firstName || ''} ${data.lastName || ''}`.trim()
        : credentials.email.split('@')[0],
      role: routeRole,              // single normalised role for routing/nav
      roles: [routeRole],           // array for backward compat
      requirePasswordReset: !!data.requirePasswordReset,
      email: credentials.email,
    }

    // Persist token and user
    if (data.token) localStorage.setItem('token', data.token)
    localStorage.setItem('ms_user', JSON.stringify(userData))
    localStorage.setItem('ms_auth', 'true')

    setUser(userData)
    return userData
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('ms_user')
    localStorage.removeItem('ms_auth')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
