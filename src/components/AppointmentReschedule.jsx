import React, { useState, useEffect } from 'react'
import * as api from '../services/api'
import { formatDateWithDay, getTodayISO } from '../utils/dateUtils'
import Modal from './common/Modal'
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AppointmentReschedule({ appointment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    appointmentDate: appointment?.appointmentDate || '',
    startTime: appointment?.startTime || '',
    endTime: appointment?.endTime || '',
    notes: appointment?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unavailableDates, setUnavailableDates] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState('')

  useEffect(() => { if (appointment?.doctorId) loadDoctorUnavailability(appointment.doctorId) }, [appointment?.doctorId])
  useEffect(() => {
    if (appointment?.doctorId && formData.appointmentDate) checkDateAvailability(appointment.doctorId, formData.appointmentDate)
    else setAvailabilityMessage('')
  }, [formData.appointmentDate, appointment?.doctorId])

  async function loadDoctorUnavailability(doctorId) {
    setLoadingAvailability(true)
    try {
      const result = await api.getDoctorUnavailableDates(doctorId)
      setUnavailableDates(result.success && Array.isArray(result.data) ? result.data : [])
    } catch { setUnavailableDates([]) } finally { setLoadingAvailability(false) }
  }

  async function checkDateAvailability(doctorId, date) {
    setCheckingAvailability(true); setAvailabilityMessage('')
    try {
      const result = await api.isDoctorAvailable(doctorId, date)
      if (result.success) {
        if (result.data === true) setAvailabilityMessage('available')
        else { setAvailabilityMessage('unavailable'); setError('Doctor is not available on this date.') }
      }
    } catch {} finally { setCheckingAvailability(false) }
  }

  const isDateUnavailable = (date) => unavailableDates.includes(date)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.appointmentDate) { setError('Please select an appointment date'); return false }
    if (!formData.startTime) { setError('Please select a start time'); return false }
    if (!formData.endTime) { setError('Please select an end time'); return false }
    if (formData.startTime >= formData.endTime) { setError('End time must be after start time'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validateForm()) return
    if (isDateUnavailable(formData.appointmentDate)) { setError('Doctor is not available on the selected date'); return }
    setLoading(true)
    try {
      const result = await api.rescheduleAppointment(appointment.appointmentId || appointment.id, formData)
      if (result?.success) { onSuccess?.(result.data); onClose?.() }
      else setError(result?.message || 'Failed to reschedule appointment')
    } catch (err) { setError(err.message || 'Failed to reschedule appointment') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={!!appointment} onClose={onClose} title="Reschedule Appointment" size="md">
      {/* Current appointment info */}
      <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm">
        <div className="grid grid-cols-2 gap-y-1.5">
          <span className="text-slate-500">Patient</span><span className="font-medium text-slate-800">{appointment?.patientName || 'N/A'}</span>
          <span className="text-slate-500">Doctor</span><span className="font-medium text-slate-800">{appointment?.doctorName || 'N/A'}</span>
          <span className="text-slate-500">Current Date</span><span className="font-medium text-slate-800">{formatDateWithDay(appointment?.appointmentDate)}</span>
          <span className="text-slate-500">Current Time</span><span className="font-medium text-slate-800">{appointment?.startTime} – {appointment?.endTime}</span>
        </div>
      </div>

      {loadingAvailability && (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 bg-slate-50 rounded-xl px-4 py-3">
          <span className="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          Loading doctor availability...
        </div>
      )}

      {!loadingAvailability && unavailableDates.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-amber-800 text-xs font-medium mb-2">Unavailable dates:</p>
          <div className="flex flex-wrap gap-1.5">
            {unavailableDates.slice(0, 8).map(d => (
              <span key={d} className="badge bg-red-100 text-red-700 text-xs">{d}</span>
            ))}
            {unavailableDates.length > 8 && <span className="badge bg-slate-100 text-slate-600 text-xs">+{unavailableDates.length - 8} more</span>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New Date</label>
          <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange}
            min={getTodayISO()} className={`input-field ${isDateUnavailable(formData.appointmentDate) ? 'border-red-400 ring-2 ring-red-200' : ''}`} disabled={loading} />
          {checkingAvailability && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" /> Checking availability...</p>}
          {availabilityMessage === 'available' && !checkingAvailability && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Doctor is available on this date</p>
          )}
          {availabilityMessage === 'unavailable' && !checkingAvailability && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Doctor is not available on this date</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="input-field" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="input-field" disabled={loading} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} placeholder="Additional notes..." className="input-field resize-none" disabled={loading} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Calendar className="w-4 h-4" />}
            {loading ? 'Rescheduling...' : 'Reschedule'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
