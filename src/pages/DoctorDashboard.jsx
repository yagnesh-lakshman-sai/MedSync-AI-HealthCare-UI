import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, FileText, RefreshCw, Stethoscope, AlertTriangle, CheckCircle2, Eye, RotateCcw, XCircle, ClipboardPlus, CalendarClock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'
import DashboardLayout from '../components/layouts/DashboardLayout'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import { TableSkeleton } from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import AppointmentReschedule from '../components/AppointmentReschedule'
import PatientDetails from '../components/PatientDetails'
import ReasonForVisitModal from '../components/ReasonForVisitModal'
import DoctorAvailability from '../components/DoctorAvailability'
import DiagnosisModal from '../components/DiagnosisModal'
import { formatDateWithDay, getTodayISO } from '../utils/dateUtils'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [unavailableDates, setUnavailableDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayISO())
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState(null)

  useEffect(() => { loadAppointments() }, [selectedDate, user])
  useEffect(() => { loadUnavailableDates() }, [user])

  async function loadUnavailableDates() {
    if (!user?.staffId && !user?.username) return
    try {
      const staffId = user.staffId || user.username
      const result = await api.getDoctorUnavailableDates(staffId)
      setUnavailableDates(result.success && Array.isArray(result.data) ? result.data : [])
    } catch { setUnavailableDates([]) }
  }

  async function loadAppointments() {
    if (!user?.username) { setLoading(false); return }
    try {
      setLoading(true); setError('')
      const resp = await api.getAppointmentsForDoctor(user.username, selectedDate)
      if (resp?.success && Array.isArray(resp.data)) setAppointments(resp.data)
      else if (Array.isArray(resp)) setAppointments(resp)
      else setAppointments([])
    } catch (err) {
      if (err.response?.status !== 404) setError(err.message || 'Failed to load appointments')
      setAppointments([])
    } finally { setLoading(false) }
  }

  async function onCancelAppointment(id) {
    try {
      const resp = await api.cancelAppointment(id)
      if (resp?.success) {
        setAppointments(prev => prev.filter(a => (a.appointmentId || a.id) !== id))
        setCancelConfirm(null)
        toast.success('Appointment cancelled successfully')
        
      }
    } catch (err) { setError(err.message || 'Failed to cancel appointment') }
  }

  function handleRescheduleSuccess() {
    loadAppointments(); setShowRescheduleModal(false); setSelectedAppointment(null)
    toast.success('Appointment rescheduled successfully')
    
  }

  const booked = appointments.filter(a => a.status === 'Booked' || a.status === 'SCHEDULED').length
  const completed = appointments.filter(a => a.status === 'Completed' || a.status === 'COMPLETED' || a.status === 'DIAGNOSED').length
  const cancelled = appointments.filter(a => a.status === 'Cancelled' || a.status === 'CANCELLED').length

  return (
    <DashboardLayout role="doctor" title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Dr. ${user?.displayName || user?.username}`} subtitle="Here's your schedule for today">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setSelectedDate(getTodayISO())} className="btn-secondary text-sm flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Today
        </button>
        <button onClick={() => setShowAvailabilityModal(true)} className="btn-primary text-sm flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5" /> Manage Availability
        </button>
        <button onClick={loadAppointments} className="btn-ghost text-sm flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Calendar} label="Today's Appointments" value={appointments.length} color="blue" />
        <StatCard icon={Clock} label="Pending" value={booked} color="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} color="emerald" />
        <StatCard icon={XCircle} label="Cancelled" value={cancelled} color="rose" />
      </div>

      {/* Toast messages */}
      <AnimatePresence>
        {(successMessage || error) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${successMessage ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {successMessage ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {successMessage || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointments table */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4 p-5 border-b border-slate-100">
          <div>
            <h2 className="font-display font-700 text-slate-900 text-base">Appointments</h2>
            <p className="text-slate-400 text-xs mt-0.5">{formatDateWithDay(selectedDate)}</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field w-auto text-sm py-2"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : appointments.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments" description={`No appointments scheduled for ${formatDateWithDay(selectedDate)}`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Time', 'Patient', 'ID', 'Notes', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((a, i) => (
                  <motion.tr key={a.appointmentId || a.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 group transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {a.startTime} – {a.endTime}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-primary-500 flex items-center justify-center text-white text-xs font-700">
                          {(a.patientName?.[0] || '?').toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{a.patientName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{a.patientId || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs truncate">{a.notes || '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={a.status} label={a.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={() => { setSelectedReason(a); setShowReasonModal(true) }}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all">
                          <Eye className="w-3 h-3" /> Reason
                        </button>
                        <button onClick={() => { setSelectedAppointment(a); setShowPatientModal(true) }}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all">
                          <User className="w-3 h-3" /> Patient
                        </button>
                        <button onClick={() => { setSelectedAppointment(a); setShowRescheduleModal(true) }}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all">
                          <RotateCcw className="w-3 h-3" /> Reschedule
                        </button>
                        <button onClick={() => setCancelConfirm(a.appointmentId || a.id)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                          <XCircle className="w-3 h-3" /> Cancel
                        </button>
                        {a.status !== 'DIAGNOSED' && (
                          <button onClick={() => { setSelectedAppointment(a); setShowDiagnosisModal(true) }}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                            <ClipboardPlus className="w-3 h-3" /> Diagnose
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

      {/* Modals - preserved from original */}
      <ReasonForVisitModal appointment={selectedReason} onClose={() => { setShowReasonModal(false); setSelectedReason(null) }} />
      {showPatientModal && selectedAppointment && (
        <PatientDetails appointment={selectedAppointment} onClose={() => { setShowPatientModal(false); setSelectedAppointment(null) }} />
      )}
      {showRescheduleModal && selectedAppointment && (
        <AppointmentReschedule appointment={selectedAppointment} onClose={() => { setShowRescheduleModal(false); setSelectedAppointment(null) }} onSuccess={handleRescheduleSuccess} />
      )}
      {showAvailabilityModal && (
        <DoctorAvailability onClose={() => setShowAvailabilityModal(false)} unavailableDates={unavailableDates} onUpdate={loadUnavailableDates} />
      )}
      {showDiagnosisModal && selectedAppointment && (
        <DiagnosisModal appointment={selectedAppointment} onClose={() => { setShowDiagnosisModal(false); setSelectedAppointment(null) }}
          onSuccess={() => { setShowDiagnosisModal(false); setSelectedAppointment(null); toast.success('Diagnosis submitted successfully'); ; loadAppointments() }} />
      )}

      {/* Cancel confirm modal */}
      <Modal open={!!cancelConfirm} onClose={() => setCancelConfirm(null)} title="Cancel Appointment" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-slate-700 text-sm mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setCancelConfirm(null)} className="btn-secondary flex-1">Keep it</button>
            <button onClick={() => onCancelAppointment(cancelConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl text-sm transition-colors">
              Cancel Appointment
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
