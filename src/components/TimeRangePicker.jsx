import React from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

export default function TimeRangePicker({ from, to, onChange, disabled }) {
  const invalid = from && to && from >= to

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> From
          </label>
          <input
            type="time"
            value={from || ''}
            onChange={e => onChange({ from: e.target.value, to })}
            disabled={disabled}
            className="input-field text-sm py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> To
          </label>
          <input
            type="time"
            value={to || ''}
            onChange={e => onChange({ from, to: e.target.value })}
            disabled={disabled}
            className="input-field text-sm py-2"
          />
        </div>
      </div>
      {invalid && (
        <p className="flex items-center gap-1.5 text-red-500 text-xs">
          <AlertTriangle className="w-3 h-3" />
          End time must be after start time.
        </p>
      )}
    </div>
  )
}
