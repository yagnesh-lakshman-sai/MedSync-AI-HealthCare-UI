import React from 'react'

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <div key={j} className="h-4 bg-slate-100 rounded" style={{ width: `${60 + j * 20}px` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse space-y-3">
      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
      <div className="h-7 w-20 bg-slate-100 rounded" />
      <div className="h-4 w-28 bg-slate-100 rounded" />
    </div>
  )
}

export function PageSkeleton({ cards = 4, rows = 5 }) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: cards }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="card">
        <div className="p-5 border-b border-slate-100 animate-pulse">
          <div className="h-5 w-32 bg-slate-100 rounded" />
        </div>
        <TableSkeleton rows={rows} />
      </div>
    </div>
  )
}
