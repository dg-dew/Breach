import type { AlgorithmResult, AlgorithmStep } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { Stack } from '@/data-structures/Stack'

/**
 * Depth-First Search — plunges as deep as possible down each route before
 * backtracking. Explores a single branch fully before trying another.
 */
export function dfs(
  graph: Graph,
  start: string,
  target?: string,
  recordSteps = true,
): AlgorithmResult {
  const steps: AlgorithmStep[] = []
  const visited = new Set<string>()
  const predecessors: Record<string, string | null> = {}
  const stack = new Stack<string>()

  const record = (step: AlgorithmStep) => {
    if (recordSteps) steps.push(step)
  }

  record({ type: 'init', message: `DFS initialized. Entry at ${start}` })

  stack.push(start)
  record({ type: 'enqueue', nodeId: start, message: `Pushed ${start} onto stack` })

  const visitOrder: string[] = []

  while (!stack.isEmpty) {
    const current = stack.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    visitOrder.push(current)
    record({ type: 'dequeue', nodeId: current, message: `Popped ${current}` })
    record({ type: 'visit', nodeId: current, message: `Visiting ${current}` })

    if (target && current === target) {
      record({ type: 'discovered', nodeId: current, message: `TARGET ${current} discovered` })
      break
    }

    // Push neighbors in reverse so the natural order is explored first.
    const neighbors = graph.neighbors(current)
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const edge = neighbors[i]
      const next = edge.source === current ? edge.target : edge.source
      if (visited.has(next)) continue
      if (edge.blocked) {
        record({ type: 'reject-edge', edgeId: edge.id, message: `${edge.id} blocked` })
        continue
      }
      predecessors[next] = current
      stack.push(next)
      record({ type: 'enqueue', nodeId: next, message: `Pushed ${next} (deep dive)` })
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
    message: 'DFS dives deep down one route before backtracking.',
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
