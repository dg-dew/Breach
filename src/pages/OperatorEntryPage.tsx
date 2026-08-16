import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useHeistStore } from '@/store/heistStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'

export function OperatorEntryPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const operator = useHeistStore((s) => s.operator)
  const snapshot = useHeistStore((s) => s.snapshot)
  const startHeist = useHeistStore((s) => s.startHeist)
  const sound = useSettingsStore((s) => s.sound)
  const setSound = useSettingsStore((s) => s.setSound)
  const [callsign, setCallsign] = useState(operator)

  const canResume = Boolean(snapshot && operator)
  const canStart = callsign.trim().length >= 2

  const begin = () => {
    const name = callsign.trim().toUpperCase()
    startHeist(name)
    play('uiClick')
    navigate('/briefing')
  }

  const resume = () => {
    play('uiClick')
    navigate('/heist')
  }

  return (
    <div className="grid-lines grain crt-lines relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="panel corners px-8 py-10"
        >
          <div className="mb-8 text-center">
            <div className="mb-3 flex justify-center">
              <svg width="44" height="44" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="6" fill="#0D1B14" stroke="#1E4A35" strokeWidth="1" />
                <path d="M6 20 L11 13 L16 18 L21 9 L26 15" stroke="#E7B85C" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="20" r="2.2" fill="#E7B85C" />
                <circle cx="11" cy="13" r="2.2" fill="#6FA37B" />
                <circle cx="16" cy="18" r="2.2" fill="#6FA37B" />
                <circle cx="21" cy="9" r="2.2" fill="#6FA37B" />
                <circle cx="26" cy="15" r="2.2" fill="#E7B85C" />
              </svg>
            </div>
            <h1 className="font-display text-5xl font-bold tracking-[0.18em] text-amber text-shadow-amber">BREACH</h1>
            <p className="mt-2 font-mono text-[10px] tracking-[0.32em] text-muted">ONE TARGET · SIX PHASES · ONE EXTRACTION</p>
          </div>

          <label className="label mb-2 block" htmlFor="callsign">
            OPERATOR CALLSIGN
          </label>
          <input
            id="callsign"
            value={callsign}
            maxLength={14}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canStart) begin()
            }}
            placeholder="ENTER YOUR NAME"
            className="w-full rounded-sm border border-white/10 bg-bg-deep px-4 py-3 font-mono text-sm tracking-[0.2em] text-cream placeholder:text-muted/50 focus:border-amber/60 focus:outline-none"
          />

          <Button
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            disabled={!canStart}
            onClick={begin}
          >
            INITIALIZE BREACH
          </Button>

          {canResume && (
            <Button variant="outline" size="md" className="mt-3 w-full" onClick={resume}>
              RESUME OPERATION · {operator}
            </Button>
          )}

          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/5 pt-5 text-center">
            <div>
              <p className="font-mono text-lg font-semibold text-amber">6</p>
              <p className="label">PHASES</p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-amber">16</p>
              <p className="label">LOCATIONS</p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-amber">10:00</p>
              <p className="label">TIME LIMIT</p>
            </div>
          </div>

          <button
            onClick={() => {
              setSound(!sound)
              play('uiClick')
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm border border-white/10 py-2 font-mono text-[10px] tracking-[0.25em] text-muted transition-colors hover:border-amber/40 hover:text-amber"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            SOUND {sound ? 'ON' : 'OFF'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}