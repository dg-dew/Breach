import type {
  GraphDefinition,
  GraphEdge,
  GraphNode,
  Mission,
  NodeType,
  ScoringConfig,
} from '@/types'

let edgeSeq = 0

function n(
  id: string,
  x: number,
  y: number,
  type: NodeType = 'router',
  securityLevel = 2,
): GraphNode {
  return { id, label: id, type, securityLevel, position: { x, y } }
}

function e(a: string, b: string, weight: number, risk = 2): GraphEdge {
  return { id: `E-${edgeSeq++}`, source: a, target: b, weight, risk }
}

function resetSeq(): void {
  edgeSeq = 0
}

function graph(nodes: GraphNode[], edges: GraphEdge[]): GraphDefinition {
  return { nodes, edges }
}

const scoring = (
  base: number,
  timeLimit: number,
  overrides: Partial<ScoringConfig> = {},
): ScoringConfig => ({
  baseScore: base,
  timeLimitSeconds: timeLimit,
  timeBonus: 240,
  lowExposureBonus: 180,
  optimalRouteBonus: 500,
  unnecessaryNodePenalty: 120,
  efficiencyFactor: 0.6,
  ...overrides,
})

export function buildMissions(): Mission[] {
  resetSeq()

  const mission01: Mission = {
    id: 'm01',
    order: 1,
    title: 'INITIAL ACCESS',
    codename: 'FIRST LIGHT',
    description: 'Establish a foothold in a small corporate network. The target sits only a few hops away.',
    objective: 'Reach ARCHIVE-01 with the fewest hops.',
    difficulty: 'EASY',
    algorithm: 'BFS',
    graph: graph(
      [
        n('ENTRY', 50, 310, 'entry', 1),
        n('NODE-01', 220, 120, 'router', 2),
        n('NODE-02', 220, 310, 'router', 2),
        n('NODE-03', 220, 500, 'router', 2),
        n('NODE-04', 420, 120, 'workstation', 3),
        n('NODE-05', 420, 310, 'workstation', 3),
        n('NODE-06', 420, 500, 'workstation', 3),
        n('ARCHIVE-01', 640, 310, 'target', 4),
      ],
      [
        e('ENTRY', 'NODE-01', 2, 1),
        e('ENTRY', 'NODE-02', 2, 1),
        e('ENTRY', 'NODE-03', 2, 1),
        e('NODE-01', 'NODE-04', 2, 2),
        e('NODE-02', 'NODE-05', 2, 2),
        e('NODE-03', 'NODE-06', 2, 2),
        e('NODE-04', 'ARCHIVE-01', 2, 2),
        e('NODE-05', 'ARCHIVE-01', 2, 2),
        e('NODE-06', 'ARCHIVE-01', 2, 2),
        e('NODE-01', 'NODE-02', 4, 2),
        e('NODE-02', 'NODE-03', 4, 2),
      ],
    ),
    entryNode: 'ENTRY',
    targetNode: 'ARCHIVE-01',
    scoring: scoring(1000, 120),
    narrative:
      'A cold server room hums in the dark. Three routes, one target. BFS fans outward layer by layer — the shortest path by hops reveals itself before you even commit.',
  }

  const mission02: Mission = {
    id: 'm02',
    order: 2,
    title: 'DEEP ROUTE',
    codename: 'BLACK CORRIDOR',
    description: 'A hidden archive is buried at the end of a long, unguarded corridor. Plunge deep and fast.',
    objective: 'Reach DEEP-09 using a depth-first descent.',
    difficulty: 'EASY',
    algorithm: 'DFS',
    graph: graph(
      [
        n('ENTRY', 50, 310, 'entry', 1),
        n('NODE-01', 200, 150, 'router', 2),
        n('NODE-02', 200, 310, 'router', 2),
        n('NODE-03', 350, 90, 'workstation', 2),
        n('NODE-04', 350, 220, 'router', 3),
        n('NODE-05', 500, 60, 'workstation', 3),
        n('NODE-06', 500, 170, 'router', 3),
        n('NODE-07', 650, 90, 'workstation', 4),
        n('NODE-08', 650, 200, 'router', 4),
        n('DEEP-09', 820, 140, 'target', 5),
        n('NODE-10', 350, 400, 'datacenter', 3),
        n('NODE-11', 350, 500, 'datacenter', 4),
      ],
      [
        e('ENTRY', 'NODE-01', 2, 1),
        e('ENTRY', 'NODE-02', 2, 1),
        e('NODE-01', 'NODE-03', 3, 2),
        e('NODE-01', 'NODE-04', 3, 2),
        e('NODE-02', 'NODE-04', 3, 2),
        e('NODE-02', 'NODE-10', 2, 1),
        e('NODE-10', 'NODE-11', 2, 1),
        e('NODE-11', 'NODE-02', 4, 2),
        e('NODE-03', 'NODE-05', 4, 2),
        e('NODE-04', 'NODE-06', 4, 2),
        e('NODE-05', 'NODE-07', 3, 2),
        e('NODE-06', 'NODE-08', 3, 2),
        e('NODE-07', 'DEEP-09', 2, 2),
        e('NODE-08', 'DEEP-09', 2, 2),
        e('NODE-05', 'NODE-06', 6, 3),
        e('NODE-07', 'NODE-08', 6, 3),
      ],
    ),
    entryNode: 'ENTRY',
    targetNode: 'DEEP-09',
    scoring: scoring(1000, 120),
    narrative:
      'The corridor is long and cold. DFS commits to the first route and keeps descending until it finds the archive — no time wasted on breadth.',
  }

  const mission03: Mission = {
    id: 'm03',
    order: 3,
    title: 'LOW EXPOSURE',
    codename: 'QUIET FOOTSTEPS',
    description: 'Security patrols every direct route. The cheapest path is NOT the shortest — calculate, don\'t guess.',
    objective: 'Reach CORE-06 with minimum traversal cost.',
    difficulty: 'MEDIUM',
    algorithm: 'DIJKSTRA',
    graph: graph(
      [
        n('ENTRY', 50, 310, 'entry', 1),
        n('NODE-01', 210, 100, 'router', 2),
        n('NODE-02', 210, 240, 'router', 2),
        n('NODE-03', 210, 520, 'router', 3),
        n('NODE-04', 390, 90, 'workstation', 3),
        n('NODE-05', 390, 220, 'workstation', 3),
        n('NODE-06', 390, 380, 'security', 4),
        n('NODE-07', 390, 520, 'datacenter', 3),
        n('NODE-08', 580, 90, 'router', 4),
        n('NODE-09', 580, 220, 'router', 3),
        n('NODE-10', 580, 380, 'workstation', 4),
        n('CORE-06', 780, 200, 'target', 5),
        n('NODE-12', 780, 460, 'datacenter', 4),
      ],
      [
        e('ENTRY', 'NODE-01', 3, 2),
        e('ENTRY', 'NODE-02', 1, 1),
        e('ENTRY', 'NODE-03', 8, 4),
        e('NODE-01', 'NODE-04', 4, 2),
        e('NODE-02', 'NODE-05', 2, 2),
        e('NODE-03', 'NODE-07', 3, 2),
        e('NODE-04', 'NODE-08', 5, 3),
        e('NODE-05', 'NODE-09', 2, 2),
        e('NODE-06', 'NODE-10', 3, 2),
        e('NODE-06', 'NODE-05', 9, 4),
        e('NODE-08', 'CORE-06', 6, 3),
        e('NODE-09', 'CORE-06', 4, 2),
        e('NODE-10', 'CORE-06', 9, 4),
        e('NODE-10', 'NODE-12', 2, 1),
        e('NODE-12', 'NODE-03', 9, 4),
        e('NODE-04', 'NODE-05', 7, 3),
        e('NODE-01', 'NODE-03', 10, 4),
      ],
    ),
    entryNode: 'ENTRY',
    targetNode: 'CORE-06',
    scoring: scoring(1500, 150),
    narrative:
      'The direct corridors are crawling with guards. Dijkstra evaluates every route by cost, not distance — the quiet back path wins.',
  }

  const mission04: Mission = {
    id: 'm04',
    order: 4,
    title: 'NETWORK REBUILD',
    codename: 'WIRES AND WEAKNESS',
    description: 'Severed links isolate critical systems. Reconnect every node using the minimum total cable — build a spanning tree.',
    objective: 'Connect all critical nodes with minimum total cost.',
    difficulty: 'MEDIUM',
    algorithm: 'PRIM',
    graph: graph(
      [
        n('HUB-00', 500, 50, 'entry', 1),
        n('NODE-01', 110, 140, 'router', 2),
        n('NODE-02', 300, 90, 'router', 2),
        n('NODE-03', 700, 90, 'router', 2),
        n('NODE-04', 890, 160, 'workstation', 3),
        n('NODE-05', 890, 420, 'workstation', 3),
        n('NODE-06', 700, 520, 'router', 3),
        n('NODE-07', 500, 560, 'router', 3),
        n('NODE-08', 300, 520, 'datacenter', 4),
        n('NODE-09', 110, 460, 'datacenter', 4),
        n('NODE-10', 500, 310, 'target', 5),
      ],
      [
        e('HUB-00', 'NODE-02', 4, 2),
        e('HUB-00', 'NODE-03', 4, 2),
        e('NODE-01', 'NODE-02', 5, 2),
        e('NODE-01', 'NODE-09', 5, 2),
        e('NODE-01', 'HUB-00', 8, 3),
        e('NODE-02', 'NODE-08', 6, 3),
        e('NODE-02', 'NODE-10', 5, 2),
        e('NODE-03', 'NODE-04', 3, 2),
        e('NODE-03', 'NODE-10', 6, 3),
        e('NODE-03', 'NODE-06', 5, 2),
        e('NODE-04', 'NODE-05', 3, 2),
        e('NODE-05', 'NODE-06', 4, 2),
        e('NODE-06', 'NODE-07', 5, 2),
        e('NODE-07', 'NODE-08', 6, 3),
        e('NODE-08', 'NODE-09', 5, 2),
        e('NODE-09', 'NODE-01', 5, 2),
        e('NODE-09', 'NODE-07', 8, 3),
        e('NODE-10', 'NODE-06', 7, 3),
        e('NODE-10', 'NODE-08', 7, 3),
        e('NODE-02', 'NODE-03', 9, 4),
      ],
    ),
    entryNode: 'HUB-00',
    targetNode: 'NODE-10',
    scoring: scoring(1800, 180),
    narrative:
      'Prim grows the network outward from the hub, always pulling the cheapest link. A minimum spanning tree — every node alive, zero wasted cable.',
  }

  const mission05: Mission = {
    id: 'm05',
    order: 5,
    title: 'PRIORITY BREACH',
    codename: 'HIGH VALUE TARGET',
    description: 'Multiple vaults. The clock is ticking and guards converge. The priority queue lets you strike the most valuable target first.',
    objective: 'Breach the highest-priority vault before lockdown.',
    difficulty: 'HARD',
    algorithm: 'PRIORITY_QUEUE',
    graph: graph(
      [
        n('ENTRY', 50, 310, 'entry', 1),
        n('NODE-01', 200, 130, 'router', 2),
        n('NODE-02', 200, 310, 'router', 2),
        n('NODE-03', 200, 490, 'router', 2),
        n('VAULT-A', 400, 90, 'server', 4),
        n('VAULT-B', 400, 250, 'server', 4),
        n('VAULT-C', 400, 410, 'server', 4),
        n('VAULT-D', 400, 550, 'server', 4),
        n('NODE-04', 600, 150, 'security', 4),
        n('NODE-05', 600, 310, 'security', 4),
        n('NODE-06', 600, 470, 'security', 4),
        n('CORE-X', 780, 310, 'target', 5),
      ],
      [
        e('ENTRY', 'NODE-01', 2, 1),
        e('ENTRY', 'NODE-02', 2, 1),
        e('ENTRY', 'NODE-03', 2, 1),
        e('NODE-01', 'VAULT-A', 3, 2),
        e('NODE-01', 'VAULT-B', 3, 2),
        e('NODE-02', 'VAULT-B', 3, 2),
        e('NODE-02', 'VAULT-C', 3, 2),
        e('NODE-03', 'VAULT-C', 3, 2),
        e('NODE-03', 'VAULT-D', 3, 2),
        e('VAULT-A', 'NODE-04', 4, 3),
        e('VAULT-B', 'NODE-05', 4, 3),
        e('VAULT-C', 'NODE-06', 4, 3),
        e('VAULT-D', 'NODE-06', 4, 3),
        e('NODE-04', 'CORE-X', 5, 3),
        e('NODE-05', 'CORE-X', 5, 3),
        e('NODE-06', 'CORE-X', 5, 3),
        e('VAULT-A', 'VAULT-B', 6, 3),
        e('VAULT-B', 'VAULT-C', 6, 3),
        e('VAULT-C', 'VAULT-D', 6, 3),
      ],
    ),
    entryNode: 'ENTRY',
    targetNode: 'CORE-X',
    scoring: scoring(2000, 150),
    narrative:
      'Four vaults, one corridor. A priority queue weighs cost against risk and strikes the most urgent node first — speed measured in milliseconds.',
  }

  const mission06: Mission = {
    id: 'm06',
    order: 6,
    title: 'ZERO HOUR',
    codename: 'FULL BREACH',
    description: 'Everything you\'ve learned. A dense network with decoys, locks and risk. Choose your algorithm and thread the needle.',
    objective: 'Reach FINAL-11 with minimum exposure. Your choice.',
    difficulty: 'EXPERT',
    algorithm: 'DIJKSTRA',
    graph: graph(
      [
        n('ENTRY', 50, 310, 'entry', 1),
        n('NODE-01', 180, 100, 'router', 2),
        n('NODE-02', 180, 240, 'router', 2),
        n('NODE-03', 180, 380, 'router', 2),
        n('NODE-04', 180, 520, 'router', 2),
        n('NODE-05', 360, 80, 'workstation', 3),
        n('NODE-06', 360, 200, 'security', 4),
        n('NODE-07', 360, 320, 'router', 3),
        n('NODE-08', 360, 440, 'workstation', 3),
        n('NODE-09', 360, 560, 'datacenter', 4),
        n('NODE-10', 550, 140, 'server', 4),
        n('NODE-11', 550, 320, 'router', 3),
        n('NODE-12', 550, 500, 'server', 4),
        n('NODE-13', 730, 100, 'workstation', 4),
        n('NODE-14', 730, 240, 'router', 4),
        n('NODE-15', 730, 400, 'router', 4),
        n('FINAL-11', 910, 200, 'target', 5),
      ],
      [
        e('ENTRY', 'NODE-01', 2, 1),
        e('ENTRY', 'NODE-02', 3, 2),
        e('ENTRY', 'NODE-03', 4, 2),
        e('ENTRY', 'NODE-04', 5, 3),
        e('NODE-01', 'NODE-05', 2, 2),
        e('NODE-02', 'NODE-06', 3, 2),
        e('NODE-02', 'NODE-07', 3, 2),
        e('NODE-03', 'NODE-07', 3, 2),
        e('NODE-03', 'NODE-08', 3, 2),
        e('NODE-04', 'NODE-08', 3, 2),
        e('NODE-04', 'NODE-09', 2, 2),
        e('NODE-05', 'NODE-10', 4, 2),
        e('NODE-06', 'NODE-10', 5, 3),
        e('NODE-06', 'NODE-11', 6, 3),
        e('NODE-07', 'NODE-11', 3, 2),
        e('NODE-08', 'NODE-11', 3, 2),
        e('NODE-08', 'NODE-12', 4, 3),
        e('NODE-09', 'NODE-12', 3, 2),
        e('NODE-10', 'NODE-13', 4, 2),
        e('NODE-11', 'NODE-14', 3, 2),
        e('NODE-12', 'NODE-15', 3, 2),
        e('NODE-13', 'FINAL-11', 5, 3),
        e('NODE-14', 'FINAL-11', 3, 2),
        e('NODE-15', 'FINAL-11', 4, 3),
        e('NODE-13', 'NODE-14', 6, 3),
        e('NODE-14', 'NODE-15', 6, 3),
        e('NODE-05', 'NODE-09', 9, 4),
        e('NODE-10', 'NODE-12', 7, 3),
      ],
    ),
    entryNode: 'ENTRY',
    targetNode: 'FINAL-11',
    scoring: scoring(2500, 200),
    narrative:
      'Every alarm is silent but you know they\'re watching. One clean route through the maze. Choose your weapon — BFS, DFS, or the surgeon\'s blade of Dijkstra.',
  }

  return [mission01, mission02, mission03, mission04, mission05, mission06]
}