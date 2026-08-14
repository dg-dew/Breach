import { describe, it, expect } from 'vitest'
import { Graph } from '@/data-structures/Graph'
import type { GraphDefinition } from '@/types'

const def: GraphDefinition = {
  nodes: [
    { id: 'A', label: 'A', type: 'router', securityLevel: 1, position: { x: 0, y: 0 } },
    { id: 'B', label: 'B', type: 'router', securityLevel: 1, position: { x: 1, y: 0 } },
    { id: 'C', label: 'C', type: 'router', securityLevel: 1, position: { x: 2, y: 0 } },
    { id: 'D', label: 'D', type: 'router', securityLevel: 1, position: { x: 3, y: 0 } },
  ],
  edges: [
    { id: 'e1', source: 'A', target: 'B', weight: 2, risk: 1 },
    { id: 'e2', source: 'B', target: 'C', weight: 3, risk: 1 },
    { id: 'e3', source: 'C', target: 'D', weight: 4, risk: 1 },
    { id: 'e4', source: 'A', target: 'C', weight: 8, risk: 2 },
  ],
}

describe('Graph', () => {
  it('loads nodes and edges from a definition', () => {
    const g = new Graph(def)
    expect(g.nodeCount).toBe(4)
    expect(g.edgeCount).toBe(4)
    expect(g.getNode('B')?.label).toBe('B')
  })

  it('returns neighbors for a node', () => {
    const g = new Graph(def)
    const neighbors = g.neighbors('A')
    expect(neighbors.length).toBe(2)
    const ids = neighbors.map((e) => (e.source === 'A' ? e.target : e.source)).sort()
    expect(ids).toEqual(['B', 'C'])
  })

  it('rejects duplicate edges between the same pair', () => {
    const g = new Graph(def)
    g.addEdge({ id: 'dup', source: 'A', target: 'B', weight: 1, risk: 1 })
    expect(g.edgeCount).toBe(4)
  })

  it('handles node removal and cleans up edges', () => {
    const g = new Graph(def)
    g.removeNode('B')
    expect(g.nodeCount).toBe(3)
    expect(g.edgeCount).toBe(2)
    expect(g.neighbors('A').some((e) => e.target === 'B' || e.source === 'B')).toBe(false)
  })

  it('detects a connected graph', () => {
    expect(new Graph(def).isConnected()).toBe(true)
  })

  it('detects a disconnected graph', () => {
    const disconnected = new Graph({
      nodes: [
        { id: 'A', label: 'A', type: 'router', securityLevel: 1, position: { x: 0, y: 0 } },
        { id: 'B', label: 'B', type: 'router', securityLevel: 1, position: { x: 1, y: 0 } },
      ],
      edges: [],
    })
    expect(disconnected.isConnected()).toBe(false)
  })

  it('treats empty graph as connected', () => {
    expect(new Graph({ nodes: [], edges: [] }).isConnected()).toBe(true)
  })
})
