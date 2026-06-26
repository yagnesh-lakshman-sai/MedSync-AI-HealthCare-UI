import React, { useState } from 'react'
import * as api from '../services/api'
import Modal from './common/Modal'
import { ClipboardPlus } from 'lucide-react'

export default function DiagnosisModal({ appointment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    diagnosisSummary: '', prescription: '', medicines: '', notesForReceptionist: '', followUpSuggestion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.submitDiagnosis(appointment.appointmentId || appointment.id, formData)
      onSuccess?.()
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit diagnosis') }
    finally { setLoading(false) }
  }

  const fields = [
    { name: 'diagnosisSummary', label: 'Diagnosis Summary', type: 'textarea', rows: 3, required: true, placeholder: 'Enter diagnosis summary...' },
    { name: 'prescription', label: 'Prescription', type: 'textarea', rows: 3, required: true, placeholder: 'Enter prescription details...' },
    { name: 'medicines', label: 'Medicines', type: 'input', placeholder: 'e.g. Paracetamol 500mg, Amoxicillin 250mg' },
    { name: 'notesForReceptionist', label: 'Notes for Receptionist', type: 'textarea', rows: 2, placeholder: 'Instructions for receptionist...' },
    { name: 'followUpSuggestion', label: 'Follow-up Suggestion', type: 'input', placeholder: 'e.g. After 2 weeks' },
  ]

  return (
    <Modal open={!!appointment} onClose={onClose} title={`Diagnosis — ${appointment?.patientName || ''}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">{error}</div>}
        {fields.map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
            {f.type === 'textarea' ? (
              <textarea name={f.name} value={formData[f.name]} onChange={handleChange} rows={f.rows} placeholder={f.placeholder} className="input-field resize-none" required={f.required} />
            ) : (
              <input type="text" name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} className="input-field" />
            )}
          </div>
        ))}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ClipboardPlus className="w-4 h-4" />}
            {loading ? 'Submitting...' : 'Submit Diagnosis'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
