import type { HTMLAttributes, ReactNode } from 'react'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  corners?: boolean
  className?: string
}

export function Panel({
  children,
  title,
  subtitle,
  corners = false,
  className = '',
  ...props
}: PanelProps) {
  return (
    <div className={`panel ${corners ? 'corners' : ''} ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="flex items-baseline justify-between border-b border-white/5 px-5 py-3">
          <div>
            {title && <h3 className="font-mono text-[11px] font-semibold tracking-[0.25em] text-amber">{title}</h3>}
            {subtitle && <p className="mt-0.5 font-mono text-[10px] tracking-widest text-muted">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
