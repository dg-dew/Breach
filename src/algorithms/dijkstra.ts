import type { AlgorithmResult, AlgorithmStep } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { PriorityQueue } from '@/data-structures/PriorityQueue'

/**
 * Dijkstra's Algorithm — finds the minimum-COST path using a priority queue.
 * This is the core of "low exposure" missions: minimize total traversal cost.
 */
export function dijkstra(
  graph: Graph,
  start: string,
  target?: string,
  recordSteps = true,
): AlgorithmResult {
  const steps: AlgorithmStep[] = []
  const distances: Record<string, number> = {}
  const predecessors: Record<string, string | null> = {}
  const visited = new Set<string>()
  const pq = new PriorityQueue<string>()
  const visitOrder: string[] = []

  const record = (step: AlgorithmStep) => {
    if (recordSteps) steps.push(step)
  }

  const recordWithQueue = (step: AlgorithmStep) => {
    if (!recordSteps) return
    steps.push({
      ...step,
      queueSnapshot: pq.toArray().map((e) => ({ nodeId: e.item, priority: e.priority })),
    })
  }

  for (const id of graph.ids) {
    distances[id] = id === start ? 0 : Infinity
  }

  record({ type: 'init', message: `Dijkstra initialized. Source ${start} = 0` })

  pq.push(start, 0)
  recordWithQueue({
    type: 'enqueue',
    nodeId: start,
    distance: 0,
    message: `Pushed ${start} (0)`,
  })

  while (!pq.isEmpty) {
    const current = pq.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    visitOrder.push(current)
    recordWithQueue({
      type: 'dequeue',
      nodeId: current,
      distance: distances[current],
      message: `Extracted min: ${current} (${distances[current]})`,
    })
    record({ type: 'visit', nodeId: current, message: `Visiting ${current}` })

    if (target && current === target) {
      record({ type: 'discovered', nodeId: current, message: `TARGET ${current} reached at cost ${distances[current]}` })
      break
    }

    for (const edge of graph.neighbors(current)) {
      const next = edge.source === current ? edge.target : edge.source
      if (visited.has(next)) continue
      if (edge.blocked) {
        record({ type: 'reject-edge', edgeId: edge.id, message: `${edge.id} blocked` })
        continue
      }
      const candidate = distances[current] + edge.weight
      record({ type: 'relax', edgeId: edge.id, message: `Inspecting ${edge.id} (${edge.weight}) → ${next}` })
      if (candidate < distances[next]) {
        distances[next] = candidate
        predecessors[next] = current
        pq.decreaseKey(next, candidate)
        recordWithQueue({
          type: 'update',
          nodeId: next,
          distance: candidate,
          message: `Relaxed: ${next} = ${candidate}`,
        })
      } else {
        record({ type: 'reject-edge', edgeId: edge.id, message: `${next} not improved (${candidate} ≥ ${distances[next]})` })
      }
    }
  }

  const path = target ? reconstructPath(predecessors, start, target) : []
  if (path.length) {
    record({
      type: 'complete-path',
      message: `Optimal route: ${path.join(' → ')} (cost ${target ? distances[target] : 0})`,
    })
  }

  return {
    path,
    pathCost: target ? distances[target] ?? 0 : 0,
    nodesVisited: visitOrder,
    totalVisits: visitOrder.length,
    steps,
    distanceMap: distances,
    priorityQueueSnapshot: pq.toArray().map((e) => ({ nodeId: e.item, priority: e.priority })),
    message: 'Dijkstra uses a priority queue to always expand the lowest-cost node.',
  }
}

export function reconstructPath(
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
