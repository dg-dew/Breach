import type { GraphDefinition, GraphEdge, GraphNode } from '@/types'

/**
 * An adjacency-list based weighted undirected graph.
 * The fundamental data structure powering every mission.
 */
export class Graph {
  nodes: Map<string, GraphNode> = new Map()
  edges: GraphEdge[] = []
  private adjacency: Map<string, Map<string, GraphEdge>> = new Map()

  constructor(def?: GraphDefinition) {
    if (def) this.fromDefinition(def)
  }

  fromDefinition(def: GraphDefinition): void {
    this.nodes = new Map()
    this.edges = []
    this.adjacency = new Map()
    for (const n of def.nodes) {
      this.addNode(n)
    }
    for (const e of def.edges) {
      this.addEdge(e)
    }
  }

  toDefinition(): GraphDefinition {
    return {
      nodes: [...this.nodes.values()],
      edges: [...this.edges],
    }
  }

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node)
    if (!this.adjacency.has(node.id)) this.adjacency.set(node.id, new Map())
  }

  removeNode(id: string): void {
    this.nodes.delete(id)
    this.adjacency.delete(id)
    // Remove all edges touching this node
    this.edges = this.edges.filter(
      (e) => e.source !== id && e.target !== id,
    )
    for (const adj of this.adjacency.values()) {
      adj.delete(id)
    }
  }

  addEdge(edge: GraphEdge): void {
    // Avoid duplicate edges between the same pair
    const exists = this.edges.some(
      (e) =>
        (e.source === edge.source && e.target === edge.target) ||
        (e.source === edge.target && e.target === edge.source),
    )
    if (exists) return
    this.edges.push(edge)
    this.connect(edge)
  }

  removeEdge(edgeId: string): void {
    const edge = this.edges.find((e) => e.id === edgeId)
    if (!edge) return
    this.edges = this.edges.filter((e) => e.id !== edgeId)
    this.disconnect(edge)
  }

  private connect(edge: GraphEdge): void {
    if (!this.adjacency.has(edge.source)) this.adjacency.set(edge.source, new Map())
    if (!this.adjacency.has(edge.target)) this.adjacency.set(edge.target, new Map())
    this.adjacency.get(edge.source)!.set(edge.target, edge)
    this.adjacency.get(edge.target)!.set(edge.source, edge)
  }

  private disconnect(edge: GraphEdge): void {
    this.adjacency.get(edge.source)?.delete(edge.target)
    this.adjacency.get(edge.target)?.delete(edge.source)
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id)
  }

  getEdgeId(source: string, target: string): string | undefined {
    return this.adjacency.get(source)?.get(target)?.id
  }

  /** All neighbors of a node (ignoring blocked edges). */
  neighbors(id: string): GraphEdge[] {
    const adj = this.adjacency.get(id)
    if (!adj) return []
    return [...adj.values()].filter((e) => !e.blocked)
  }

  get nodeCount(): number {
    return this.nodes.size
  }

  get edgeCount(): number {
    return this.edges.length
  }

  get ids(): string[] {
    return [...this.nodes.keys()]
  }

  /** Is the graph connected? Useful to validate generated missions. */
  isConnected(): boolean {
    if (this.nodeCount === 0) return true
    const visited = new Set<string>()
    const stack = [this.ids[0]]
    while (stack.length) {
      const id = stack.pop()!
      if (visited.has(id)) continue
      visited.add(id)
      for (const e of this.neighbors(id)) {
        const next = e.source === id ? e.target : e.source
        if (!visited.has(next)) stack.push(next)
      }
    }
    return visited.size === this.nodeCount
  }

  clone(): Graph {
    return new Graph(this.toDefinition())
  }
}
