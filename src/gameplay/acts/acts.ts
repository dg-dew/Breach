import type { Act } from '@/types'

/**
 * The campaign is six acts. Each act introduces a mechanical focus; the
 * DSA concepts are the engine beneath the gameplay, never the "topic".
 */
export const ACTS: Act[] = [
  {
    id: 'act-1',
    index: 1,
    title: 'THE NETWORK',
    subtitle: 'Learn to see the grid.',
    concept: 'GRAPH_TRAVERSAL',
    coreConcepts: ['Graph representation', 'BFS', 'DFS', 'Traversal'],
    description:
      'You are new to the underground. A handful of contacts, a prototype deck, and a city of dark networks. Learn how the grid moves — find targets that refuse to be found.',
    requiredRank: 'INITIATE',
    contractsRequired: 3,
  },
  {
    id: 'act-2',
    index: 2,
    title: 'THE ROUTE',
    subtitle: 'Cheapest is not always shortest.',
    concept: 'PATHFINDING',
    coreConcepts: ['Weighted graphs', 'Dijkstra', 'Priority queue / min-heap', 'Path reconstruction'],
    description:
      'You have a reputation now. Clients stop asking "can you" and start asking "how clean". Weighted networks reward the operator who weighs every corridor before committing.',
    requiredRank: 'SCOUT',
    contractsRequired: 3,
  },
  {
    id: 'act-3',
    index: 3,
    title: 'THE GRID',
    subtitle: 'Rebuild what you broke.',
    concept: 'NETWORK_OPTIMIZATION',
    coreConcepts: ['Minimum spanning tree', 'Prim', 'Kruskal', 'Graph optimization'],
    description:
      'Some contracts pay you to break in. A few pay you to put things back together cheaper than the engineers who built them. Every unit of cable is a unit of risk.',
    requiredRank: 'RUNNER',
    contractsRequired: 3,
  },
  {
    id: 'act-4',
    index: 4,
    title: 'PRESSURE',
    subtitle: 'The queue does not stop.',
    concept: 'STACK_QUEUE',
    coreConcepts: ['Stack', 'Queue', 'Deque', 'Priority queue'],
    description:
      'Live operations. Everything arrives at once — alarms, extraction windows, decoy systems, and a handler who never stops talking. Process in the right order or drown.',
    requiredRank: 'RUNNER',
    contractsRequired: 3,
  },
  {
    id: 'act-5',
    index: 5,
    title: 'OPTIMIZATION',
    subtitle: 'Every choice has a cost.',
    concept: 'DYNAMIC_PROGRAMMING',
    coreConcepts: ['Dynamic programming', 'State representation', 'Memoization', 'Optimization'],
    description:
      'A single energy cell. Twelve objectives. One exit. The best operators do not move faster — they choose better. Locked doors, branching rewards, brutal budgets.',
    requiredRank: 'GHOST',
    contractsRequired: 3,
  },
  {
    id: 'act-6',
    index: 6,
    title: 'THE ARCHITECT',
    subtitle: 'No labels. No hints. Just the problem.',
    concept: 'GRAPH_TRAVERSAL',
    coreConcepts: ['Hybrid systems', 'Dynamic graphs', 'Resource management', 'Full freedom'],
    description:
      'The endgame. Nothing is labeled, nothing is suggested. Networks shift while you are inside them. The Architect chooses their own tool for every wall. Prove you are one.',
    requiredRank: 'OPERATIVE',
    contractsRequired: 4,
  },
]

export function getAct(id: string): Act | undefined {
  return ACTS.find((a) => a.id === id)
}

export function nextActId(id: string): string | null {
  const i = ACTS.findIndex((a) => a.id === id)
  return i >= 0 && i < ACTS.length - 1 ? ACTS[i + 1].id : null
}
