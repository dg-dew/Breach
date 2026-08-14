import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Shield, Target, Timer, Dices } from 'lucide-react'
import { useGameStore, MISSIONS } from '@/store/gameStore'
import { StatCard } from '@/components/dashboard/StatCard'
import { MissionCard } from '@/components/mission/MissionCard'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ALGORITHM_META } from '@/algorithms'

function formatMs(ms: number): string {
  if (!ms) return '—'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function OperationsPage() {
  const navigate = useNavigate()
  const store = useGameStore()

  const unlockedCount = store.completedMissions.length + 1
  const threat = Math.max(
    10,
    Math.min(95, 20 + store.completedMissions.length * 12 + (100 - store.bestTime ? 0 : 0)),
  )

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-2">OPERATIONS DASHBOARD</p>
          <h1 className="font-display text-4xl font-semibold text-cream">Command Center</h1>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
            NETWORK STABLE
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>NODE GRID ONLINE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          index={0}
          label="CLEARANCE"
          value={`LEVEL ${String(store.clearanceLevel).padStart(2, '0')}`}
          sub="OPERATOR CLEARANCE"
          accent="amber"
        />
        <StatCard
          index={1}
          label="THREAT"
          value={
            <span className="flex items-center gap-3">
              {threat >= 66 ? 'HIGH' : threat >= 34 ? 'MEDIUM' : 'LOW'}
              <span className="w-16"><ProgressBar value={threat} color={threat >= 66 ? 'danger' : 'amber'} /></span>
            </span>
          }
          sub={`GLOBAL THREAT ${threat}%`}
          accent={threat >= 66 ? 'danger' : 'amber'}
        />
        <StatCard
          index={2}
          label="OPERATIONS"
          value={`${store.operationsCompleted} / ${MISSIONS.length}`}
          sub="MISSIONS COMPLETE"
          accent="green"
        />
        <StatCard
          index={3}
          label="BEST SCORE"
          value={store.totalScore.toLocaleString()}
          sub="TOTAL SCORE"
          accent="amber"
        />
        <StatCard
          index={4}
          label="BEST TIME"
          value={formatMs(store.bestTime)}
          sub="FASTEST BREACH"
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Mission grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-cream">
              <Target size={20} className="text-amber" /> Active Operations
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {MISSIONS.map((m) => {
              const index = MISSIONS.findIndex((x) => x.id === m.id)
              const completed = store.completedMissions.includes(m.id)
              const unlocked = index < unlockedCount
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  completed={completed}
                  unlocked={unlocked}
                  highScore={store.highScores[m.id]}
                  isNext={!completed && unlocked}
                  onLaunch={(id) => navigate(`/mission/${id}`)}
                />
              )
            })}

            {/* Procedural operation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="panel corners group relative flex flex-col justify-between border-dashed p-6 transition-colors hover:border-amber/25"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-muted">SYS-GEN</span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-amber">RANDOM</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-cream">Procedural Operation</h3>
                <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-amber">UNKNOWN NETWORK</p>
                <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
                  A generated network with decoys, bottlenecks and locked corridors.
                  Seeded — reproduce any run.
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">DIJKSTRA · DIFFICULTY VARIES</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/mission/proc-${Math.floor(Math.random() * 999) + 1}`)}
                >
                  <Dices size={13} /> GENERATE
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="panel corners p-6">
            <p className="label mb-4">ALGORITHM PROFICIENCY</p>
            <div className="space-y-4">
              {Object.entries(ALGORITHM_META).map(([key, meta]) => {
                const prof = store.algorithmProficiency[key as keyof typeof store.algorithmProficiency]
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-muted">{meta.name}</span>
                      <span className="font-mono text-[10px] text-amber">{prof}%</span>
                    </div>
                    <ProgressBar value={prof} color="amber" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="panel corners p-6">
            <p className="label mb-4">SYSTEMS BREACHED</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={28} className="text-success" />
                <div>
                  <div className="font-display text-2xl font-semibold text-cream">
                    {store.networksBreached}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-muted">NETWORKS COMPROMISED</div>
                </div>
              </div>
              <Activity size={20} className="text-amber/60" />
            </div>
            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted">
              <Timer size={12} /> NEXT CLEARANCE AT {Math.min(6, unlockedCount)} OPERATIONS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}