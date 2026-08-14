import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Settings, User, Menu, X, Briefcase, Home, Network, Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { usePlayerStore } from '@/store/playerStore'

const NAV_ITEMS = [
  { to: '/safehouse', label: 'SAFEHOUSE', icon: Home },
  { to: '/contracts', label: 'CONTRACTS', icon: Briefcase },
  { to: '/operations', label: 'OPERATIONS', icon: Network },
  { to: '/network', label: 'NETWORK', icon: Network },
  { to: '/operator', label: 'OPERATOR', icon: User },
  { to: '/archive', label: 'ARCHIVE', icon: Archive },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const isInitialized = usePlayerStore((s) => s.isInitialized)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 font-mono text-[11px] tracking-[0.22em] transition-colors flex items-center gap-2 ${
      isActive ? 'text-amber' : 'text-muted hover:text-cream'
    }`

  if (!isInitialized) return null

  return (
    <header className="fixed inset-x-0 top-0 z-[60] border-b border-white/5 bg-bg-base/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      <Icon size={13} />
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-2 -bottom-[1px] h-px bg-amber shadow-glow"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => navigate('/operator')}
            className="inline-flex items-center gap-2 rounded-sm px-3 py-2 font-mono text-[11px] tracking-[0.22em] text-muted transition-colors hover:text-cream"
            aria-label="Operator"
          >
            <User size={14} /> OPERATOR
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-2 rounded-sm px-3 py-2 font-mono text-[11px] tracking-[0.22em] text-muted transition-colors hover:text-cream"
            aria-label="Settings"
          >
            <Settings size={14} /> SETTINGS
          </button>
        </div>

        <button
          className="inline-flex items-center rounded-sm p-2 text-cream lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-bg-deep lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col px-4 py-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-3 font-mono text-sm tracking-[0.22em] ${
                        isActive ? 'text-amber' : 'text-muted'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                )
              })}
              <div className="mt-2 flex gap-3 border-t border-white/5 pt-3">
                <Link to="/operator" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 font-mono text-xs tracking-widest text-muted">
                  <User size={14} /> OPERATOR
                </Link>
                <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 font-mono text-xs tracking-widest text-muted">
                  <Settings size={14} /> SETTINGS
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}