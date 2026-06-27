import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, LogOut, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  function onLogout() {
    logout()
    nav('/login')
  }

  const rawRoles = user ? user.roles || (user.role ? [user.role] : []) : []
  const roles = Array.isArray(rawRoles)
    ? rawRoles.map(r => (typeof r === 'string' ? r.trim().toLowerCase() : r))
    : []

  const navLinks = [
    { role: 'receptionist', to: '/receptionist', label: 'Receptionist' },
    { role: 'doctor', to: '/doctor', label: 'Doctor' },
    { role: 'admin', to: '/admin', label: 'Admin' },
  ].filter(l => roles.includes(l.role))

  const initials = (user?.displayName || user?.username || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center px-6 gap-6">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-display font-700 text-slate-900 text-base">MedSync</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex-1" />

      {/* User area */}
      {!user ? (
        <Link to="/login" className="btn-primary text-sm py-1.5 px-4">Sign in</Link>
      ) : (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white text-xs font-700">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user.displayName || user.username}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-20"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user.displayName || user.username}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{roles[0] || 'Staff'}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  )
}
