import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  to?: string
}

export function Logo({ size = 'md', to = '/' }: LogoProps) {
  const s =
    size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg'

  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 font-display font-700 tracking-tight ${s} text-cream`}
      aria-label="BREACH home"
    >
      <svg width={size === 'lg' ? 34 : 22} height={size === 'lg' ? 34 : 22} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#0D1B14" stroke="#1E4A35" strokeWidth="1" />
        <path
          d="M6 20 L11 13 L16 18 L21 9 L26 15"
          stroke="#E7B85C"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="20" r="2.2" fill="#E7B85C" />
        <circle cx="11" cy="13" r="2.2" fill="#6FA37B" />
        <circle cx="16" cy="18" r="2.2" fill="#6FA37B" />
        <circle cx="21" cy="9" r="2.2" fill="#6FA37B" />
        <circle cx="26" cy="15" r="2.2" fill="#E7B85C" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-bold tracking-[0.18em] text-amber transition-colors group-hover:text-amber-bright">
          BREACH
        </span>
        {size === 'lg' && (
          <span className="mt-1 font-mono text-[9px] tracking-[0.32em] text-muted">
            ALGORITHMIC INFILTRATION
          </span>
        )}
      </span>
    </Link>
  )
}
