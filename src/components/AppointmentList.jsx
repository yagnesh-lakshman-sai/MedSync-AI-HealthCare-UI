import React from 'react'
import { motion } from 'framer-motion'
import { Clock, RotateCcw, XCircle, Eye, Utensils, FileText } from 'lucide-react'
import StatusBadge from './common/StatusBadge'

export default function AppointmentList({
  appointments = [],
  loading = false,
  onReschedule,
  onCancel,
  onView,
  onViewReason,
  onViewDiagnosis,
  onGenerateDietPlan,
  emptyMessage = 'No appointments for this date.'
}) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!Array.isArray(appointments) || appointments.length === 0) {
    return <div className="p-8 text-center text-slate-500 text-sm">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {['Date & Time', 'Patient', 'Doctor', 'Notes', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {appointments.map((a, i) => {
            const isCancelled = ['Cancelled', 'CANCELLED'].includes(a.status)
            const isDiagnosed = a.status === 'DIAGNOSED'
            return (
              <motion.tr key={a.appointmentId || a.id || i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`hover:bg-slate-50 group transition-colors ${isCancelled ? 'opacity-60' : ''}`}>
                <td className="px-5 py-3.5">
                  <div className="text-sm font-medium text-slate-700">{a.appointmentDate || '—'}</div>
                  {a.startTime && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />{a.startTime} – {a.endTime}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-primary-500 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
                      {(a.patientName?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.patientName || 'N/A'}</p>
                      <p className="text-xs text-slate-400 font-mono">{a.patientId || ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-sm text-slate-700">{a.doctorName || a.doctor || 'N/A'}</p>
                  <p className="text-xs text-slate-400 font-mono">{a.doctorId || ''}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs truncate">{a.notes || a.reason || '—'}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status} label={a.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    {typeof onViewReason === 'function' && (
                      <button onClick={() => onViewReason(a)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all">
                        <Eye className="w-3 h-3" /> Reason
                      </button>
                    )}
                    {typeof onViewDiagnosis === 'function' && isDiagnosed && (
                      <button onClick={() => onViewDiagnosis(a)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all">
                        <FileText className="w-3 h-3" /> Diagnosis
                      </button>
                    )}
                    {typeof onGenerateDietPlan === 'function' && isDiagnosed && (
                      <button onClick={() => onGenerateDietPlan(a)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                        <Utensils className="w-3 h-3" /> {a.dietPlan ? 'Diet Plan' : 'Gen. Diet'}
                      </button>
                    )}
                    {typeof onReschedule === 'function' && !isCancelled && (
                      <button onClick={() => onReschedule(a)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all">
                        <RotateCcw className="w-3 h-3" /> Reschedule
                      </button>
                    )}
                    {typeof onCancel === 'function' && !isCancelled && (
                      <button onClick={() => onCancel(a.appointmentId || a.id)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
