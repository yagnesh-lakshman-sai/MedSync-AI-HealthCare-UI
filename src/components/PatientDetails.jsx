import React, { useState, useEffect } from 'react'
import * as api from '../services/api'
import Modal from './common/Modal'
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react'

export default function PatientDetails({ appointment, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const patientId = appointment?.patientId
        if (patientId && typeof api.getPatientById === 'function') {
          const resp = await api.getPatientById(patientId)
          if (resp?.success && resp?.data) { setDetails(resp.data); setLoading(false); return }
          if (resp?.status === 200 && resp?.data) { setDetails(resp.data); setLoading(false); return }
        }
      } catch {}
      // Fallback
      setDetails({
        patientId: appointment?.patientId, patientName: appointment?.patientName,
        email: appointment?.email, phone: appointment?.phone || appointment?.patientPhoneNumber,
        dateOfBirth: appointment?.dateOfBirth, gender: appointment?.gender,
        patientAddress: appointment?.patientAddress,
      })
      setLoading(false)
    }
    fetch()
  }, [appointment])

  const name = details?.patientName || details?.name || 'Patient'
  const initials = name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Modal open={!!appointment} onClose={onClose} title="Patient Details" size="md">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : details && (
        <div className="space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-display font-700 text-xl">
              {initials}
            </div>
            <div>
              <h3 className="font-display font-700 text-slate-900 text-lg">{name}</h3>
              <p className="text-slate-400 text-sm">{details.patientId || details.id || ''} {details.gender ? `· ${details.gender}` : ''}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail, label: 'Email', value: details.email || details.patientEmail },
              { icon: Phone, label: 'Phone', value: details.phone || details.patientPhoneNumber },
              { icon: Calendar, label: 'Date of Birth', value: details.dateOfBirth || details.dob },
            ].map(({ icon: Icon, label, value }) => value && (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Icon className="w-3 h-3" />{label}
                </div>
                <p className="text-slate-800 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          {details.patientAddress && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2"><MapPin className="w-3 h-3" />Address</div>
              <p className="text-slate-800 text-sm">
                {[details.patientAddress.doorNumber, details.patientAddress.landmark, details.patientAddress.city, details.patientAddress.state, details.patientAddress.country, details.patientAddress.pinCode].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          )}

          {/* Appointment details */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Appointment Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-medium text-slate-800">{appointment?.appointmentDate} · {appointment?.startTime} – {appointment?.endTime}</span>
              </div>
              {appointment?.reasonForVisit && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 flex-shrink-0">Reason</span>
                  <span className="font-medium text-primary-600 text-right">{appointment.reasonForVisit}</span>
                </div>
              )}
              {appointment?.notes && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 flex-shrink-0">Notes</span>
                  <span className="text-slate-700 text-right">{appointment.notes}</span>
                </div>
              )}
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      )}
    </Modal>
  )
}
