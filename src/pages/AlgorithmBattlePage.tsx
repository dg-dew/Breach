import { useMemo, useState } from 'react'
import type { AlgorithmResult, GraphDefinition } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { runAlgorithm } from '@/algorithms'
import { GraphCanvasMemo } from '@/components/graph/GraphCanvas'
import { usePlayback } from '@/hooks/usePlayback'
import { PlaybackControlsBar } from '@/components/algorithm/PlaybackControls'

const BATTLE_GRAPH: GraphDefinition = {
  nodes: [
    { id: 'S', label: 'S', type: 'entry', securityLevel: 1, position: { x: 80, y: 310 } },
    { id: 'A', label: 'A', type: 'router', securityLevel: 2, position: { x: 250, y: 100 } },
    { id: 'B', label: 'B', type: 'router', securityLevel: 2, position: { x: 250, y: 310 } },
    { id: 'C', label: 'C', type: 'router', securityLevel: 2, position: { x: 250, y: 520 } },
    { id: 'D', label: 'D', type: 'workstation', securityLevel: 3, position: { x: 450, y: 90 } },
    { id: 'E', label: 'E', type: 'workstation', securityLevel: 3, position: { x: 450, y: 250 } },
    { id: 'F', label: 'F', type: 'workstation', securityLevel: 3, position: { x: 450, y: 400 } },
    { id: 'G', label: 'G', type: 'workstation', securityLevel: 3, position: { x: 450, y: 550 } },
    { id: 'H', label: 'H', type: 'router', securityLevel: 3, position: { x: 650, y: 200 } },
    { id: 'I', label: 'I', type: 'router', securityLevel: 3, position: { x: 650, y: 420 } },
    { id: 'T', label: 'T', type: 'target', securityLevel: 4, position: { x: 850, y: 310 } },
  ],
  edges: [
    { id: 'b1', source: 'S', target: 'A', weight: 4, risk: 2 },
    { id: 'b2', source: 'S', target: 'B', weight: 2, risk: 1 },
    { id: 'b3', source: 'S', target: 'C', weight: 6, risk: 3 },
    { id: 'b4', source: 'A', target: 'D', weight: 3, risk: 2 },
    { id: 'b5', source: 'A', target: 'E', weight: 5, risk: 2 },
    { id: 'b6', source: 'B', target: 'E', weight: 2, risk: 1 },
    { id: 'b7', source: 'B', target: 'F', weight: 4, risk: 2 },
    { id: 'b8', source: 'C', target: 'F', weight: 3, risk: 2 },
    { id: 'b9', source: 'C', target: 'G', weight: 5, risk: 2 },
    { id: 'b10', source: 'D', target: 'H', weight: 4, risk: 2 },
    { id: 'b11', source: 'E', target: 'H', weight: 2, risk: 1 },
    { id: 'b12', source: 'F', target: 'I', weight: 3, risk: 2 },
    { id: 'b13', source: 'G', target: 'I', weight: 4, risk: 2 },
    { id: 'b14', source: 'H', target: 'T', weight: 6, risk: 3 },
    { id: 'b15', source: 'I', target: 'T', weight: 3, risk: 2 },
    { id: 'b16', source: 'A', target: 'B', weight: 3, risk: 2 },
    { id: 'b17', source: 'C', target: 'B', weight: 5, risk: 2 },
    { id: 'b18', source: 'D', target: 'E', weight: 6, risk: 3 },
  ],
}

const CONTENDERS: Array<{ key: 'BFS' | 'DFS' | 'DIJKSTRA'; label: string }> = [
  { key: 'BFS', label: 'BREADTH-FIRST' },
  { key: 'DFS', label: 'DEPTH-FIRST' },
  { key: 'DIJKSTRA', label: 'DIJKSTRA' },
]

