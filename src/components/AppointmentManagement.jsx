import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, Plus, Users, Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import * as api from '../services/api'
import AppointmentBooking from './AppointmentBooking'
import AppointmentReschedule from './AppointmentReschedule'
import AppointmentList from './AppointmentList'
import PatientDetails from './PatientDetails'
import Modal from './common/Modal'
import EmptyState from './common/EmptyState'
import { TableSkeleton } from './common/LoadingSkeleton'

export default function AppointmentManagement({ doctors = [] }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alert, setAlert] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [doctorIdForPatients, setDoctorIdForPatients] = useState('')
  const [patientsVisited, setPatientsVisited] = useState([])
  const [pvStartDate, setPvStartDate] = useState(new Date().toISOString().split('T')[0])
  const [pvEndDate, setPvEndDate] = useState(new Date().toISOString().split('T')[0])
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => { loadAppointments() }, [selectedDate])

  useEffect(() => {
    const id = setInterval(() => loadAppointments(), 30000)
    return () => clearInterval(id)
  }, [selectedDate])

  function showToast(type, msg) {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 3500)
  }

  async function loadAppointments() {
    try {
      setLoading(true); setError('')
      const resp = await api.getAppointmentsForAllDoctors(selectedDate)
      if (resp?.status === 200 && Array.isArray(resp.data)) setAppointments(resp.data)
      else if (Array.isArray(resp)) setAppointments(resp)
      else setAppointments([])
      setLastRefresh(new Date())
    } catch (err) { setError(err.message || 'Failed to load appointments'); setAppointments([]) }
    finally { setLoading(false) }
  }

  function handleBookingSuccess() {
    setShowBookingModal(false)
    showToast('success', 'Appointment booked successfully!')
    loadAppointments()
  }

  function handleRescheduleSuccess(updated) {
    if (updated) {
      setAppointments(prev => prev.map(a =>
        (a.appointmentId || a.id) === (updated.appointmentId || updated.id) ? updated : a
      ))
    }
    setShowRescheduleModal(false); setSelectedAppointment(null)
    showToast('success', 'Appointment rescheduled successfully!')
  }

  async function handleCancelAppointment(appointmentId) {
    try {
      setError('')
      const resp = await api.cancelAppointment(appointmentId)
      if (resp?.success === false) { showToast('error', resp.message || 'Unable to cancel'); return }
      setAppointments(prev => prev.filter(a => (a.appointmentId || a.id) !== appointmentId))
      setCancelConfirm(null)
      showToast('success', 'Appointment cancelled')
    } catch (err) { setError(err.message || 'Failed to cancel appointment') }
  }

  async function handleViewAppointment(a) {
    try {
      setError('')
      const resp = await api.getAppointmentDetails(a.appointmentId || a.id)
      if (resp?.status === 200 && resp.data) {
        setSelectedAppointment(resp.data); setShowRescheduleModal(false); setShowPatientModal(true)
      } else showToast('error', 'Unable to fetch appointment details')
    } catch { showToast('error', 'Unable to fetch appointment details') }
  }

  async function fetchPatientsVisited() {
    if (!doctorIdForPatients) { showToast('error', 'Please enter a Doctor ID'); return }
    try {
      const resp = await api.getPatientsVisitedByDoctor(doctorIdForPatients, pvStartDate, pvEndDate)
      if (resp?.status === 200 && Array.isArray(resp.data)) setPatientsVisited(resp.data)
      else if (Array.isArray(resp)) setPatientsVisited(resp)
      else if (resp?.success === false) showToast('error', resp.message || 'Unable to fetch patients')
      else setPatientsVisited([])
    } catch { showToast('error', 'Unable to fetch patients visited') }
  }

  const filteredAppointments = appointments.filter(a => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return [a.patientName, a.doctorName, String(a.patientId || ''), String(a.doctorId || '')].some(f => f?.toLowerCase().includes(s))
  })

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {alert && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${alert.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {alert.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-4 h-4" />{error}
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input-field text-sm py-2 w-auto"
          />
          <button onClick={loadAppointments} className="btn-ghost text-sm flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {lastRefresh && (
            <span className="text-xs text-slate-400 hidden sm:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={() => setShowBookingModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Book Appointment
        </button>
      </div>

      {/* Patients visited lookup */}
      <div className="card p-4">
        <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" /> Patients visited by doctor
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-36">
            <label className="block text-xs text-slate-500 mb-1">Doctor / Staff ID</label>
            <input value={doctorIdForPatients} onChange={e => setDoctorIdForPatients(e.target.value)} placeholder="DOC001" className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input type="date" value={pvStartDate} onChange={e => setPvStartDate(e.target.value)} className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input type="date" value={pvEndDate} onChange={e => setPvEndDate(e.target.value)} className="input-field text-sm py-2" />
          </div>
          <button onClick={fetchPatientsVisited} className="btn-secondary text-sm py-2">Fetch</button>
        </div>
        {patientsVisited.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {patientsVisited.map((p, i) => (
              <span key={i} className="badge badge-info">{p}</span>
            ))}
          </div>
        )}
      </div>

      {/* Appointment list */}
      <div className="card">
        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
          <h3 className="font-display font-700 text-slate-900 text-base">
            Appointments
            <span className="text-slate-400 font-400 text-sm ml-2">({filteredAppointments.length})</span>
          </h3>
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search patient / doctor..."
              className="bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400 w-44"
              autoComplete="off"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments"
            description={searchTerm ? 'No appointments match your search.' : 'No appointments found for this date.'}
            action={() => setShowBookingModal(true)}
            actionLabel="Book Appointment"
          />
        ) : (
          <AppointmentList
            appointments={filteredAppointments}
            loading={false}
            onReschedule={a => { setSelectedAppointment(a); setShowRescheduleModal(true) }}
            onCancel={id => setCancelConfirm(id)}
            onView={handleViewAppointment}
          />
        )}
      </div>

      {/* Modals */}
      {showBookingModal && (
        <AppointmentBooking
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
          doctors={doctors}
        />
      )}

      {showRescheduleModal && selectedAppointment && (
        <AppointmentReschedule
          appointment={selectedAppointment}
          onClose={() => { setShowRescheduleModal(false); setSelectedAppointment(null) }}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {showPatientModal && selectedAppointment && (
        <PatientDetails
          appointment={selectedAppointment}
          onClose={() => { setShowPatientModal(false); setSelectedAppointment(null) }}
        />
      )}

      {/* Cancel confirm */}
      <Modal open={!!cancelConfirm} onClose={() => setCancelConfirm(null)} title="Cancel Appointment" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-slate-700 text-sm mb-6">Are you sure you want to cancel this appointment? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setCancelConfirm(null)} className="btn-secondary flex-1">Keep it</button>
            <button onClick={() => handleCancelAppointment(cancelConfirm)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl text-sm transition-colors">
              Yes, Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
