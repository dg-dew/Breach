import { useNavigate } from 'react-router-dom'
import { Shield, Activity, Trophy, Zap, RotateCcw } from 'lucide-react'
import { useGameStore, MISSIONS } from '@/store/gameStore'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'
import { ALGORITHM_META } from '@/algorithms'
import { ProgressBar } from '@/components/ui/ProgressBar'

function formatMs(ms: number): string {
  if (!ms) return '—'
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const store = useGameStore()

  const reset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      store.resetProgress()
      navigate('/')
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
      <div className="mb-10">
        <p className="label mb-2">OPERATOR PROFILE</p>
        <h1 className="font-display text-4xl font-semibold text-cream">
          Callsign: <span className="text-amber">GHOST-{String(store.clearanceLevel).padStart(2, '0')}</span>
        </h1>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted">
          CLEARANCE LEVEL {String(store.clearanceLevel).padStart(2, '0')} · ACTIVE OPERATOR
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="TOTAL SCORE" value={store.totalScore.toLocaleString()} accent="amber" sub="LIFETIME" index={0} />
        <StatCard label="OPERATIONS" value={`${store.operationsCompleted} / ${MISSIONS.length}`} accent="green" sub="COMPLETED" index={1} />
        <StatCard label="BEST TIME" value={formatMs(store.bestTime)} sub="FASTEST BREACH" index={2} />
        <StatCard label="NETWORKS BREACHED" value={store.networksBreached} accent="amber" sub="SYSTEMS COMPROMISED" index={3} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="panel corners p-6">
          <p className="label mb-5">MISSION RECORD</p>
          <div className="space-y-4">
            {MISSIONS.map((m) => {
              const completed = store.completedMissions.includes(m.id)
              const score = store.highScores[m.id]
              return (
                <div key={m.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-sm border font-mono text-[10px] ${completed ? 'border-amber/40 bg-amber/10 text-amber' : 'border-white/10 text-muted'}`}>
                      {String(m.order).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-cream">{m.title}</p>
                      <p className="text-[10px] font-mono tracking-widest text-muted">{ALGORITHM_META[m.algorithm].name}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-xs ${completed ? 'text-amber' : 'text-muted'}`}>
                    {score !== undefined ? score.toLocaleString() : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel corners p-5">
            <p className="label mb-4">CLEARANCE STATUS</p>
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-xs text-cream"><Shield size={14} className="text-success" /> LEVEL {store.clearanceLevel}</span>
              <span className="flex items-center gap-2 font-mono text-xs text-amber"><Trophy size={14} /> {store.operationsCompleted} OPS</span>
            </div>
            <ProgressBar value={Math.min(100, (store.operationsCompleted / MISSIONS.length) * 100)} color="amber" />
          </div>

          <div className="panel corners p-5">
            <p className="label mb-4">ACTIVITY</p>
            <div className="flex items-center gap-3 font-mono text-xs text-muted">
              <Activity size={16} className="text-amber" />
              <span>{store.networksBreached} networks compromised</span>
            </div>
            <div className="mt-3 flex items-center gap-3 font-mono text-xs text-muted">
              <Zap size={16} className="text-amber" />
              <span>{store.totalScore} lifetime score</span>
            </div>
          </div>

          <div className="panel corners p-5">
            <p className="label mb-3">DANGER ZONE</p>
            <Button variant="danger" size="sm" onClick={reset} className="w-full">
              <RotateCcw size={13} /> RESET PROGRESS
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}