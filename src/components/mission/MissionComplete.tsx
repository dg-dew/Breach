// @ts-nocheck
import { motion } from 'framer-motion'
import { ArrowRight, RotateCcw, LayoutDashboard, CheckCircle2 } from 'lucide-react'
import type { AlgorithmType, Mission } from '@/types'
import { ALGORITHM_META } from '@/algorithms'
import type { ScoreBreakdown } from '@/game/scoring/scoring'
import { Button } from '@/components/ui/Button'

interface MissionCompleteProps {
  mission: Mission
  algorithm: AlgorithmType
  hasNext: boolean
  path: string[]
  cost: number
  nodesVisited: number
  timeMs: number
  exposure: number
  breakdown: ScoreBreakdown
  onNext: () => void
  onReplay: () => void
  onDashboard: () => void
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function MissionComplete({
  mission,
  algorithm,
  hasNext,
  path,
  cost,
  nodesVisited,
  timeMs,
  exposure,
  breakdown,
  onNext,
  onReplay,
  onDashboard,
}: MissionCompleteProps) {
  const meta = ALGORITHM_META[algorithm]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-bg-base/90 p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel corners w-full max-w-3xl border-amber/25 p-0"
      >
        <div className="border-b border-white/5 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto mb-4 inline-flex"
          >
            <CheckCircle2 size={52} className="text-success" strokeWidth={1.2} />
          </motion.div>
          <p className="label mb-1">OPERATION SUCCESSFUL</p>
          <h2 className="font-display text-5xl font-bold tracking-tight text-amber text-shadow-amber">
            BREACH COMPLETE
          </h2>
          <p className="mt-2 font-mono text-xs tracking-[0.25em] text-muted">
            {mission.codename} · {mission.title}
          </p>
        </div>

        <div className="grid gap-6 p-8 sm:grid-cols-[1fr_1fr]">
          <div>
            <p className="label mb-2">TARGET</p>
            <p className="font-display text-2xl font-semibold text-cream">{mission.targetNode}</p>

            <div className="mt-5">
              <p className="label mb-2">PATH</p>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-amber">
                {path.map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="rounded-sm border border-amber/20 bg-amber/5 px-1.5 py-0.5">{p}</span>
                    {i < path.length - 1 && <span className="text-muted">→</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <p className="label">COST</p>
                <p className="mt-1 font-display text-xl font-semibold text-cream">{cost}</p>
              </div>
              <div>
                <p className="label">NODES VISITED</p>
                <p className="mt-1 font-display text-xl font-semibold text-cream">{nodesVisited}</p>
              </div>
              <div>
                <p className="label">TIME</p>
                <p className="mt-1 font-display text-xl font-semibold text-cream">{fmtTime(timeMs)}</p>
              </div>
              <div>
                <p className="label">EXPOSURE</p>
                <p className="mt-1 font-display text-xl font-semibold text-dangerBright">{exposure}%</p>
              </div>
              <div>
                <p className="label">ALGORITHM</p>
                <p className="mt-1 font-display text-sm font-semibold text-amber">{meta.name}</p>
              </div>
              <div>
                <p className="label">EFFICIENCY</p>
                <p className="mt-1 font-display text-xl font-semibold text-success">{breakdown.efficiency}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-white/5 bg-bg-deep/50 p-6">
            <p className="label mb-4">SCORE BREAKDOWN</p>
            <div className="space-y-2.5 font-mono text-xs">
              {breakdown.lines.map((line) => (
                <div key={line.label} className="flex items-center justify-between">
                  <span className="text-muted">{line.label}</span>
                  <span className={line.value >= 0 ? 'text-success' : 'text-dangerBright'}>
                    {line.value >= 0 ? '+' : ''}
                    {line.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 border-t border-white/10 pt-4 text-center"
            >
              <p className="label mb-1">TOTAL SCORE</p>
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.6 }}
                className="font-display text-5xl font-bold text-amber text-shadow-amber"
              >
                +{breakdown.score.toLocaleString()}
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Why this worked */}
        <div className="border-t border-white/5 bg-bg-deep/30 p-8">
          <p className="label mb-2">WHY THIS WORKED</p>
          <p className="max-w-2xl font-mono text-xs leading-relaxed text-muted">{meta.description}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 border-t border-white/5 p-6">
          <Button variant="primary" size="lg" onClick={onNext}>
            {hasNext ? 'NEXT OPERATION' : 'BACK TO COMMAND'}
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" size="lg" onClick={onReplay}>
            <RotateCcw size={15} /> REPLAY
          </Button>
          <Button variant="ghost" size="lg" onClick={onDashboard}>
            <LayoutDashboard size={15} /> DASHBOARD
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}