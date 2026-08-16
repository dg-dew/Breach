import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PHASE_META, PHASE_ORDER } from '@/game/heist/types'
import { useHeistStore } from '@/store/heistStore'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'

const CONTROLS = [
  { keys: ['W', 'S'], action: 'CYCLE ACTION' },
  { keys: ['E'], action: 'CONFIRM / INTERACT' },
  { keys: ['ESC'], action: 'PAUSE' },
]

export function BriefingPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const operator = useHeistStore((s) => s.operator)
  const snapshot = useHeistStore((s) => s.snapshot)

  useEffect(() => {
    if (!operator) navigate('/', { replace: true })
  }, [operator, navigate])

  const start = () => {
    if (!snapshot) {
      useHeistStore.getState().startHeist(operator)
    }
    play('uiClick')
    navigate('/heist')
  }

  return (
    <div className="grid-lines grain crt-lines min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="label mb-2">OPERATION ORDER // {operator}</p>
          <h1 className="font-display text-4xl font-bold text-cream">THE BLACK VAULT</h1>
          <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-muted">
            A single objective: reach the BLACK VAULT, restore the damaged network, extract
            maximum data — and get out before the clock or the exposure meter ends you.
          </p>
        </motion.div>

        <div className="mt-8 space-y-2">
          {PHASE_ORDER.map((phase, i) => {
            const meta = PHASE_META[phase]
            return (
              <div key={phase} className="panel flex items-center gap-4 px-5 py-3">
                <span className="font-mono text-sm font-semibold text-amber">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-cream">{meta.title}</p>
                </div>
                <span className="font-mono text-[10px] tracking-[0.25em] text-muted">{meta.concept}</span>
              </div>
            )
          })}
        </div>

        <div className="panel mt-8 px-6 py-5">
          <p className="label mb-3">CONTROLS</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {CONTROLS.map((c) => (
              <div key={c.action} className="flex items-center gap-3">
                <span className="flex gap-1">
                  {c.keys.map((k) => (
                    <kbd key={k} className="rounded-sm border border-amber/40 bg-bg-deep px-2 py-1 font-mono text-[10px] text-amber">
                      {k}
                    </kbd>
                  ))}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-muted">{c.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-[11px] text-muted">
            TIME 10:00 &nbsp;·&nbsp; EXPOSURE 100 &nbsp;·&nbsp; ENERGY 100
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ABORT
            </Button>
            <Button variant="primary" size="lg" onClick={start}>
              START OPERATION
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}