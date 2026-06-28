import React from 'react'
import Modal from './common/Modal'
import { Clock, Calendar, User } from 'lucide-react'

export default function ReasonForVisitModal({ appointment, onClose }) {
  return (
    <Modal open={!!appointment} onClose={onClose} title="Reason for Visit" size="sm">
      {appointment && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Patient</span>
            <span className="font-medium text-slate-800">{appointment.patientName || 'N/A'}</span>
            <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
            <span className="font-medium text-slate-800">{appointment.appointmentDate || 'N/A'}</span>
            <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
            <span className="font-medium text-slate-800">{appointment.startTime} – {appointment.endTime}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Reason</p>
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {appointment.reasonForVisit || <span className="text-slate-400 italic">No reason provided.</span>}
            </div>
          </div>
          {appointment.notes && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Notes</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">{appointment.notes}</div>
            </div>
          )}
          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      )}
    </Modal>
  )
}
