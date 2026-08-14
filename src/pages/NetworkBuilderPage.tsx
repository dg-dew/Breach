import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MousePointer2, Plus, Link2, Trash2, Weight, Ban, Crosshair, Play, Download, Upload, Swords } from 'lucide-react'
import type { AlgorithmType, GraphDefinition, GraphEdge, GraphNode } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { runAlgorithm } from '@/algorithms'
import { GraphCanvasMemo } from '@/components/graph/GraphCanvas'
import { usePlayback } from '@/hooks/usePlayback'
import { PlaybackControlsBar } from '@/components/algorithm/PlaybackControls'
import { Button } from '@/components/ui/Button'

type Tool = 'select' | 'add' | 'connect' | 'delete' | 'weight' | 'block' | 'target'

const TOOLS: Array<{ id: Tool; label: string; icon: typeof Plus }> = [
  { id: 'select', label: 'SELECT', icon: MousePointer2 },
  { id: 'add', label: 'ADD NODE', icon: Plus },
  { id: 'connect', label: 'CONNECT', icon: Link2 },
  { id: 'weight', label: 'WEIGHT', icon: Weight },
  { id: 'block', label: 'BLOCK', icon: Ban },
  { id: 'delete', label: 'DELETE', icon: Trash2 },
  { id: 'target', label: 'TARGET', icon: Crosshair },
]

const ALGOS: AlgorithmType[] = ['BFS', 'DFS', 'DIJKSTRA', 'PRIM', 'KRUSKAL']

let counter = 100

