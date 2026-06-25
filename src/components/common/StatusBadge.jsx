import React from 'react'
import { cn } from '../../lib/utils'

const variants = {
  SCHEDULED: 'badge-info',
  CONFIRMED: 'badge-success',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  PENDING: 'badge-warning',
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-muted',
  DOCTOR: 'badge-info',
  'NON_DOCTOR': 'badge-muted',
}

export default function StatusBadge({ status, label }) {
  const variant = variants[status?.toUpperCase()] || 'badge-muted'
  return (
    <span className={cn('badge', variant)}>
      {label || status}
    </span>
  )
}
