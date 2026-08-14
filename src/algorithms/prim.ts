import type { AlgorithmResult, AlgorithmStep } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { PriorityQueue } from '@/data-structures/PriorityQueue'

/**
 * Prim's Algorithm — grows a Minimum Spanning Tree from a seed node by
 * repeatedly adding the cheapest edge that connects the tree to a new node.
 */
export function prim(
  graph: Graph,
  start: string,
  recordSteps = true,
): AlgorithmResult {
  const steps: AlgorithmStep[] = []
  const inTree = new Set<string>()
  const selectedEdges: string[] = []
  let totalCost = 0
  let totalVisits = 0

  const record = (step: AlgorithmStep) => {
    if (recordSteps) steps.push(step)
  }

  if (graph.nodeCount === 0) {
    return {
      path: [],
      pathCost: 0,
      nodesVisited: [],
      totalVisits: 0,
      steps,
      edgesSelected: [],
      message: 'Empty network.',
    }
  }

  const pq = new PriorityQueue<{ node: string; edgeId: string | null; weight: number }>()

  record({ type: 'init', message: `Prim's algorithm seeded at ${start}` })
  inTree.add(start)
  totalVisits++

  for (const edge of graph.neighbors(start)) {
    const next = edge.source === start ? edge.target : edge.source
    if (edge.blocked) continue
    pq.push({ node: next, edgeId: edge.id, weight: edge.weight }, edge.weight)
    record({ type: 'enqueue', nodeId: next, message: `Queue edge ${edge.id} (${edge.weight})` })
  }

  while (!pq.isEmpty && inTree.size < graph.nodeCount) {
    const entry = pq.pop()!
    totalVisits++
    if (inTree.has(entry.node)) {
      record({
        type: 'reject-edge',
        edgeId: entry.edgeId ?? undefined,
        message: `${entry.node} already in tree`,
      })
      continue
    }
    inTree.add(entry.node)
    if (entry.edgeId) {
      selectedEdges.push(entry.edgeId)
      totalCost += entry.weight
      record({
        type: 'select-edge',
        edgeId: entry.edgeId,
        message: `Added ${entry.edgeId} (${entry.weight}) → tree cost ${totalCost}`,
      })
    }
    for (const edge of graph.neighbors(entry.node)) {
      const next = edge.source === entry.node ? edge.target : edge.source
      if (inTree.has(next) || edge.blocked) continue
      pq.push({ node: next, edgeId: edge.id, weight: edge.weight }, edge.weight)
      record({ type: 'enqueue', nodeId: next, message: `Queue edge ${edge.id} (${edge.weight})` })
    }
  }

  record({
    type: 'complete-path',
    message: `Spanning tree complete. Total cost ${totalCost} (${selectedEdges.length} edges)`,
  })

  return {
    path: [...inTree],
    pathCost: totalCost,
    nodesVisited: [...inTree],
    totalVisits,
    steps,
    edgesSelected: selectedEdges,
    message: 'Prim grows the tree by always adding the cheapest connecting edge.',
  }
}