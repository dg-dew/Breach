import { useMemo, useState } from 'react'
import type { AlgorithmType, GraphEdge, GraphNode } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { runAlgorithm } from '@/algorithms'
import { usePlayback } from '@/hooks/usePlayback'
import { GraphCanvasMemo } from '@/components/graph/GraphCanvas'
import { PlaybackControlsBar } from '@/components/algorithm/PlaybackControls'

const DEMO_NODES: GraphNode[] = [
  { id: 'A', label: 'A', type: 'entry', securityLevel: 1, position: { x: 120, y: 310 } },
  { id: 'B', label: 'B', type: 'router', securityLevel: 2, position: { x: 300, y: 120 } },
  { id: 'C', label: 'C', type: 'router', securityLevel: 2, position: { x: 320, y: 330 } },
  { id: 'D', label: 'D', type: 'router', securityLevel: 2, position: { x: 300, y: 520 } },
  { id: 'E', label: 'E', type: 'workstation', securityLevel: 3, position: { x: 520, y: 90 } },
  { id: 'F', label: 'F', type: 'workstation', securityLevel: 3, position: { x: 540, y: 260 } },
  { id: 'G', label: 'G', type: 'workstation', securityLevel: 3, position: { x: 540, y: 440 } },
  { id: 'H', label: 'H', type: 'workstation', securityLevel: 3, position: { x: 530, y: 580 } },
  { id: 'T', label: 'T', type: 'target', securityLevel: 4, position: { x: 760, y: 310 } },
]

const DEMO_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'A', target: 'B', weight: 4, risk: 2 },
  { id: 'e2', source: 'A', target: 'C', weight: 2, risk: 1 },
  { id: 'e3', source: 'A', target: 'D', weight: 5, risk: 2 },
  { id: 'e4', source: 'B', target: 'E', weight: 3, risk: 2 },
  { id: 'e5', source: 'C', target: 'F', weight: 2, risk: 1 },
  { id: 'e6', source: 'D', target: 'G', weight: 3, risk: 2 },
  { id: 'e7', source: 'D', target: 'H', weight: 4, risk: 3 },
  { id: 'e8', source: 'E', target: 'T', weight: 6, risk: 3 },
  { id: 'e9', source: 'F', target: 'T', weight: 3, risk: 2 },
  { id: 'e10', source: 'G', target: 'T', weight: 5, risk: 2 },
  { id: 'e11', source: 'H', target: 'T', weight: 2, risk: 1 },
  { id: 'e12', source: 'B', target: 'C', weight: 3, risk: 2 },
  { id: 'e13', source: 'E', target: 'F', weight: 4, risk: 2 },
]

export function InteractiveDemo({ algorithm }: { algorithm: AlgorithmType }) {
  const [graph] = useState(() => new Graph({ nodes: DEMO_NODES, edges: DEMO_EDGES }))

  const result = useMemo(() => {
    const isMst = algorithm === 'PRIM' || algorithm === 'KRUSKAL'
    if (isMst) return runAlgorithm(algorithm, graph, 'A')
    return runAlgorithm(algorithm, graph, 'A', 'T')
  }, [algorithm, graph])

  const playback = usePlayback(result, DEMO_EDGES, 1.2)

  const demoLabel = result.message ?? ''

  return (
    <div className="rounded-sm border border-white/5 bg-bg-deep/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-3">
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted">
          INTERACTIVE DEMO · SOURCE A · TARGET T
        </span>
        <PlaybackControlsBar
          controls={playback.controls}
          playing={playback.playing}
          isComplete={playback.isComplete}
        />
      </div>
      <div className="relative h-[360px]">
        <GraphCanvasMemo
          nodes={DEMO_NODES}
          edges={DEMO_EDGES}
          display={playback.frame?.display ?? emptyDisplay()}
          entryNode="A"
          targetNode="T"
          interactive={false}
          animateEdges
        />
      </div>
      <div className="border-t border-white/5 px-5 py-3 font-mono text-xs text-muted">
        <span className="text-amber">STATUS</span> · {demoLabel}
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