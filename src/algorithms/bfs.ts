import type { AlgorithmResult, AlgorithmStep } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { Queue } from '@/data-structures/Queue'

/**
 * Breadth-First Search — explores the network layer by layer (level order),
 * guaranteeing the SHORTEST path in terms of edge count (hops).
 * Returns both the result and the recorded execution steps for replay.
 */
export function bfs(
  graph: Graph,
  start: string,
  target?: string,
  recordSteps = true,
): AlgorithmResult {
  const steps: AlgorithmStep[] = []
  const visited = new Set<string>()
  const predecessors: Record<string, string | null> = {}
  const queue = new Queue<string>()

  const record = (step: AlgorithmStep) => {
    if (recordSteps) steps.push(step)
  }

  record({ type: 'init', message: `BFS initialized. Entry at ${start}` })

  queue.enqueue(start)
  visited.add(start)
  record({ type: 'enqueue', nodeId: start, message: `Queued ENTRY (${start})` })

  const visitOrder: string[] = []

  while (!queue.isEmpty) {
    const current = queue.dequeue()!
    visitOrder.push(current)
    record({ type: 'dequeue', nodeId: current, message: `Dequeued ${current}` })
    record({ type: 'visit', nodeId: current, message: `Visiting ${current}` })

    if (target && current === target) {
      record({ type: 'discovered', nodeId: current, message: `TARGET ${current} discovered` })
      break
    }

    for (const edge of graph.neighbors(current)) {
      const next = edge.source === current ? edge.target : edge.source
      if (visited.has(next)) continue
      if (edge.blocked) {
        record({ type: 'reject-edge', edgeId: edge.id, message: `${edge.id} blocked` })
        continue
      }
      visited.add(next)
      predecessors[next] = current
      queue.enqueue(next)
      record({ type: 'enqueue', nodeId: next, message: `Discovered ${next} via ${edge.id}` })
    }
  }

  const path = target ? reconstructHelper(predecessors, start, target) : []
  if (path.length) {
    record({ type: 'complete-path', message: `Path established: ${path.join(' → ')}` })
  }

  return {
    path,
    pathCost: path.length ? path.length - 1 : 0,
    nodesVisited: visitOrder,
    totalVisits: visitOrder.length,
    steps,
    message: 'BFS explores level-by-level to find the fewest hops.',
  }
}

function reconstructHelper(
  predecessors: Record<string, string | null>,
  start: string,
  end: string,
): string[] {
  const path: string[] = []
  let current: string | null = end
  const guard = new Set<string>()
  while (current !== null && !guard.has(current)) {
    guard.add(current)
    path.unshift(current)
    if (current === start) break
    current = predecessors[current] ?? null
  }
  return path[0] === start ? path : []
}
