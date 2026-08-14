// @ts-nocheck
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Mission } from '@/types'
import { ALGORITHM_META } from '@/algorithms'
import { Button } from '@/components/ui/Button'

interface BriefingProps {
  mission: Mission
  onStart: () => void
  onClose: () => void
}

export function MissionBriefing({ mission, onStart, onClose }: BriefingProps) {
  const meta = ALGORITHM_META[mission.algorithm]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-bg-base/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="panel corners relative w-full max-w-2xl border-amber/20"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1.5 text-muted transition-colors hover:text-cream"
          aria-label="Close briefing"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted">
              OP-{String(mission.order).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-amber">
              {mission.difficulty}
            </span>
          </div>

          <h2 className="mt-3 font-display text-3xl font-semibold text-cream">{mission.title}</h2>
          <p className="mt-1 font-mono text-xs tracking-[0.25em] text-amber">{mission.codename}</p>

          <div className="mt-6 rounded-sm border border-white/5 bg-bg-deep/50 p-5">
            <p className="label mb-2">MISSION OBJECTIVE</p>
            <p className="font-mono text-sm leading-relaxed text-cream">{mission.objective}</p>
          </div>

          <p className="mt-5 font-mono text-xs leading-relaxed text-muted">{mission.narrative}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-sm border border-white/5 p-3">
              <p className="label">ALGORITHM</p>
              <p className="mt-1 font-mono text-xs text-amber">{meta.name}</p>
            </div>
            <div className="rounded-sm border border-white/5 p-3">
              <p className="label">TIME</p>
              <p className="mt-1 font-mono text-xs text-cream">{(mission.scoring.timeLimitSeconds / 60).toFixed(0)}:00</p>
            </div>
            <div className="rounded-sm border border-white/5 p-3">
              <p className="label">TARGET</p>
              <p className="mt-1 font-mono text-xs text-amber">{mission.targetNode}</p>
            </div>
            <div className="rounded-sm border border-white/5 p-3">
              <p className="label">ENTRY</p>
              <p className="mt-1 font-mono text-xs text-success">{mission.entryNode}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Button variant="primary" size="lg" onClick={onStart} className="flex-1">
              INITIALIZE OPERATION
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}