export function AlgorithmBattlePage() {
  const [view, setView] = useState<'BFS' | 'DFS' | 'DIJKSTRA'>('BFS')
  const graph = useMemo(() => new Graph(BATTLE_GRAPH), [])

  const results = useMemo<Record<'BFS' | 'DFS' | 'DIJKSTRA', AlgorithmResult>>(() => {
    return {
      BFS: runAlgorithm('BFS', graph, 'S', 'T'),
      DFS: runAlgorithm('DFS', graph, 'S', 'T'),
      DIJKSTRA: runAlgorithm('DIJKSTRA', graph, 'S', 'T'),
    }
  }, [graph])

  const current = results[view]
  const playback = usePlayback(current, BATTLE_GRAPH.edges, 1.2)

  const optCost = results.DIJKSTRA.pathCost

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
      <div className="mb-8">
        <p className="label mb-2">ALGORITHM BATTLE</p>
        <h1 className="font-display text-4xl font-semibold text-cream">Same Network. Three Strategies.</h1>
        <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-muted">
          Watch BFS, DFS and Dijkstra race to the same target on an identical network.
          The comparison reveals why algorithm choice matters.
        </p>
      </div>

      {/* Comparison table */}
      <div className="panel corners mb-6 overflow-hidden">
        <div className="grid grid-cols-4 border-b border-white/5 bg-bg-deep/40 font-mono text-[10px] tracking-widest text-muted">
          <div className="px-5 py-3">METRIC</div>
          {CONTENDERS.map((c) => (
            <div key={c.key} className="px-5 py-3">{c.label}</div>
          ))}
        </div>
        {[
          { label: 'PATH', get: (r: AlgorithmResult) => r.path.join(' → ') || '—' },
          { label: 'PATH COST', get: (r: AlgorithmResult) => (r.pathCost === 0 ? '—' : String(r.pathCost)) },
          { label: 'NODES VISITED', get: (r: AlgorithmResult) => String(r.totalVisits) },
          { label: 'EXECUTION STEPS', get: (r: AlgorithmResult) => String(r.steps.length) },
          { label: 'OPTIMAL?', get: (r: AlgorithmResult) => (r.pathCost > 0 && r.pathCost === optCost ? 'YES' : 'NO') },
        ].map((row) => (
          <div key={row.label} className="grid grid-cols-4 border-b border-white/5 font-mono text-xs">
            <div className="px-5 py-3 text-muted">{row.label}</div>
            {CONTENDERS.map((c) => {
              const r = results[c.key]
              const best = row.label === 'PATH COST' && r.pathCost === optCost && optCost > 0
              const worst = row.label === 'NODES VISITED' && r.totalVisits === Math.max(...Object.values(results).map((x) => x.totalVisits))
              return (
                <div key={c.key} className={`px-5 py-3 ${best ? 'text-amber' : worst ? 'text-dangerBright' : 'text-cream'}`}>
                  {row.get(r)}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Visualize */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel corners relative h-[560px] overflow-hidden">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <GraphCanvasMemo
            nodes={BATTLE_GRAPH.nodes}
            edges={BATTLE_GRAPH.edges}
            display={playback.frame?.display ?? emptyDisplay()}
            entryNode="S"
            targetNode="T"
            interactive={false}
            animateEdges
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <PlaybackControlsBar
              controls={playback.controls}
              playing={playback.playing}
              isComplete={playback.isComplete}
            />
            <span className="font-mono text-[10px] tracking-widest text-muted">
              STEP {Math.min(playback.index + 1, playback.frames.length)}/{playback.frames.length}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel corners p-5">
            <p className="label mb-3">VIEWING</p>
            <div className="space-y-2">
              {CONTENDERS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setView(c.key)}
                  className={`w-full rounded-sm px-4 py-3 text-left font-mono text-xs tracking-widest transition-colors ${
                    view === c.key
                      ? 'border border-amber/40 bg-amber/10 text-amber'
                      : 'border border-white/10 text-muted hover:text-cream'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel corners p-5">
            <p className="label mb-3">VERDICT</p>
            <p className="font-mono text-xs leading-relaxed text-muted">
              {view === 'BFS'
                ? 'BFS finds the fewest hops but ignores cost — the path exists but can be expensive.'
                : view === 'DFS'
                  ? 'DFS races deep and fast, but can burn through nodes before reaching the target.'
                  : 'Dijkstra settles each node at its true minimum cost — the optimal route, every time.'}
            </p>
            <div className="mt-3 font-mono text-[10px] text-muted">
              Optimal cost on this network: <span className="text-amber">{optCost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function emptyDisplay() {
  return {
    visited: new Set<string>(),
    active: null,
    queued: [],
    pathNodes: [],
    pathEdges: new Set<string>(),
    selectedEdges: [],
    rejectedEdges: [],
    flashEdge: null,
    distances: {},
  }
}