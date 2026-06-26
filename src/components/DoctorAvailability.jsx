import React, { useState, useEffect } from 'react'
import * as api from '../services/api'
import { formatDateWithDay, getTodayISO } from '../utils/dateUtils'
import Modal from './common/Modal'
import { CheckCircle, XCircle, X, CalendarX } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function DoctorAvailability({ onClose, onSuccess, unavailableDates: initialDates = [], onUpdate }) {
  const { user } = useAuth()
  const doctorId = user?.staffId || user?.username
  const [activeTab, setActiveTab] = useState('unavailable')
  const [selectedDates, setSelectedDates] = useState([])
  const [unavailableDates, setUnavailableDates] = useState(initialDates)
  const [loading, setLoading] = useState(false)
  const [loadingDates, setLoadingDates] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { loadUnavailableDates() }, [doctorId])

  async function loadUnavailableDates() {
    if (!doctorId) return
    setLoadingDates(true)
    try {
      const result = await api.getDoctorUnavailableDates(doctorId)
      setUnavailableDates(result.success && Array.isArray(result.data) ? result.data : [])
    } catch { setUnavailableDates([]) } finally { setLoadingDates(false) }
  }

  const handleDateSelect = (e) => {
    const date = e.target.value
    if (date && !selectedDates.includes(date)) { setSelectedDates(p => [...p, date]); setError(''); setSuccessMsg('') }
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDates.length) { setError('Select at least one date'); return }
    setLoading(true); setError(''); setSuccessMsg('')
    try {
      const result = activeTab === 'available'
        ? await api.markDoctorAvailable(doctorId, selectedDates)
        : await api.markDoctorUnavailable(doctorId, selectedDates)
      if (result.success) {
        setSuccessMsg(`Marked ${selectedDates.length} date(s) as ${activeTab}`)
        setSelectedDates([])
        await loadUnavailableDates()
        onUpdate?.()
        setTimeout(() => onClose?.(), 1500)
      } else setError(result.message || 'Failed to update')
    } catch { setError('Failed to update availability') } finally { setLoading(false) }
  }

  return (
    <Modal open onClose={onClose} title="Manage Availability" size="md">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
        {[{ id: 'unavailable', label: 'Mark Unavailable' }, { id: 'available', label: 'Mark Available' }].map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedDates([]); setError(''); setSuccessMsg('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date picker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Date</label>
          <input type="date" onChange={handleDateSelect} min={getTodayISO()} className="input-field" />
          <p className="text-xs text-slate-400 mt-1">Click a date to add it to your selection below</p>
        </div>

        {/* Selected dates */}
        {selectedDates.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Selected ({selectedDates.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedDates.map(d => (
                <div key={d} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium ${activeTab === 'unavailable' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {formatDateWithDay(d)}
                  <button type="button" onClick={() => setSelectedDates(p => p.filter(x => x !== d))} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current unavailable dates (show when marking available) */}
        {activeTab === 'available' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarX className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">Currently Unavailable{loadingDates ? ' (loading...)' : ''}</p>
            </div>
            {unavailableDates.length === 0 && !loadingDates ? (
              <p className="text-xs text-slate-400">You are available on all dates.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {unavailableDates.map(d => {
                  const isSelected = selectedDates.includes(d)
                  return (
                    <button key={d} type="button"
                      onClick={() => !isSelected && setSelectedDates(p => [...p, d])}
                      className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'}`}>
                      {d}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">{error}</div>}
        {successMsg && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{successMsg}</div>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading || !selectedDates.length}
            className={`flex-1 font-medium py-2 rounded-xl text-sm text-white transition-all flex items-center justify-center gap-2 ${activeTab === 'unavailable' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-50`}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? 'Updating...' : `Mark ${activeTab === 'unavailable' ? 'Unavailable' : 'Available'}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
