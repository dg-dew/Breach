interface ProgressBarProps {
  value: number
  max?: number
  color?: 'amber' | 'green' | 'danger'
  className?: string
  label?: string
}

const colorClass = {
  amber: 'bg-amber',
  green: 'bg-success',
  danger: 'bg-dangerBright',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'amber',
  className = '',
  label,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-white/5">
        <div
          className={`h-full ${colorClass[color]} transition-all duration-500`}
          style={{ width: `${pct}%`, boxShadow: `0 0 12px -2px rgba(230,184,92,0.6)` }}
        />
      </div>
    </div>
  )
}