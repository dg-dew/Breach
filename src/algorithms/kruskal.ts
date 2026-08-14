import type { AlgorithmResult, AlgorithmStep } from '@/types'
import { Graph } from '@/data-structures/Graph'

/** Disjoint-set (union-find) helper used by Kruskal. */
class UnionFind {
  private parent = new Map<string, string>()
  private rank = new Map<string, number>()

  make(id: string): void {
    if (!this.parent.has(id)) {
      this.parent.set(id, id)
      this.rank.set(id, 0)
    }
  }

  find(id: string): string {
    this.make(id)
    let root = id
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!
    }
    // Path compression
    let node = id
    while (this.parent.get(node) !== root) {
      const next = this.parent.get(node)!
      this.parent.set(node, root)
      node = next
    }
    return root
  }

  union(a: string, b: string): boolean {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    const rankA = this.rank.get(ra)!
    const rankB = this.rank.get(rb)!
    if (rankA < rankB) {
      this.parent.set(ra, rb)
    } else if (rankA > rankB) {
      this.parent.set(rb, ra)
    } else {
      this.parent.set(rb, ra)
      this.rank.set(ra, rankA + 1)
    }
    return true
  }
}

/**
 * Kruskal's Algorithm — sorts ALL edges by weight, then adds the cheapest
 * edge that does not create a cycle, until every node is connected.
 */
export function kruskal(
  graph: Graph,
  recordSteps = true,
): AlgorithmResult {
  const steps: AlgorithmStep[] = []
  const selectedEdges: string[] = []
  const uf = new UnionFind()
  let totalCost = 0

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

  for (const id of graph.ids) uf.make(id)

  const sorted = [...graph.edges]
    .filter((e) => !e.blocked)
    .sort((a, b) => a.weight - b.weight)

  record({ type: 'init', message: `Kruskal sorted ${sorted.length} edges by weight` })

  for (const edge of sorted) {
    if (selectedEdges.length === graph.nodeCount - 1) break
    if (uf.union(edge.source, edge.target)) {
      selectedEdges.push(edge.id)
      totalCost += edge.weight
      record({ type: 'select-edge', edgeId: edge.id, message: `Union ${edge.source} + ${edge.target}: add ${edge.id} (${edge.weight})` })
    } else {
      record({ type: 'reject-edge', edgeId: edge.id, message: `Cycle detected: skip ${edge.id}` })
    }
  }

  record({ type: 'complete-path', message: `Spanning tree complete. Total cost ${totalCost} (${selectedEdges.length} edges)` })

  return {
    path: [...graph.ids],
    pathCost: totalCost,
    nodesVisited: [...graph.ids],
    totalVisits: sorted.length,
    steps,
    edgesSelected: selectedEdges,
    message: 'Kruskal sorts all edges and unions them while avoiding cycles.',
  }
}