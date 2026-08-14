import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: string
  accent?: 'amber' | 'green' | 'danger' | 'default'
  index?: number
}

const accentText = {
  amber: 'text-amber',
  green: 'text-success',
  danger: 'text-dangerBright',
  default: 'text-cream',
}

export function StatCard({ label, value, sub, accent = 'default', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="panel corners p-5"
    >
      <p className="label">{label}</p>
      <div className={`mt-3 font-display text-3xl font-semibold ${accentText[accent]}`}>{value}</div>
      {sub && <p className="mt-1 font-mono text-[10px] tracking-widest text-muted">{sub}</p>}
    </motion.div>
  )
}