import { describe, it, expect } from 'vitest'
import { Graph } from '@/data-structures/Graph'
import type { GraphDefinition } from '@/types'
import { bfs } from '@/algorithms/bfs'
import { dfs } from '@/algorithms/dfs'
import { dijkstra } from '@/algorithms/dijkstra'
import { prim } from '@/algorithms/prim'
import { kruskal } from '@/algorithms/kruskal'
import { reconstructPath } from '@/algorithms/pathReconstruction'

function makeGraph(def: GraphDefinition): Graph {
  return new Graph(def)
}

const SAMPLE: GraphDefinition = {
  nodes: [
    { id: 'S', label: 'S', type: 'entry', securityLevel: 1, position: { x: 0, y: 0 } },
    { id: 'A', label: 'A', type: 'router', securityLevel: 1, position: { x: 1, y: 0 } },
    { id: 'B', label: 'B', type: 'router', securityLevel: 1, position: { x: 2, y: 0 } },
    { id: 'C', label: 'C', type: 'router', securityLevel: 1, position: { x: 3, y: 0 } },
    { id: 'D', label: 'D', type: 'router', securityLevel: 1, position: { x: 4, y: 0 } },
  ],
  edges: [
    { id: 'e1', source: 'S', target: 'A', weight: 1, risk: 1 },
    { id: 'e2', source: 'S', target: 'B', weight: 4, risk: 1 },
    { id: 'e3', source: 'A', target: 'B', weight: 2, risk: 1 },
    { id: 'e4', source: 'A', target: 'C', weight: 5, risk: 1 },
    { id: 'e5', source: 'B', target: 'C', weight: 1, risk: 1 },
    { id: 'e6', source: 'C', target: 'D', weight: 3, risk: 1 },
  ],
}

describe('BFS', () => {
  it('finds a path from start to target', () => {
    const res = bfs(makeGraph(SAMPLE), 'S', 'D')
    expect(res.path).toEqual(['S', 'A', 'C', 'D'])
    expect(res.pathCost).toBe(3)
  })

  it('finds the fewest-hops path even when the weighted path differs', () => {
    // Dijkstra would prefer S->A->B->C (cost 4) but BFS prefers fewer hops.
    const res = bfs(makeGraph(SAMPLE), 'S', 'C')
    expect(res.path.length).toBe(3)
    expect(res.path[0]).toBe('S')
    expect(res.path[res.path.length - 1]).toBe('C')
  })

  it('returns empty path for unreachable target', () => {
    const g = makeGraph(SAMPLE)
    g.removeNode('D')
    const res = bfs(g, 'S', 'D')
    expect(res.path).toEqual([])
  })

  it('handles one-node graph', () => {
    const g = new Graph({ nodes: [{ id: 'X', label: 'X', type: 'router', securityLevel: 1, position: { x: 0, y: 0 } }], edges: [] })
    const res = bfs(g, 'X', 'X')
    expect(res.path).toEqual(['X'])
  })

  it('produces replayable steps', () => {
    const res = bfs(makeGraph(SAMPLE), 'S', 'D')
    expect(res.steps.length).toBeGreaterThan(0)
    expect(res.steps[0].type).toBe('init')
    expect(res.steps.some((s) => s.type === 'complete-path')).toBe(true)
  })
})

describe('DFS', () => {
  it('finds a path from start to target', () => {
    const res = dfs(makeGraph(SAMPLE), 'S', 'D')
    expect(res.path[0]).toBe('S')
    expect(res.path[res.path.length - 1]).toBe('D')
  })

  it('visits nodes in a depth-first order', () => {
    const res = dfs(makeGraph(SAMPLE), 'S')
    // S first, then one neighbor, then that neighbor's deeper neighbor before siblings
    expect(res.nodesVisited[0]).toBe('S')
  })

  it('returns empty path for unreachable target', () => {
    const g = makeGraph(SAMPLE)
    g.removeNode('C')
    g.removeNode('D')
    const res = dfs(g, 'S', 'D')
    expect(res.path).toEqual([])
  })

  it('handles single-node target', () => {
    const g = new Graph({ nodes: [{ id: 'X', label: 'X', type: 'router', securityLevel: 1, position: { x: 0, y: 0 } }], edges: [] })
    expect(dfs(g, 'X', 'X').path).toEqual(['X'])
  })
})

