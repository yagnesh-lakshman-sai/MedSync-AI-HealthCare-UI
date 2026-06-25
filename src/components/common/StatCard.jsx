import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color = 'blue', loading }) {
  const colors = {
    blue: { bg: 'bg-primary-50', icon: 'text-primary-600', iconBg: 'bg-primary-100' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600', iconBg: 'bg-teal-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', iconBg: 'bg-rose-100' },
  }
  const c = colors[color] || colors.blue

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-100" />
          <div className="w-12 h-4 bg-slate-100 rounded" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-20 h-7 bg-slate-100 rounded" />
          <div className="w-24 h-4 bg-slate-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="stat-card group cursor-default"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.iconBg)}>
          {Icon && <Icon className={cn('w-5 h-5', c.icon)} />}
        </div>
        {trendValue !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-display font-700 text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}
