import React from 'react'
import Modal from './common/Modal'
import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ViewDiagnosisModal({ appointment, onClose }) {
  const Section = ({ label, value, pre }) => (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
      <div className={`bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 ${pre ? 'whitespace-pre-wrap' : ''}`}>
        {value || <span className="text-slate-400 italic">Not provided</span>}
      </div>
    </div>
  )

  return (
    <Modal open={!!appointment} onClose={onClose} title={`Diagnosis — ${appointment?.patientName || ''}`} size="lg">
      {appointment && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 text-sm">
            <div><span className="text-slate-500">Patient ID</span><p className="font-mono text-slate-800 font-medium">{appointment.patientId || '—'}</p></div>
            <div><span className="text-slate-500">Doctor ID</span><p className="font-mono text-slate-800 font-medium">{appointment.doctorId || '—'}</p></div>
          </div>
          <Section label="Diagnosis Summary" value={appointment.diagnosisSummary} />
          <Section label="Prescription" value={appointment.prescription} pre />
          <Section label="Medicines" value={appointment.medicines} />
          <Section label="Notes for Receptionist" value={appointment.notesForReceptionist} />
          <Section label="Follow-up Suggestion" value={appointment.followUpSuggestion} />
          {appointment.dietPlan && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">AI Diet Plan</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-slate-700 prose prose-sm max-w-none">
                <ReactMarkdown>{appointment.dietPlan}</ReactMarkdown>
              </div>
            </div>
          )}
          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      )}
    </Modal>
  )
}
