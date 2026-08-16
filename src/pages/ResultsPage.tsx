import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeistController } from '@/game/heist/HeistController'
import { scoreHeist, type ScoreBreakdown } from '@/game/heist/scoring'
import { useHeistStore } from '@/store/heistStore'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function ResultsPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const snapshot = useHeistStore((s) => s.snapshot)
  const operator = useHeistStore((s) => s.operator)
  const startHeist = useHeistStore((s) => s.startHeist)
  const clear = useHeistStore((s) => s.clear)

  const [score, setScore] = useState<ScoreBreakdown | null>(null)

  useEffect(() => {
    if (!snapshot) return
    const controller = HeistController.fromSnapshot(snapshot)
    const data = scoreHeist(controller.getPerformance(), controller.getSummary())
    setScore(data)
  }, [snapshot])

  useEffect(() => {
    if (!snapshot || (snapshot.phase !== 'complete' && snapshot.phase !== 'failed')) navigate('/', { replace: true })
  }, [snapshot, navigate])

  useEffect(() => {
    if (!score) return
    const total = score.total
    const duration = 1500
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setScore((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          total: Math.round(prev.total * (1 - eased) + total * eased),
        }
      })
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  if (!score || !snapshot) return null
  const { total, max, categories, dsa, strengths, improvements, grade } = score
  const failed = snapshot.phase === 'failed'

  return (
    <div className="grid-lines grain crt-lines min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="label mb-2">OPERATION REPORT // {operator}</p>

          {/* Success or failure header */}
          {!failed && (
            <motion.div className="mb-8">
              <h1 className="font-display text-5xl font-bold text-amber text-shadow-amber">
                BREACH COMPLETE
              </h1>
              <p className="mt-2 font-mono text-sm text-muted">
                MISSION: BLACK VAULT · TARGET: SECURED · EXTRACTION: SUCCESSFUL
              </p>
            </motion.div>
          )}
          {failed && (
            <motion.div className="mb-8">
              <h1 className="font-display text-5xl font-bold text-dangerBright text-shadow-amber">
                OPERATION FAILED
              </h1>
              <p className="mt-2 font-mono text-sm text-dangerBright">
                CAUSE: {snapshot.failedReason ?? 'unknown cause'}
              </p>
              <p className="mt-1">
                <span className="text-cream">TIME:</span> {(
                  (snapshot.timeLimitSec - snapshot.timeRemaining) /
                  60
                ).toFixed(0)}m {((snapshot.timeLimitSec - snapshot.timeRemaining) % 60)
                  .toFixed(0)
                  .padStart(2, '0')}s ·
                <span className="text-cream">EXPOSURE:</span> {snapshot.exposure} / 100
              </p>
              <p className="mt-1">
                <span className="text-cream">PHASE REACHED:</span> {
                  snapshot.phase === 'extraction'
                    ? 'EXTRACTION'
                    : snapshot.phase === 'resourceOptimization'
                      ? 'RESOURCE OPTIMIZATION'
                      : snapshot.phase === 'networkOptimization'
                        ? 'NETWORK OPTIMIZATION'
                        : snapshot.phase === 'pathfinding'
                          ? 'PATHFINDING'
                          : snapshot.phase === 'search'
                            ? 'SEARCH'
                            : snapshot.phase === 'infiltration'
                              ? 'INFILTRATION'
                              : 'UNKNOWN'
                }
                {','} PHASES COMPLETED: ${
                  snapshot.phase === 'complete' ? 6 : Math.min(6, (snapshot.phasesCompleted ?? 0) + 1)
                }
              </p>
            </motion.div>
          )}

          {/* Progressive total score */}
          <div className="mb-8">
            <p className="font-mono text-5xl font-bold text-cream">
              {total.toLocaleString()}
            </p>
            <p className="label mt-1">SCORE / {max.toLocaleString()} · GRADE {grade}</p>
          </div>

          {/* Score breakdown categories */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {categories.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="panel px-5 py-4"
              >
                <div className="flex items-baseline justify-between border-b border-white/5 pb-2">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-amber">{c.label}</p>
                  </div>
                  <span className="font-mono text-lg font-semibold text-cream">
                    {c.earned}
                    <span className="text-xs text-muted"> / {c.max}</span>
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {c.lines.map((l) =>
                    l.max === 0 ? (
                      <div key={l.label} className="flex justify-between font-mono text-[10px] text-muted">
                        <span>{l.label}</span>
                        <span className="text-cream/80">{l.detail}</span>
                      </div>
                    ) : (
                      <div key={l.label}>
                        <div className="flex justify-between font-mono text-[10px] text-muted">
                          <span>{l.label}</span>
                          <span className="text-cream/80">
                            {l.earned} / {l.max}
                          </span>
                        </div>
                        <ProgressBar value={l.earned} max={l.max} color={l.earned >= l.max ? 'green' : 'amber'} className="mt-1" />
                        <p className="mt-0.5 font-mono text-[9px] text-muted/70">{l.detail}</p>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* DSA performance grid */}
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2">
            {dsa.map((s) => (
              <div key={s.id} className="panel px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted">{s.label}</p>
                <p className="font-mono text-lg font-semibold text-cream">{s.value}%</p>
                <p className="font-mono text-[9px] text-muted/60">{s.detail}</p>
              </div>
            ))}
          </div>

          {/* Strongest / Area to improve */}
          {(strengths.length > 0 || improvements.length > 0) && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {strengths.length > 0 && (
                <div className="panel border-success/20 px-5 py-4">
                  <p className="label mb-3 text-success">STRONGEST AREA</p>
                  <ul className="space-y-1.5">
                    {strengths.map((s, i) => (
                      <li key={i} className="font-mono text-[11px] text-cream/80">
                        <span className="text-success">+ </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {improvements.length > 0 && (
                <div className="panel border-danger/20 px-5 py-4">
                  <p className="label mb-3 text-dangerBright">AREA TO IMPROVE</p>
                  <ul className="space-y-1.5">
                    {improvements.map((s, i) => (
                      <li key={i} className="font-mono text-[11px] text-cream/80">
                        <span className="text-dangerBright">− </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Run summary */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="panel px-5 py-4">
              <p className="label mb-3">RUN SUMMARY</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <ProfileRow label="ELAPSED" value={`${snapshot.timeLimitSec - snapshot.timeRemaining}s`} />
                <ProfileRow label="TIME LEFT" value={`${snapshot.timeRemaining}s`} />
                <ProfileRow label="EXPOSURE" value={`${snapshot.exposure} / 100`} />
                <ProfileRow label="ALERT" value={`${snapshot.alert} / 100`} />
                <ProfileRow label="ENERGY" value={`${snapshot.energy} / 100`} />
                <ProfileRow label="PHASES" value={`${snapshot.phasesCompleted} / 6`} />
              </div>
            </div>
            <div className="panel px-5 py-4">
              <p className="label mb-3">DSA PROFILE</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <ProfileRow label="GRAPHS" value={`${dsa.find((d) => d.id === 'graphs')?.value ?? 0}%`} />
                <ProfileRow label="BFS·DFS" value={`${dsa.find((d) => d.id === 'search')?.value ?? 0}%`} />
                <ProfileRow label="PATHFINDING" value={`${dsa.find((d) => d.id === 'pathfinding')?.value ?? 0}%`} />
                <ProfileRow label="PRIORITY QUEUE" value={`${dsa.find((d) => d.id === 'priorityQueue')?.value ?? 0}%`} />
                <ProfileRow label="MST" value={`${dsa.find((d) => d.id === 'networkOptimization')?.value ?? 0}%`} />
                <ProfileRow label="DYNAMIC DP" value={`${dsa.find((d) => d.id === 'dp')?.value ?? 0}%`} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="font-mono text-[11px] text-muted">
              SCORE FORMULA — SUM OF SIX PHASE SCORES + BONUS · MAX {max.toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-3">
              {!failed && (
                <Button variant="primary" size="lg" onClick={() => {
                  play('uiClick')
                  navigate('/analysis')
                }}>
                  VIEW NETWORK ANALYSIS [E]
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  startHeist(operator)
                  play('uiClick')
                  navigate('/heist')
                }}
                disabled={failed}
              >
                RETRY HEIST
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  clear()
                  navigate('/')
                }}
              >
                EXIT
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1">
      <span className="font-mono text-[10px] tracking-[0.2em] text-muted">{label}</span>
      <span className="font-mono text-xs font-semibold text-cream">{value}</span>
    </div>
  )
}