import React, { useState, useEffect } from 'react'
import * as api from '../services/api'
import { formatDateWithDay, getTodayISO } from '../utils/dateUtils'
import Modal from './common/Modal'
import { Calendar, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AppointmentBooking({ onClose, onSuccess, doctors = [] }) {
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', appointmentDate: '', startTime: '', endTime: '', notes: '', reasonForVisit: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unavailableDates, setUnavailableDates] = useState([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState('')

  useEffect(() => {
    if (formData.doctorId) loadDoctorUnavailability(formData.doctorId)
    else setUnavailableDates([])
    setAvailabilityMessage('')
  }, [formData.doctorId])

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) checkDateAvailability(formData.doctorId, formData.appointmentDate)
    else setAvailabilityMessage('')
  }, [formData.doctorId, formData.appointmentDate])

  async function loadDoctorUnavailability(doctorId) {
    try {
      const result = await api.getDoctorUnavailableDates(doctorId)
      setUnavailableDates(result.success && Array.isArray(result.data) ? result.data : [])
    } catch { setUnavailableDates([]) }
  }

  async function checkDateAvailability(doctorId, date) {
    setCheckingAvailability(true); setAvailabilityMessage('')
    try {
      const result = await api.isDoctorAvailable(doctorId, date)
      if (result.success) {
        setAvailabilityMessage(result.data === true ? 'available' : 'unavailable')
        if (result.data !== true) setError('Doctor is not available on this date.')
      }
    } catch {} finally { setCheckingAvailability(false) }
  }

  const handleInputChange = (e) => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }
  const isDateUnavailable = (date) => unavailableDates.includes(date)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!formData.patientId) { setError('Please enter a patient ID'); return }
    if (!formData.doctorId) { setError('Please select a doctor'); return }
    if (!formData.appointmentDate) { setError('Please select a date'); return }
    if (!formData.startTime || !formData.endTime) { setError('Please select appointment times'); return }
    if (formData.startTime >= formData.endTime) { setError('End time must be after start time'); return }
    if (!formData.reasonForVisit?.trim()) { setError('Please provide a reason for visit'); return }
    if (isDateUnavailable(formData.appointmentDate)) { setError('Doctor is not available on this date'); return }
    setLoading(true)
    try {
      const result = await api.bookAppointment(formData)
      if (result.success) { onSuccess?.(result.data); onClose?.() }
      else setError(result.message || 'Failed to book appointment')
    } catch (err) { setError(err.message || 'Failed to book appointment') }
    finally { setLoading(false) }
  }

  return (
    <Modal open onClose={onClose} title="Book Appointment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient ID <span className="text-red-500">*</span></label>
          <input type="text" name="patientId" value={formData.patientId} onChange={handleInputChange} placeholder="Enter patient ID" className="input-field" disabled={loading} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor <span className="text-red-500">*</span></label>
          <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} className="input-field" disabled={loading}>
            <option value="">Select a doctor</option>
            {doctors.map(d => (
              <option key={d.staffId || d.id} value={d.staffId || d.id}>
                {d.firstName || d.name} {d.lastName || ''} — {d.specialization || 'General'}
              </option>
            ))}
          </select>
        </div>

        {unavailableDates.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-amber-700 text-xs font-medium mb-2">Unavailable dates:</p>
            <div className="flex flex-wrap gap-1.5">
              {unavailableDates.slice(0, 8).map(d => <span key={d} className="badge bg-red-100 text-red-700 text-xs">{d}</span>)}
              {unavailableDates.length > 8 && <span className="badge bg-slate-100 text-slate-600 text-xs">+{unavailableDates.length - 8}</span>}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Appointment Date <span className="text-red-500">*</span></label>
          <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange}
            min={getTodayISO()} disabled={loading || !formData.doctorId}
            className={`input-field ${isDateUnavailable(formData.appointmentDate) ? 'border-red-400' : ''}`} />
          {!formData.doctorId && <p className="text-xs text-slate-400 mt-1">Select a doctor first</p>}
          {checkingAvailability && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />Checking availability...</p>}
          {availabilityMessage === 'available' && !checkingAvailability && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Doctor available</p>}
          {availabilityMessage === 'unavailable' && !checkingAvailability && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Doctor unavailable on this date</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time <span className="text-red-500">*</span></label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="input-field" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time <span className="text-red-500">*</span></label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="input-field" disabled={loading} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Visit <span className="text-red-500">*</span></label>
          <textarea name="reasonForVisit" value={formData.reasonForVisit} onChange={handleInputChange} rows={3}
            placeholder="e.g., Fever and cough, Routine checkup..." className="input-field resize-none" disabled={loading} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2}
            placeholder="Additional notes..." className="input-field resize-none" disabled={loading} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Calendar className="w-4 h-4" />}
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
