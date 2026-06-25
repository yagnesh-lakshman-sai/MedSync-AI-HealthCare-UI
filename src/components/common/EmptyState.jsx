import React from 'react'
import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-slate-800 font-600 text-base mb-1">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary mt-4 text-sm">{actionLabel}</button>
      )}
    </motion.div>
  )
}