export function NetworkBuilderPage() {
  const navigate = useNavigate()
  const [def, setDef] = useState<GraphDefinition>({
    nodes: [
      { id: 'ENTRY', label: 'ENTRY', type: 'entry', securityLevel: 1, position: { x: 150, y: 310 } },
      { id: 'A', label: 'A', type: 'router', securityLevel: 2, position: { x: 350, y: 180 } },
      { id: 'B', label: 'B', type: 'router', securityLevel: 2, position: { x: 380, y: 430 } },
      { id: 'C', label: 'C', type: 'workstation', securityLevel: 3, position: { x: 600, y: 250 } },
      { id: 'D', label: 'D', type: 'workstation', securityLevel: 3, position: { x: 800, y: 400 } },
    ],
    edges: [
      { id: 'w1', source: 'ENTRY', target: 'A', weight: 3, risk: 2 },
      { id: 'w2', source: 'ENTRY', target: 'B', weight: 5, risk: 2 },
      { id: 'w3', source: 'A', target: 'B', weight: 2, risk: 1 },
      { id: 'w4', source: 'A', target: 'C', weight: 4, risk: 2 },
      { id: 'w5', source: 'B', target: 'C', weight: 3, risk: 2 },
      { id: 'w6', source: 'C', target: 'D', weight: 2, risk: 1 },
    ],
    entryNode: 'ENTRY',
    targetNode: 'D',
  })

  const [tool, setTool] = useState<Tool>('select')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('DIJKSTRA')
  const [edgeWeight, setEdgeWeight] = useState(3)
  const [pendingConnect, setPendingConnect] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const graph = useMemo(() => new Graph(def), [def])
  const entry = def.entryNode ?? def.nodes[0]?.id ?? 'ENTRY'
  const target = def.targetNode

  const result = useMemo(() => {
    if (!graph || graph.nodeCount === 0) return null
    if (algorithm === 'PRIM' || algorithm === 'KRUSKAL') return runAlgorithm(algorithm, graph, entry)
    return runAlgorithm(algorithm, graph, entry, target)
  }, [graph, algorithm, entry, target])

  const playback = usePlayback(result, def.edges, 1.1)

  const handleNodeClick = useCallback(
    (id: string) => {
      setSelectedEdge(null)
      setSelectedNode(id)
      const node = def.nodes.find((n) => n.id === id)
      if (!node) return

      switch (tool) {
        case 'delete':
          setDef((d) => ({
            ...d,
            nodes: d.nodes.filter((n) => n.id !== id),
            edges: d.edges.filter((e) => e.source !== id && e.target !== id),
            targetNode: d.targetNode === id ? undefined : d.targetNode,
            entryNode: d.entryNode === id ? undefined : d.entryNode,
          }))
          setSelectedNode(null)
          break
        case 'target':
          setDef((d) => ({ ...d, targetNode: id }))
          break
        case 'connect':
          if (pendingConnect === null) {
            setPendingConnect(id)
          } else if (pendingConnect !== id) {
            const exists = def.edges.some(
              (e) =>
                (e.source === pendingConnect && e.target === id) ||
                (e.source === id && e.target === pendingConnect),
            )
            if (!exists) {
              const newEdge: GraphEdge = {
                id: `w${counter++}`,
                source: pendingConnect,
                target: id,
                weight: edgeWeight,
                risk: 2,
              }
              setDef((d) => ({ ...d, edges: [...d.edges, newEdge] }))
            }
            setPendingConnect(null)
          }
          break
        default:
          break
      }
    },
    [tool, pendingConnect, def.edges, edgeWeight],
  )

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setDef((d) => ({
      ...d,
      nodes: d.nodes.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
    }))
  }, [])

  const handleEdgeClick = useCallback(
    (id: string) => {
      setSelectedNode(null)
      setSelectedEdge(id)
      const edge = def.edges.find((e) => e.id === id)
      if (!edge) return
      switch (tool) {
        case 'delete':
          setDef((d) => ({ ...d, edges: d.edges.filter((e) => e.id !== id) }))
          setSelectedEdge(null)
          break
        case 'block':
          setDef((d) => ({
            ...d,
            edges: d.edges.map((e) => (e.id === id ? { ...e, blocked: !e.blocked } : e)),
          }))
          break
        case 'weight':
          setEdgeWeight(edge.weight)
          break
        default:
          break
      }
    },
    [tool, def.edges],
  )

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
    setPendingConnect(null)
    if (tool === 'add') {
      // Add a node at a semi-random free position
      const id = `N${counter++}`
      const x = 120 + Math.round(Math.random() * 740)
      const y = 80 + Math.round(Math.random() * 440)
      const node: GraphNode = {
        id,
        label: id,
        type: 'router',
        securityLevel: 2,
        position: { x, y },
      }
      setDef((d) => ({ ...d, nodes: [...d.nodes, node] }))
      setSelectedNode(id)
    }
  }, [tool])

  const handleAddNodeButton = () => {
    const id = `N${counter++}`
    const x = 120 + Math.round(Math.random() * 740)
    const y = 80 + Math.round(Math.random() * 440)
    setDef((d) => ({
      ...d,
      nodes: [...d.nodes, { id, label: id, type: 'router', securityLevel: 2, position: { x, y } }],
    }))
  }

  const applyWeight = () => {
    if (selectedEdge) {
      setDef((d) => ({
        ...d,
        edges: d.edges.map((e) => (e.id === selectedEdge ? { ...e, weight: edgeWeight } : e)),
      }))
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'breach-network.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as GraphDefinition
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setDef(parsed)
        }
      } catch {
        // ignore invalid json
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-[1700px] px-4 py-8 lg:px-8">
      <div className="mb-6">
        <p className="label mb-2">NETWORK LABORATORY</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold text-cream">Network Builder</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/battle')}>
            <Swords size={14} /> ALGORITHM BATTLE
          </Button>
        </div>
        <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-muted">
          Construct your own weighted network, then run any algorithm against it.
          Drag nodes to arrange the topology.
        </p>
      </div>

      {/* Toolbar */}
      <div className="panel corners mb-4 flex flex-wrap items-center gap-2 p-3">
        {TOOLS.map((t) => {
          const Icon = t.icon
          const active = tool === t.id
          return (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id)
                setPendingConnect(null)
              }}
              className={`inline-flex items-center gap-2 rounded-sm px-3 py-2 font-mono text-[10px] tracking-[0.15em] transition-colors ${
                active
                  ? 'border border-amber/40 bg-amber/10 text-amber'
                  : 'border border-white/10 text-muted hover:text-cream'
              }`}
              aria-pressed={active}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}

        <div className="mx-2 h-6 w-px bg-white/10" />

        {selectedEdge && tool === 'weight' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={20}
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(Number(e.target.value))}
              className="w-16 rounded-sm border border-white/10 bg-bg-deep px-2 py-1 font-mono text-xs text-cream"
              aria-label="Edge weight"
            />
            <Button size="sm" variant="outline" onClick={applyWeight}>APPLY</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
            {pendingConnect
              ? `CONNECTING FROM ${pendingConnect} — click a second node`
              : tool === 'connect'
                ? 'CLICK TWO NODES TO LINK'
                : tool === 'weight'
                  ? 'SELECT AN EDGE TO EDIT WEIGHT'
                  : 'SELECT / DRAG TO MANIPULATE'}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleAddNodeButton}>
            <Plus size={13} /> NODE
          </Button>
          <Button size="sm" variant="ghost" onClick={exportJson}>
            <Download size={13} /> EXPORT
          </Button>
          <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> IMPORT
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importJson(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Graph */}
        <div className="panel corners relative h-[600px] overflow-hidden">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <GraphCanvasMemo
            nodes={def.nodes}
            edges={def.edges}
            display={playback.frame?.display ?? emptyDisplay()}
            entryNode={entry}
            targetNode={target}
            mode="build"
            selectedNodeId={selectedNode}
            selectedEdgeId={selectedEdge}
            onNodeClick={handleNodeClick}
            onNodeMove={handleNodeMove}
            onEdgeClick={handleEdgeClick}
            onCanvasClick={handleCanvasClick}
            interactive
            animateEdges
          />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3">
            <PlaybackControlsBar
              controls={playback.controls}
              playing={playback.playing}
              isComplete={playback.isComplete}
            />
            <span className="font-mono text-[10px] tracking-widest text-muted">
              {def.nodes.length} NODES · {def.edges.length} LINKS
            </span>
          </div>
        </div>

        {/* Run panel */}
        <div className="space-y-4">
          <div className="panel corners p-5">
            <p className="label mb-3">RUN ALGORITHM</p>
            <div className="flex flex-wrap gap-2">
              {ALGOS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgorithm(a)}
                  className={`rounded-sm px-3 py-1.5 font-mono text-[10px] tracking-widest transition-colors ${
                    algorithm === a
                      ? 'bg-amber/15 text-amber border border-amber/40'
                      : 'border border-white/10 text-muted hover:text-cream'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="md"
              className="mt-4 w-full"
              onClick={() => playback.controls.restart()}
            >
              <Play size={15} /> RUN {algorithm}
            </Button>
          </div>

          <div className="panel corners p-5">
            <p className="label mb-3">RESULT</p>
            {result ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">TARGET</span>
                  <span className="text-amber">{result.path.length ? result.path[result.path.length - 1] : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">PATH</span>
                  <span className="max-w-[160px] truncate text-cream">{result.path.join(' → ') || 'no route'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">COST</span>
                  <span className="text-cream">{result.pathCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">NODES VISITED</span>
                  <span className="text-cream">{result.totalVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">STEPS</span>
                  <span className="text-cream">{result.steps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">MST EDGES</span>
                  <span className="text-cream">{result.edgesSelected?.length ?? '—'}</span>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-muted">Build a network to run analysis.</p>
            )}
          </div>

          {selectedEdge && (
            <div className="panel p-4 font-mono text-[10px] leading-relaxed text-muted">
              EDGE {selectedEdge} · W {def.edges.find((e) => e.id === selectedEdge)?.weight} ·{' '}
              {def.edges.find((e) => e.id === selectedEdge)?.blocked ? 'BLOCKED' : 'OPEN'}
            </div>
          )}
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