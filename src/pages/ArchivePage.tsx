import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, BrainCircuit, GitBranch, Layers, Network } from 'lucide-react'
import { useGameStore, MISSIONS } from '@/store/gameStore'
import { ALGORITHM_META } from '@/algorithms'

const CONCEPTS = [
  { icon: Network, title: 'Weighted Graphs', desc: 'Nodes, edges, and costs — the backbone of every network you infiltrate.', algo: 'CORE' },
  { icon: Layers, title: 'BFS / DFS Traversal', desc: 'Systematic exploration: level-order or depth-first. Each a different risk profile.', algo: 'O(V+E)' },
  { icon: BrainCircuit, title: 'Shortest Path', desc: 'Dijkstra and its priority queue guarantee minimum-cost routes.', algo: 'O((V+E) log V)' },
  { icon: GitBranch, title: 'Minimum Spanning Tree', desc: 'Prim and Kruskal reconnect severed systems at minimum total cost.', algo: 'O(E log V)' },
]

export function ArchivePage() {
  const navigate = useNavigate()
  const store = useGameStore()

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
      <div className="mb-10">
        <p className="label mb-2">INTELLIGENCE ARCHIVE</p>
        <h1 className="font-display text-4xl font-semibold text-cream">Field Records</h1>
        <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted">
          Completed operations and the data structures behind them — your permanent DSA field manual.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completed missions */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-cream">Completed Operations</h2>
          <div className="space-y-3">
            {MISSIONS.map((m) => {
              const completed = store.completedMissions.includes(m.id)
              const score = store.highScores[m.id]
              return (
                <button
                  key={m.id}
                  onClick={() => navigate(`/mission/${m.id}`)}
                  className={`panel flex w-full items-center justify-between p-5 text-left transition-colors ${
                    completed ? 'hover:border-amber/25' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {completed ? (
                      <CheckCircle2 size={20} className="text-success" />
                    ) : (
                      <span className="h-5 w-5 rounded-full border border-white/20" />
                    )}
                    <div>
                      <p className="font-display text-sm font-medium text-cream">{m.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-muted">
                        {m.codename} · {ALGORITHM_META[m.algorithm].name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {score !== undefined && (
                      <span className="font-mono text-xs text-amber">{score.toLocaleString()}</span>
                    )}
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Concepts */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-cream">Core Doctrine</h2>
          <div className="space-y-3">
            {CONCEPTS.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.title} className="panel p-5">
                  <div className="flex items-start gap-4">
                    <Icon size={22} className="mt-0.5 shrink-0 text-amber" />
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-sm font-medium text-cream">{c.title}</h3>
                        <span className="rounded-sm border border-white/10 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-muted">
                          {c.algo}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs leading-relaxed text-muted">{c.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}