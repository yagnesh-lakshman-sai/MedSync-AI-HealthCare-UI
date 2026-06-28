import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Still rehydrating from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → go to login, remember where they were
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Wrong role → send to their correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    const roleRoutes = { admin: '/admin', doctor: '/doctor', receptionist: '/receptionist' }
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />
  }

  return children
}
