import type { AlgorithmType } from '@/types'

export interface TrainingContent {
  algorithm: AlgorithmType
  title: string
  tagline: string
  pseudocode: string[]
  application: string
  analogy: string
  interactiveDescription: string
}

export const TRAINING: Record<AlgorithmType, TrainingContent> = {
  BFS: {
    algorithm: 'BFS',
    title: 'Breadth-First Search',
    tagline: 'Fan out level by level. The shortest route in hops.',
    pseudocode: [
      'queue = [source]',
      'visited = { source }',
      '',
      'while queue is not empty:',
      '    node = queue.dequeue()',
      '    for neighbor in node.neighbors:',
      '        if neighbor not in visited:',
      '            visited.add(neighbor)',
      '            queue.enqueue(neighbor)',
    ],
    application:
      'Social network friend suggestions (fewest connections), web crawling, peer-to-peer file search, GPS level-order discovery.',
    analogy:
      'Sending a signal through a building: you broadcast to every room on your floor first, then every room on the next floor. No room is missed, and the first time you reach a room is the fewest doors away.',
    interactiveDescription:
      'Watch BFS ripple outward from the entry point — each concentric wave is one full level of the network.',
  },
  DFS: {
    algorithm: 'DFS',
    title: 'Depth-First Search',
    tagline: 'Commit to one corridor and dive until it ends.',
    pseudocode: [
      'stack = [source]',
      'visited = {}',
      '',
      'while stack is not empty:',
      '    node = stack.pop()',
      '    if node in visited: continue',
      '    visited.add(node)',
      '    for neighbor in node.neighbors:',
      '        if neighbor not in visited:',
      '            stack.push(neighbor)',
    ],
    application:
      'Maze solving, detecting cycles, topological sorting, solving puzzles like Sudoku, exploring file system directory trees.',
    analogy:
      'Walking a cave system: you follow the first tunnel as deep as it goes before backtracking to try the next. You might explore the whole cave before finding the exit.',
    interactiveDescription:
      'Watch DFS plunge down one branch of the network before backtracking to explore the others.',
  },
  DIJKSTRA: {
    algorithm: 'DIJKSTRA',
    title: "Dijkstra's Algorithm",
    tagline: 'The minimum-cost path. A priority queue decides every move.',
    pseudocode: [
      'dist[source] = 0',
      'for every other node: dist[node] = ∞',
      'pq.push(source, 0)',
      '',
      'while pq is not empty:',
      '    node = pq.pop()   // lowest cost',
      '    for edge in node.edges:',
      '        candidate = dist[node] + edge.weight',
      '        if candidate < dist[neighbor]:',
      '            dist[neighbor] = candidate',
      '            pq.decreaseKey(neighbor, candidate)',
    ],
    application:
      'GPS shortest routes, network routing protocols (OSPF), finding lowest-latency data paths, real-time resource planning.',
    analogy:
      'Your phone navigator comparing every road by travel time, always expanding the cheapest route first, so when a destination is settled you know it is truly minimal.',
    interactiveDescription:
      'Watch Dijkstra expand the lowest-cost frontier first, and see each node settle with its final distance.',
  },
  PRIM: {
    algorithm: 'PRIM',
    title: "Prim's Algorithm",
    tagline: 'Grow one tree by always grabbing the cheapest link.',
    pseudocode: [
      'tree = { seed }',
      'pq = all edges from seed',
      '',
      'while tree has fewer than all nodes:',
      '    edge = pq.pop()   // cheapest',
      '    if edge leads outside the tree:',
      '        add edge and node to tree',
      '        push all edges from new node',
    ],
    application:
      'Designing cheapest networks: electrical grids, water pipelines, fiber-optic cables connecting data centers.',
    analogy:
      'Laying fiber between offices: you start at the main hub and at every step connect the nearest unconnected building with the cheapest cable — until every building is online.',
    interactiveDescription:
      'Watch Prim grow a minimum spanning tree outward from the hub, always choosing the cheapest connecting edge.',
  },
  KRUSKAL: {
    algorithm: 'KRUSKAL',
    title: "Kruskal's Algorithm",
    tagline: 'Sort every link, then union the cheapest without cycles.',
    pseudocode: [
      'sort all edges by weight',
      'disjoint_sets = { each node alone }',
      'tree = []',
      '',
      'for edge in sorted edges:',
      '    if find(edge.a) != find(edge.b):',
      '        union(edge.a, edge.b)',
      '        tree.add(edge)',
    ],
    application:
      'Same family as Prim: laying minimum-cost networks where edge costs are known — roads, cables, distributed storage replication.',
    analogy:
      'A builder with a price list for every cable. They try the cheapest first, skipping any cable that would loop a section already connected — until everything is joined.',
    interactiveDescription:
      'Watch Kruskal sort every edge by cost, then select the cheapest ones while rejecting any that would create a cycle.',
  },
  PRIORITY_QUEUE: {
    algorithm: 'PRIORITY_QUEUE',
    title: 'Priority Queue',
    tagline: 'A binary min-heap that always serves the most urgent item.',
    pseudocode: [
      'class PriorityQueue:',
      '    heap = []',
      '',
      '    push(item, priority):',
      '        heap.append(item)',
      '        bubble_up()',
      '',
      '    pop():',
      '        top = heap[0]',
      '        swap last into root',
      '        sink_down()',
      '        return top',
    ],
    application:
      'Task scheduling, Dijkstra itself, Dijkstra-driven routing, event systems, priority-driven operating systems.',
    analogy:
      'An emergency room triage desk: the most critical patient is always seen first, no matter when they arrived. Insertion and removal both cost O(log n).',
    interactiveDescription:
      'Watch the min-heap push and pop, always serving the lowest-priority number first.',
  },
}