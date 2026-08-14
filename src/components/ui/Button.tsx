import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-amber text-bg-base font-semibold hover:bg-amber-bright shadow-halo border border-amber/40',
  ghost: 'bg-transparent text-cream/80 hover:text-cream hover:bg-white/5 border border-transparent',
  outline:
    'bg-transparent text-cream/90 border border-amber/30 hover:border-amber/60 hover:bg-amber/5 hover:text-amber',
  danger: 'bg-danger/20 text-dangerBright border border-danger/40 hover:bg-danger/30',
  success: 'bg-success/20 text-success border border-success/40 hover:bg-success/30',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
}

export function Button({
  variant = 'outline',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm font-mono tracking-wide transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
