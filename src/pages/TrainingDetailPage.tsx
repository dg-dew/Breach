import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ALGORITHM_META } from '@/algorithms'
import { TRAINING } from '@/game/training/trainingData'
import { InteractiveDemo } from '@/components/training/InteractiveDemo'

const ALGO_BY_KEY: Record<string, keyof typeof TRAINING> = {
  bfs: 'BFS',
  dfs: 'DFS',
  dijkstra: 'DIJKSTRA',
  prim: 'PRIM',
  kruskal: 'KRUSKAL',
  priority_queue: 'PRIORITY_QUEUE',
  'priority-queue': 'PRIORITY_QUEUE',
  pq: 'PRIORITY_QUEUE',
}

export function TrainingDetailPage() {
  const { algorithm } = useParams()
  const navigate = useNavigate()
  const key = ALGO_BY_KEY[algorithm ?? ''] ?? 'BFS'
  const content = TRAINING[key]
  const meta = ALGORITHM_META[key]

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
      <button
        onClick={() => navigate('/training')}
        className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted transition-colors hover:text-amber"
      >
        <ArrowLeft size={14} /> ALL DOCTRINE
      </button>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold tracking-[0.2em] text-amber">{key}</span>
              <span className="font-mono text-[10px] tracking-widest text-muted">
                {meta.time} · {meta.space} SPACE
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-cream">{content.title}</h1>
            <p className="mt-2 font-mono text-sm text-amber">{content.tagline}</p>
            <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted">
              {content.interactiveDescription}
            </p>
          </div>

          <InteractiveDemo algorithm={key} />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="panel p-6">
              <p className="label mb-3">ANALOGY</p>
              <p className="font-mono text-xs leading-relaxed text-muted">{content.analogy}</p>
            </div>
            <div className="panel p-6">
              <p className="label mb-3">PRACTICAL APPLICATION</p>
              <p className="font-mono text-xs leading-relaxed text-muted">{content.application}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel corners overflow-hidden">
            <p className="label border-b border-white/5 px-5 py-3">PSEUDOCODE</p>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-cream/80">
              {content.pseudocode.join('\n')}
            </pre>
          </div>

          <div className="panel corners p-6">
            <p className="label mb-4">COMPLEXITY</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label">TIME</p>
                <p className="mt-1 font-display text-xl font-semibold text-amber">{meta.time}</p>
              </div>
              <div>
                <p className="label">SPACE</p>
                <p className="mt-1 font-display text-xl font-semibold text-amber">{meta.space}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}