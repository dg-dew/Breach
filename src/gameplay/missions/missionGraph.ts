import type { Difficulty, GraphDefinition, GraphEdge, GraphNode, NodeType } from '@/types'
import { createRng, rngInt, rngPick } from '@/utils/seededRandom'

const VIEW_W = 1000
const VIEW_H = 620

const INTERIOR_TYPES: NodeType[] = ['router', 'database', 'server', 'gate', 'archive', 'control']

/**
 * Deterministic cyber-infrastructure graph generator.
 * Guarantees: connected, solvable, weighted, risk-tagged, with decoys,
 * gates and a hidden exit node. Reproducible from a seed.
 */
export interface MissionGraphOptions {
  seed: number
  nodeCount: number
  decoyCount: number
  gateCount: number
  entryId?: string
  targetId?: string
  exitId?: string
  riskCeiling: number
}

export function generateMissionGraph(opts: MissionGraphOptions): GraphDefinition {
  const rng = createRng(opts.seed)
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let edgeCounter = 0

  const entryId = opts.entryId ?? 'ENTRY'
  const targetId = opts.targetId ?? 'TARGET'
  const exitId = opts.exitId ?? 'EXIT'

  function addNode(id: string, x: number, y: number, type: NodeType, security: number): GraphNode {
    const node: GraphNode = { id, label: id, type, securityLevel: security, position: { x, y } }
    nodes.push(node)
    return node
  }

  function addEdge(a: string, b: string, weight: number, risk: number, blocked = false): void {
    if (edges.some((e) => (e.source === a && e.target === b) || (e.source === b && e.target === a))) {
      return
    }
    edges.push({ id: `E-${edgeCounter++}`, source: a, target: b, weight, risk, blocked })
  }

  // Entry on the left, target on the right, exit tucked at a corner.
  addNode(entryId, 60, VIEW_H / 2, 'entry', 1)
  addNode(targetId, VIEW_W - 60, VIEW_H / 2, 'target', 5)
  addNode(exitId, VIEW_W - 120, 80, 'exit', 1)

  // Interior nodes.
  const interior: GraphNode[] = []
  for (let i = 0; i < opts.nodeCount; i++) {
    const id = `N-${String(i + 1).padStart(2, '0')}`
    const x = rngInt(rng, 140, VIEW_W - 140)
    const y = rngInt(rng, 80, VIEW_H - 80)
    let type = rngPick(rng, INTERIOR_TYPES)
    if (i < opts.decoyCount) type = 'decoy'
    else if (i < opts.decoyCount + opts.gateCount) type = 'gate'
    interior.push(addNode(id, x, y, type, rngInt(rng, 1, 4)))
  }

  // Guaranteed connectivity via a random spanning tree.
  const connected = new Set<string>([entryId])
  const remaining: string[] = [...interior.map((n) => n.id), targetId, exitId]
  while (remaining.length) {
    const idx = rngInt(rng, 0, remaining.length - 1)
    const id = remaining.splice(idx, 1)[0]
    const from = rngPick(rng, [...connected])
    const weight = rngInt(rng, 2, 8)
    const risk = rngInt(rng, 1, opts.riskCeiling)
    addEdge(from, id, weight, risk)
    connected.add(id)
  }

  // Extra branches / shortcuts / decoy paths.
  const extra = Math.max(2, Math.floor(opts.nodeCount * 0.65))
  for (let i = 0; i < extra; i++) {
    const a = rngPick(rng, [...connected])
    const b = rngPick(rng, [...connected])
    if (a === b) continue
    addEdge(a, b, rngInt(rng, 1, 9), rngInt(rng, 1, opts.riskCeiling))
  }

  // Occasionally lock one non-entry corridor.
  const blockable = edges.filter(
    (e) => e.source !== entryId && e.target !== entryId && e.source !== exitId && e.target !== exitId,
  )
  if (blockable.length > 2 && rng() < 0.5) {
    rngPick(rng, blockable).blocked = true
  }

  // Tag some decoys with high risk to make them dangerous.
  for (const n of interior) {
    if (n.type === 'decoy') n.securityLevel = rngInt(rng, 3, 5)
  }

  return { nodes, edges, entryNode: entryId, targetNode: targetId, exitNode: exitId }
}

export function difficultyForNodeCount(count: number): Difficulty {
  if (count <= 8) return 'EASY'
  if (count <= 13) return 'MEDIUM'
  if (count <= 18) return 'HARD'
  return 'EXPERT'
}

export function decoyCountFor(count: number, difficulty: Difficulty): number {
  if (difficulty === 'EASY') return Math.max(1, Math.floor(count * 0.15))
  if (difficulty === 'MEDIUM') return Math.max(2, Math.floor(count * 0.25))
  if (difficulty === 'HARD') return Math.max(3, Math.floor(count * 0.35))
  return Math.max(4, Math.floor(count * 0.45))
}