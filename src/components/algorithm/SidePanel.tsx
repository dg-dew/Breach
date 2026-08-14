import type { AlgorithmType } from '@/types'
import { ALGORITHM_META } from '@/algorithms'

interface SidePanelProps {
  algorithm: AlgorithmType
  currentNode: string | null
  currentDistance?: number
  queueSnapshot: Array<{ nodeId: string; priority: number }> | null
  log: string[]
}

export function SidePanel({
  algorithm,
  currentNode,
  currentDistance,
  queueSnapshot,
  log,
}: SidePanelProps) {
  const meta = ALGORITHM_META[algorithm]

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Algorithm */}
      <div className="panel p-5">
        <p className="label mb-2">ALGORITHM</p>
        <p className="font-display text-lg font-semibold text-amber">{meta.name}</p>
        <div className="mt-2 flex gap-4 font-mono text-[10px] tracking-widest text-muted">
          <span>O<span className="text-cream">{meta.time.replace('O', '')}</span></span>
          <span>SPACE <span className="text-cream">{meta.space}</span></span>
        </div>
      </div>

      {/* Current node */}
      <div className="panel p-5">
        <p className="label mb-2">CURRENT NODE</p>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-semibold text-cream">
            {currentNode ?? '—'}
          </span>
          {currentDistance !== undefined && (
            <span className="font-mono text-sm text-amber">DIST {currentDistance}</span>
          )}
        </div>
      </div>

      {/* Priority queue */}
      {queueSnapshot && queueSnapshot.length > 0 && (
        <div className="panel p-5">
          <p className="label mb-3">PRIORITY QUEUE</p>
          <div className="space-y-1 font-mono text-xs">
            {queueSnapshot.slice(0, 8).map((e, i) => (
              <div
                key={e.nodeId}
                className={`flex items-center justify-between rounded-sm px-2 py-1 ${
                  i === 0 ? 'bg-amber/10 text-amber' : 'text-muted'
                }`}
              >
                <span className="tracking-widest">{e.nodeId}</span>
                <span>{e.priority === Infinity ? '∞' : e.priority}</span>
              </div>
            ))}
            {queueSnapshot.length > 8 && (
              <div className="px-2 pt-1 text-[10px] text-muted">+{queueSnapshot.length - 8} more</div>
            )}
          </div>
        </div>
      )}

      {/* Execution log */}
      <div className="panel flex min-h-0 flex-1 flex-col">
        <p className="label border-b border-white/5 px-5 py-3">EXECUTION LOG</p>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 font-mono text-[10px] leading-relaxed">
          {log.length === 0 && <p className="text-muted">Awaiting execution…</p>}
          {log.map((entry, i) => (
            <div
              key={i}
              className={i === log.length - 1 ? 'text-amber' : 'text-muted'}
            >
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}