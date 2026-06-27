import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, Calendar, FileText,
  ClipboardList, CreditCard, BarChart3, Sparkles, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell, Search, Moon, Sun,
  Menu, X, Activity, Stethoscope, Bed
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const navItemsByRole = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Staff', path: '/admin', tab: 'staff' },
    { icon: BarChart3, label: 'Reports', path: '/admin', tab: 'reports' },
  ],
  doctor: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
    { icon: Calendar, label: 'Appointments', path: '/doctor', tab: 'appointments' },
    { icon: Users, label: 'Patients', path: '/doctor', tab: 'patients' },
    { icon: ClipboardList, label: 'Prescriptions', path: '/doctor', tab: 'prescriptions' },
    { icon: Sparkles, label: 'AI Insights', path: '/doctor', tab: 'ai' },
  ],
  receptionist: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/receptionist' },
    { icon: Users, label: 'Patients', path: '/receptionist', tab: 'patients' },
    { icon: Calendar, label: 'Appointments', path: '/receptionist', tab: 'appointments' },
    { icon: Bed, label: 'Rooms & Beds', path: '/receptionist', tab: 'rooms' },
  ],
}

const MedSyncLogo = ({ collapsed }) => (
  <div className={cn('flex items-center gap-2.5 overflow-hidden', collapsed ? 'justify-center' : '')}>
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow">
      <Activity className="w-4 h-4 text-white" />
    </div>
    <AnimatePresence>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="font-display font-700 text-white text-lg whitespace-nowrap overflow-hidden"
        >
          MedSync
        </motion.span>
      )}
    </AnimatePresence>
  </div>
)

export default function DashboardLayout({ children, title, subtitle, role: roleProp }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const role = roleProp || user?.role || user?.roles?.[0] || 'admin'
  const navItems = navItemsByRole[role] || navItemsByRole.admin

  function onLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user?.displayName || user?.username || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800',
      mobile ? 'w-72' : (collapsed ? 'w-16' : 'w-64'),
      'transition-all duration-300 ease-in-out'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-white/10', !mobile && collapsed ? 'justify-center' : 'justify-between')}>
        <MedSyncLogo collapsed={!mobile && collapsed} />
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const href = item.tab ? `${item.path}?tab=${item.tab}` : item.path
          const currentTab = new URLSearchParams(location.search).get('tab')
          const isActive = item.tab
            ? location.pathname === item.path && currentTab === item.tab
            : location.pathname === item.path && !currentTab
          return (
            <Link
              key={href}
              to={href}
              onClick={() => mobile && setMobileOpen(false)}
              className={cn(
                isActive ? 'sidebar-item-active' : 'sidebar-item',
                (!mobile && collapsed) ? 'justify-center px-0' : ''
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.displayName || user?.username}</p>
              <p className="text-slate-400 text-xs capitalize">{role}</p>
            </div>
            <button onClick={onLogout} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-400 transition-all">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-100 flex items-center px-4 gap-4 sticky top-0 z-30 backdrop-blur-md bg-white/90">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb / Title */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-900">{title || 'Dashboard'}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className={cn(
            'hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 transition-all duration-300',
            searchFocused ? 'ring-2 ring-primary-500/30 bg-white border border-primary-200' : ''
          )}>
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, doctors..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-48"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white text-xs font-700 cursor-pointer hover:shadow-glow transition-shadow">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto p-6">
            {/* Page header */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-header"
              >
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </motion.div>
            )}

            <motion.div
              key={location.pathname + location.search}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