describe('Dijkstra', () => {
  it('finds the minimum-cost path', () => {
    const res = dijkstra(makeGraph(SAMPLE), 'S', 'D')
    // S-A(1) + A-B(2) + B-C(1) + C-D(3) = 7
    expect(res.path).toEqual(['S', 'A', 'B', 'C', 'D'])
    expect(res.pathCost).toBe(7)
  })

  it('finds a cheaper path via a non-obvious route', () => {
    const res = dijkstra(makeGraph(SAMPLE), 'S', 'C')
    // S-A-B-C = 1+2+1 = 4 beats S-B-C = 5
    expect(res.path).toEqual(['S', 'A', 'B', 'C'])
    expect(res.pathCost).toBe(4)
  })

  it('returns empty path for unreachable target', () => {
    const g = makeGraph(SAMPLE)
    g.removeNode('D')
    expect(dijkstra(g, 'S', 'D').path).toEqual([])
  })

  it('handles one-node graph', () => {
    const g = new Graph({ nodes: [{ id: 'X', label: 'X', type: 'router', securityLevel: 1, position: { x: 0, y: 0 } }], edges: [] })
    const res = dijkstra(g, 'X', 'X')
    expect(res.path).toEqual(['X'])
    expect(res.pathCost).toBe(0)
  })

  it('records relax/update steps for replay', () => {
    const res = dijkstra(makeGraph(SAMPLE), 'S', 'D')
    expect(res.steps.some((s) => s.type === 'relax')).toBe(true)
    expect(res.steps.some((s) => s.type === 'update')).toBe(true)
    expect(res.steps.some((s) => s.type === 'complete-path')).toBe(true)
  })
})

describe('Prim', () => {
  it('builds a spanning tree with nodeCount-1 edges', () => {
    const g = makeGraph(SAMPLE)
    const res = prim(g, 'S')
    expect(res.edgesSelected?.length).toBe(g.nodeCount - 1)
  })

  it('finds the minimum total cost', () => {
    const res = prim(makeGraph(SAMPLE), 'S')
    // MST edges: S-A(1), A-B(2), B-C(1), C-D(3) = 7
    expect(res.pathCost).toBe(7)
  })

  it('handles empty graph', () => {
    expect(prim(new Graph({ nodes: [], edges: [] }), 'X').pathCost).toBe(0)
  })
})

describe('Kruskal', () => {
  it('builds a spanning tree with nodeCount-1 edges', () => {
    const g = makeGraph(SAMPLE)
    const res = kruskal(g)
    expect(res.edgesSelected?.length).toBe(g.nodeCount - 1)
  })

  it('produces the same minimum cost as Prim', () => {
    const k = kruskal(makeGraph(SAMPLE))
    const p = prim(makeGraph(SAMPLE), 'S')
    expect(k.pathCost).toBe(p.pathCost)
    expect(k.pathCost).toBe(7)
  })

  it('handles disconnected graphs gracefully', () => {
    const g = new Graph({
      nodes: [
        { id: 'A', label: 'A', type: 'router', securityLevel: 1, position: { x: 0, y: 0 } },
        { id: 'B', label: 'B', type: 'router', securityLevel: 1, position: { x: 1, y: 0 } },
      ],
      edges: [],
    })
    const res = kruskal(g)
    expect(res.edgesSelected).toEqual([])
    expect(res.pathCost).toBe(0)
  })
})

describe('pathReconstruction', () => {
  it('reconstructs a path from a predecessor map', () => {
    const pred = { S: null, A: 'S', B: 'S', C: 'B', D: 'C' }
    expect(reconstructPath(pred, 'S', 'D')).toEqual(['S', 'B', 'C', 'D'])
  })

  it('returns [] when target unreachable', () => {
    const pred = { S: null, A: 'S' }
    expect(reconstructPath(pred, 'S', 'Z')).toEqual([])
  })

  it('handles start === end', () => {
    const pred = { S: null }
    expect(reconstructPath(pred, 'S', 'S')).toEqual(['S'])
  })
})

describe('blocked edges', () => {
  it('BFS avoids blocked edges', () => {
    const g = makeGraph(SAMPLE)
    const edge = g.edges.find((e) => e.id === 'e5')
    if (edge) edge.blocked = true
    const res = bfs(g, 'S', 'D')
    expect(res.path).toEqual(['S', 'A', 'C', 'D'])
  })

  it('Dijkstra avoids blocked edges', () => {
    const g = makeGraph(SAMPLE)
    const edge = g.edges.find((e) => e.id === 'e5')
    if (edge) edge.blocked = true
    const res = dijkstra(g, 'S', 'D')
    // S-A(1) + A-C(5) + C-D(3) = 9
    expect(res.pathCost).toBe(9)
  })
})