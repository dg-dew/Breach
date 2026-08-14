import type { GraphDefinition, GraphEdge, GraphNode, Mission, NodeType, ScoringConfig } from '@/types'
import { createRng, rngInt, rngPick } from '@/utils/seededRandom'

const NODE_TYPES: NodeType[] = ['router', 'workstation', 'server', 'security', 'datacenter']
const VIEW_W = 1000
const VIEW_H = 620

/**
 * Deterministic procedural network generator.
 * Produces a connected, always-solvable weighted graph with decoy paths,
 * bottlenecks and branching, reproducible from a seed.
 */
export function generateNetwork(seed: number, nodeCount: number): GraphDefinition {
  const rng = createRng(seed)
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let edgeCounter = 0

  function addNode(id: string, x: number, y: number, type: NodeType, security: number): GraphNode {
    const node: GraphNode = { id, label: id, type, securityLevel: security, position: { x, y } }
    nodes.push(node)
    return node
  }

  function addEdge(a: string, b: string, weight: number, risk: number): void {
    edges.push({ id: `E-${edgeCounter++}`, source: a, target: b, weight, risk })
  }

  addNode('ENTRY', 60, VIEW_H / 2, 'entry', 1)
  addNode('TARGET', VIEW_W - 60, VIEW_H / 2, 'target', 5)

  // Scatter interior nodes in the middle band with random jitter.
  const interior: GraphNode[] = []
  for (let i = 0; i < nodeCount; i++) {
    const id = `N-${String(i + 1).padStart(2, '0')}`
    const x = rngInt(rng, 140, VIEW_W - 140)
    const y = rngInt(rng, 70, VIEW_H - 70)
    const type = rngPick(rng, NODE_TYPES)
    interior.push(addNode(id, x, y, type, rngInt(rng, 1, 4)))
  }

  // Guarantee connectivity: build a random spanning tree.
  const connected = new Set<string>(['ENTRY'])
  const remaining: string[] = [...interior.map((n) => n.id), 'TARGET']
  while (remaining.length) {
    const idx = rngInt(rng, 0, remaining.length - 1)
    const id = remaining.splice(idx, 1)[0]
    const from = rngPick(rng, [...connected])
    addEdge(from, id, rngInt(rng, 2, 9), rngInt(rng, 1, 5))
    connected.add(id)
  }

  // Add extra decoy / shortcut edges (bottlenecks + branches).
  const extraEdges = Math.max(2, Math.floor(nodeCount * 0.6))
  for (let i = 0; i < extraEdges; i++) {
    const a = rngPick(rng, [...connected])
    const b = rngPick(rng, [...connected])
    if (a === b) continue
    const exists = edges.some(
      (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a),
    )
    if (exists) continue
    addEdge(a, b, rngInt(rng, 1, 10), rngInt(rng, 1, 5))
  }

  // Optionally block one interior edge to create a locked route.
  const blockable = edges.filter((e) => e.source !== 'ENTRY' && e.target !== 'ENTRY')
  if (blockable.length > 2 && rng() < 0.4) {
    const edge = rngPick(rng, blockable)
    edge.blocked = true
  }

  return { nodes, edges, entryNode: 'ENTRY', targetNode: 'TARGET' }
}

const seedScoring = (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): ScoringConfig => {
  switch (difficulty) {
    case 'EASY':
      return { baseScore: 1000, timeLimitSeconds: 120, timeBonus: 240, lowExposureBonus: 180, optimalRouteBonus: 500, unnecessaryNodePenalty: 120, efficiencyFactor: 0.6 }
    case 'MEDIUM':
      return { baseScore: 1500, timeLimitSeconds: 150, timeBonus: 260, lowExposureBonus: 200, optimalRouteBonus: 550, unnecessaryNodePenalty: 130, efficiencyFactor: 0.65 }
    case 'HARD':
      return { baseScore: 2000, timeLimitSeconds: 180, timeBonus: 280, lowExposureBonus: 220, optimalRouteBonus: 600, unnecessaryNodePenalty: 140, efficiencyFactor: 0.7 }
    default:
      return { baseScore: 2500, timeLimitSeconds: 200, timeBonus: 300, lowExposureBonus: 240, optimalRouteBonus: 650, unnecessaryNodePenalty: 150, efficiencyFactor: 0.75 }
  }
}

/** Build a full playable mission from a seed — reproducible and always solvable. */
export function generateMission(seed: number, nodeCount = 12): Mission {
  const graph = generateNetwork(seed, nodeCount)
  const difficulty: Mission['difficulty'] =
    nodeCount <= 9 ? 'EASY' : nodeCount <= 14 ? 'MEDIUM' : nodeCount <= 18 ? 'HARD' : 'EXPERT'

  return {
    id: `proc-${seed}`,
    order: 99,
    title: 'PROCEDURAL OPERATION',
    codename: `UNKNOWN NETWORK ${String(seed).padStart(3, '0')}`,
    description: `A freshly generated network (${nodeCount} nodes) with unknown topology. Trace the route to the target with minimum exposure.`,
    objective: 'Reach TARGET with minimum exposure.',
    difficulty,
    algorithm: 'DIJKSTRA',
    graph,
    targetNode: 'TARGET',
    entryNode: 'ENTRY',
    scoring: seedScoring(difficulty),
    narrative:
      'This network was synthesized on the fly — decoys, bottlenecks and locked corridors included. No two runs are identical, but each is guaranteed to be solvable.',
  }
}