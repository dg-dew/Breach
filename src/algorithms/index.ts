import type { AlgorithmResult, AlgorithmStep, AlgorithmType } from '@/types'
import { Graph } from '@/data-structures/Graph'
import { PriorityQueue } from '@/data-structures/PriorityQueue'
import { bfs } from './bfs'
import { dfs } from './dfs'
import { dijkstra } from './dijkstra'
import { prim } from './prim'
import { kruskal } from './kruskal'

export { bfs, dfs, dijkstra, prim, kruskal, PriorityQueue }

export const ALGORITHM_META: Record<
  AlgorithmType,
  { name: string; time: string; space: string; description: string }
> = {
  BFS: {
    name: 'BREADTH-FIRST SEARCH',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Explores the network level-by-level, guaranteeing the fewest hops to any target.',
  },
  DFS: {
    name: 'DEPTH-FIRST SEARCH',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Plunges deep down one route before backtracking — good for exploring whole branches.',
  },
  DIJKSTRA: {
    name: "DIJKSTRA'S ALGORITHM",
    time: 'O((V + E) log V)',
    space: 'O(V)',
    description: 'Uses a priority queue to always expand the lowest-cost node, guaranteeing the minimum-cost path.',
  },
  PRIM: {
    name: "PRIM'S ALGORITHM",
    time: 'O(E log V)',
    space: 'O(V)',
    description: 'Grows a minimum spanning tree by always adding the cheapest edge that connects to new territory.',
  },
  KRUSKAL: {
    name: "KRUSKAL'S ALGORITHM",
    time: 'O(E log E)',
    space: 'O(V)',
    description: 'Sorts every edge by cost and adds the cheapest that never creates a cycle.',
  },
  PRIORITY_QUEUE: {
    name: 'PRIORITY QUEUE BREACH',
    time: 'O((V + E) log V)',
    space: 'O(V)',
    description: 'A greedy prioritized traversal — process the most valuable node first using a min-heap.',
  },
}

/** Run any registered algorithm against a graph. */
export function runAlgorithm(
  algorithm: AlgorithmType,
  graph: Graph,
  start: string,
  target?: string,
): AlgorithmResult {
  switch (algorithm) {
    case 'BFS':
      return bfs(graph, start, target)
    case 'DFS':
      return dfs(graph, start, target)
    case 'DIJKSTRA':
      return dijkstra(graph, start, target)
    case 'PRIM':
      return prim(graph, start)
    case 'KRUSKAL':
      return kruskal(graph)
    case 'PRIORITY_QUEUE':
      return priorityQueueBreach(graph, start, target)
  }
}

/**
 * "Priority Queue Breach" — a greedy traversal that always expands the node
 * with the smallest combined (distance + threat). Demonstrates a priority
 * queue driving a live decision.
 */
export function priorityQueueBreach(
  graph: Graph,
  start: string,
  target?: string,
  recordSteps = true,
): AlgorithmResult {
  const steps: AlgorithmStep[] = []
  const visited = new Set<string>()
  const predecessors: Record<string, string | null> = {}
  const pq = new PriorityQueue<string>()
  const cost: Record<string, number> = {}
  const visitOrder: string[] = []

  const record = (step: AlgorithmStep) => {
    if (recordSteps) steps.push(step)
  }

  for (const id of graph.ids) cost[id] = id === start ? 0 : Infinity
  pq.push(start, 0)
  record({ type: 'init', message: `Priority breach. Source ${start} = 0` })

  while (!pq.isEmpty) {
    const current = pq.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    visitOrder.push(current)
    record({
      type: 'dequeue',
      nodeId: current,
      distance: cost[current],
      message: `Pop highest priority: ${current}`,
    })
    record({ type: 'visit', nodeId: current, message: `Breaching ${current}` })
    if (target && current === target) {
      record({ type: 'discovered', nodeId: current, message: `TARGET ${current} breached` })
      break
    }
    for (const edge of graph.neighbors(current)) {
      const next = edge.source === current ? edge.target : edge.source
      if (visited.has(next) || edge.blocked) continue
      const candidate = cost[current] + edge.weight + edge.risk
      if (candidate < cost[next]) {
        cost[next] = candidate
        predecessors[next] = current
        pq.decreaseKey(next, candidate)
        record({
          type: 'update',
          nodeId: next,
          distance: candidate,
          message: `Reprioritized ${next} → ${candidate}`,
        })
      }
    }
  }

  const path = target ? reconstructPath(predecessors, start, target) : []
  if (path.length) {
    record({ type: 'complete-path', message: `Priority route: ${path.join(' → ')}` })
  }

  return {
    path,
    pathCost: target ? cost[target] ?? 0 : 0,
    nodesVisited: visitOrder,
    totalVisits: visitOrder.length,
    steps,
    priorityQueueSnapshot: pq.toArray().map((e) => ({ nodeId: e.item, priority: e.priority })),
    message: 'Priority queue breach always attacks the most urgent node first.',
  }
}

function reconstructPath(
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