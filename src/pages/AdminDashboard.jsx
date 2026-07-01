import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserCheck, Stethoscope, Plus, Pencil, Search,
  CheckCircle2, BarChart3, LayoutDashboard, UserX, AlertTriangle,
  TrendingUp, Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import DashboardLayout from '../components/layouts/DashboardLayout'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'

const initForm = {
  firstName: '', lastName: '', email: '', gender: 'MALE', phoneNumber: '',
  staffType: 'DOCTOR', role: 'ADMIN', specialization: '', dateOfJoining: '',
  experienceInYears: 0, canLogin: true, isEmployeeActive: true,
  staffAddressDto: { landmark: '', city: '', state: '', country: '', pinCode: '' }
}

const CHART_COLORS = ['#2563eb', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const location = useLocation()
  const activeTab = new URLSearchParams(location.search).get('tab') || 'dashboard'
  const [loading, setLoading] = useState(false)
  const [staffs, setStaffs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({ q: '', staffType: '' })
  const [form, setForm] = useState(initForm)
  const [formError, setFormError] = useState(null)
  const [resignConfirm, setResignConfirm] = useState(null)
  const [resignLoading, setResignLoading] = useState(false)

  useEffect(() => { loadStaffs() }, [])

  async function loadStaffs() {
    setLoading(true)
    try { const list = await api.getStaffs(); setStaffs(Array.isArray(list) ? list : []) }
    catch { setStaffs([]) }
    finally { setLoading(false) }
  }

  function startAdd() { setEditingId(null); setForm(initForm); setFormError(null); setShowForm(true) }

  function startEdit(s) {
    setEditingId(s.staffId || s.id)
    const roleValue = (s.role && String(s.role).trim()) ? String(s.role).trim().toUpperCase() : 'ADMIN'
    setForm({
      staffId: s.staffId || s.id, firstName: s.firstName || '', lastName: s.lastName || '',
      email: s.email || '', gender: s.gender || 'MALE', phoneNumber: s.phoneNumber || '',
      staffType: s.staffType || 'DOCTOR', role: roleValue, specialization: s.specialization || '',
      dateOfJoining: s.dateOfJoining ? s.dateOfJoining.split('T')[0] : '',
      experienceInYears: s.experienceInYears || 0, canLogin: !!s.canLogin,
      isEmployeeActive: s.employeeActive !== undefined ? s.employeeActive : (s.isEmployeeActive !== undefined ? s.isEmployeeActive : true),
      staffAddressDto: s.staffAddressDto || s.staffAddress || { landmark: '', city: '', state: '', country: '', pinCode: '' }
    })
    setFormError(null); setShowForm(true)
  }

  async function submitForm(e) {
    e.preventDefault()
    setFormError(null)
    try {
      const missing = []
      if (!form.firstName) missing.push('First name')
      if (!form.email) missing.push('Email')
      if (!form.phoneNumber) missing.push('Phone')
      if (!form.staffType) missing.push('Type')
      if (!form.role) missing.push('Role')
      if (!form.specialization) missing.push('Specialization')
      if (!form.dateOfJoining) missing.push('Date of Joining')
      const addr = form.staffAddressDto || {}
      if (!addr.city) missing.push('City')
      if (!addr.state) missing.push('State')
      if (!addr.country) missing.push('Country')
      if (missing.length) { setFormError('Required: ' + missing.join(', ')); return }

      if (editingId) {
        const updateData = { ...form }; delete updateData.staffId
        const updated = await api.updateStaff(editingId, updateData)
        setStaffs(prev => prev.map(p => String(p.staffId || p.id) === String(editingId) ? updated : p))
        toast.success('Staff member updated successfully.')
      } else {
        const emailExists = staffs.some(s => String(s.email || '').toLowerCase() === String(form.email || '').toLowerCase())
        if (emailExists) { setFormError('This email already exists.'); return }
        const addData = { ...form }; delete addData.staffId
        await api.addStaff(addData)
        toast.success('Staff member added successfully.')
        await loadStaffs()
      }
      setShowForm(false); setEditingId(null); setForm(initForm)
    } catch { setFormError('Operation failed. Please try again.') }
  }

  async function handleResign(staffId) {
    setResignLoading(true)
    try {
      await api.resignStaff(staffId)
      toast.success('Staff member resigned successfully.')
      setResignConfirm(null)
      await loadStaffs()
    } catch {
      toast.error('Failed to resign staff member.')
      setResignConfirm(null)
    } finally { setResignLoading(false) }
  }

  const filtered = staffs.filter(s => {
    const q = filters.q.toLowerCase()
    const matchQ = !q || [s.firstName, s.lastName, s.email, s.specialization].some(f => f?.toLowerCase().includes(q))
    const matchType = !filters.staffType || s.staffType === filters.staffType
    return matchQ && matchType
  })

  const doctors = staffs.filter(s => s.staffType === 'DOCTOR').length
  const nonDoctors = staffs.filter(s => s.staffType === 'NON_DOCTOR').length
  const active = staffs.filter(s => s.employeeActive || s.isEmployeeActive).length
  const inactive = staffs.length - active

  // Chart data
  const staffTypeData = [
    { name: 'Doctors', value: doctors },
    { name: 'Non-Medical', value: nonDoctors },
  ]
  const statusData = [
    { name: 'Active', value: active },
    { name: 'Inactive', value: inactive },
  ]
  const specializationData = Object.entries(
    staffs.reduce((acc, s) => {
      if (s.specialization) acc[s.specialization] = (acc[s.specialization] || 0) + 1
      return acc
    }, {})
  ).map(([name, count]) => ({ name, count })).slice(0, 6)

  const InputField = ({ label, value, onChange, type = 'text', required, placeholder, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input-field text-sm" required={required} {...props} />
    </div>
  )

  const SelectField = ({ label, value, onChange, options, required }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <select value={value} onChange={onChange} className="input-field text-sm">
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  )

  return (
    <DashboardLayout
      role="admin"
      subtitle={activeTab === 'staff' ? 'Manage all hospital staff members' : activeTab === 'reports' ? 'Hospital workforce analytics' : 'Overview of hospital operations'}
    >
      {/* Tab strip */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'staff',     label: 'Staff',     icon: Users },
          { id: 'reports',   label: 'Reports',   icon: BarChart3 },
        ].map(t => (
          <a
            key={t.id}
            href={t.id === 'dashboard' ? '/admin' : `/admin?tab=${t.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-underline ${
              activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </a>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <StatCard icon={Users}        label="Total Staff"    value={staffs.length} color="blue" trend="up" trendValue="All roles" />
                <StatCard icon={Stethoscope}  label="Doctors"        value={doctors}       color="teal" />
                <StatCard icon={UserCheck}    label="Non-Medical"    value={nonDoctors}    color="emerald" />
                <StatCard icon={CheckCircle2} label="Active Staff"   value={active}        color="amber"
                  trend="up" trendValue={`${Math.round(active / Math.max(staffs.length, 1) * 100)}%`} />
              </>
            )}
          </div>

          {/* Quick staff preview */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="font-display font-700 text-slate-900 text-base">Recent Staff</h2>
                <p className="text-slate-400 text-xs mt-0.5">Latest {Math.min(staffs.length, 5)} members</p>
              </div>
              <a href="/admin?tab=staff" className="text-sm text-primary-600 hover:text-primary-700 font-medium no-underline">
                View all →
              </a>
            </div>
            {loading ? <TableSkeleton rows={5} cols={4} /> : staffs.length === 0 ? (
              <EmptyState icon={Users} title="No staff yet" description="Add staff members to get started"
                action={startAdd} actionLabel="Add Staff" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Name', 'Email', 'Type', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {staffs.slice(0, 5).map((s, i) => (
                      <tr key={s.staffId || s.id || i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
                              {(s.firstName?.[0] || '?').toUpperCase()}
                            </div>
                            <p className="text-sm font-medium text-slate-900">{s.firstName} {s.lastName}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{s.email}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={s.staffType} label={s.staffType === 'DOCTOR' ? 'Doctor' : 'Non-Medical'} /></td>
                        <td className="px-5 py-3.5"><StatusBadge status={(s.employeeActive || s.isEmployeeActive) ? 'ACTIVE' : 'INACTIVE'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── STAFF TAB ── */}
      {activeTab === 'staff' && (
        <div className="card">
          <div className="flex flex-wrap items-center gap-4 p-5 border-b border-slate-100">
            <div>
              <h2 className="font-display font-700 text-slate-900 text-base">Staff Directory</h2>
              <p className="text-slate-400 text-xs mt-0.5">{filtered.length} of {staffs.length} members</p>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  value={filters.q}
                  onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
                  placeholder="Search staff..."
                  className="bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400 w-40"
                />
              </div>
              <select
                value={filters.staffType}
                onChange={e => setFilters(f => ({ ...f, staffType: e.target.value }))}
                className="input-field text-sm py-2 w-auto"
              >
                <option value="">All Types</option>
                <option value="DOCTOR">Doctors</option>
                <option value="NON_DOCTOR">Non-Medical</option>
              </select>
              <button onClick={startAdd} className="btn-primary text-sm flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Staff
              </button>
            </div>
          </div>

          {loading ? <TableSkeleton rows={6} cols={5} /> : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No staff found"
              description={filters.q ? 'Try adjusting your search or filters' : 'Add your first staff member to get started'}
              action={startAdd}
              actionLabel="Add Staff"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Name', 'Email', 'Specialization', 'Type', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((s, i) => (
                    <motion.tr
                      key={s.staffId || s.id || i}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50 group transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
                            {(s.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-slate-400">{s.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{s.email}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{s.specialization || '—'}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.staffType} label={s.staffType === 'DOCTOR' ? 'Doctor' : 'Non-Medical'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={(s.employeeActive || s.isEmployeeActive) ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {(s.employeeActive || s.isEmployeeActive) && (
                            <button
                              onClick={() => setResignConfirm(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Resign"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}        label="Total Staff"   value={staffs.length} color="blue" />
            <StatCard icon={Stethoscope}  label="Doctors"       value={doctors}       color="teal" />
            <StatCard icon={CheckCircle2} label="Active"        value={active}        color="emerald" />
            <StatCard icon={UserX}        label="Inactive"      value={inactive}      color="rose" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Staff by type bar chart */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-display font-700 text-slate-900 text-sm">Staff by Type</h3>
                  <p className="text-slate-400 text-xs">Doctors vs Non-Medical staff</p>
                </div>
              </div>
              {staffs.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={staffTypeData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '13px' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Active vs inactive pie chart */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-display font-700 text-slate-900 text-sm">Employment Status</h3>
                  <p className="text-slate-400 text-xs">Active vs inactive staff</p>
                </div>
              </div>
              {staffs.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      <Cell fill="#22c55e" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '13px' }} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Specializations */}
          {specializationData.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-display font-700 text-slate-900 text-sm">Top Specializations</h3>
                  <p className="text-slate-400 text-xs">Distribution of doctor specializations</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={specializationData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '13px' }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {specializationData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Staff Form Modal ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); setForm(initForm); setFormError(null) }}
        title={editingId ? 'Edit Staff Member' : 'Add New Staff'}
        size="lg"
      >
        <form onSubmit={submitForm} className="space-y-5">
          {formError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">{formError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name"   value={form.firstName}  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}  required placeholder="John" />
            <InputField label="Last Name"    value={form.lastName}   onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}   placeholder="Doe" />
            <InputField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}     required placeholder="john@hospital.com" />
            <InputField label="Phone"        value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} required placeholder="+91 98765 43210" />
            <SelectField label="Gender" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
            <SelectField label="Staff Type" value={form.staffType} onChange={e => setForm(f => ({ ...f, staffType: e.target.value }))} required
              options={[{ value: 'DOCTOR', label: 'Doctor' }, { value: 'NON_DOCTOR', label: 'Non-Medical' }]} />
            <InputField label="Specialization" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} required placeholder="Cardiology" />
            <SelectField label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required
              options={['ADMIN', 'DOCTOR', 'RECEPTIONIST'].map(r => ({ value: r, label: r }))} />
            <InputField label="Date of Joining" type="date" value={form.dateOfJoining} onChange={e => setForm(f => ({ ...f, dateOfJoining: e.target.value }))} required />
            <InputField label="Experience (years)" type="number" value={form.experienceInYears} onChange={e => setForm(f => ({ ...f, experienceInYears: +e.target.value }))} placeholder="5" />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Address</p>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Landmark"  value={form.staffAddressDto.landmark} onChange={e => setForm(f => ({ ...f, staffAddressDto: { ...f.staffAddressDto, landmark: e.target.value } }))} placeholder="Near hospital gate" />
              <InputField label="City"     value={form.staffAddressDto.city}     onChange={e => setForm(f => ({ ...f, staffAddressDto: { ...f.staffAddressDto, city: e.target.value } }))}     required />
              <InputField label="State"    value={form.staffAddressDto.state}    onChange={e => setForm(f => ({ ...f, staffAddressDto: { ...f.staffAddressDto, state: e.target.value } }))}    required />
              <InputField label="Country"  value={form.staffAddressDto.country}  onChange={e => setForm(f => ({ ...f, staffAddressDto: { ...f.staffAddressDto, country: e.target.value } }))}  required />
              <InputField label="Pin Code" value={form.staffAddressDto.pinCode}  onChange={e => setForm(f => ({ ...f, staffAddressDto: { ...f.staffAddressDto, pinCode: e.target.value } }))}  required />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.canLogin} onChange={e => setForm(f => ({ ...f, canLogin: e.target.checked }))} className="w-4 h-4 rounded accent-primary-600" />
              <span className="text-sm text-slate-700">Can Login</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEmployeeActive} onChange={e => setForm(f => ({ ...f, isEmployeeActive: e.target.checked }))} className="w-4 h-4 rounded accent-primary-600" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => { setShowForm(false); setForm(initForm) }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editingId ? 'Update Staff' : 'Add Staff'}</button>
          </div>
        </form>
      </Modal>

      {/* Resign Confirm Modal */}
      <Modal open={!!resignConfirm} onClose={() => setResignConfirm(null)} title="Resign Staff Member" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="font-medium text-slate-900 text-sm mb-1">
            Resign {resignConfirm?.firstName} {resignConfirm?.lastName}?
          </p>
          <p className="text-slate-500 text-sm mb-6">
            This will mark the staff member as inactive. This action can be reversed by editing their profile.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setResignConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => handleResign(resignConfirm?.staffId || resignConfirm?.id)}
              disabled={resignLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {resignLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserX className="w-4 h-4" />}
              {resignLoading ? 'Processing...' : 'Confirm Resign'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
