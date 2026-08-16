// ============================================================================
// BREACH — Single heist types
// One facility. One network. Six algorithmic phases.
// ============================================================================

export type HeistPhase =
  | 'infiltration'
  | 'search'
  | 'pathfinding'
  | 'networkOptimization'
  | 'resourceOptimization'
  | 'extraction'
  | 'complete'
  | 'failed'

export const PHASE_ORDER: HeistPhase[] = [
  'infiltration',
  'search',
  'pathfinding',
  'networkOptimization',
  'resourceOptimization',
  'extraction',
]

export const PHASE_META: Record<string, { title: string; concept: string }> = {
  infiltration: { title: 'INFILTRATE', concept: 'GRAPH REPRESENTATION' },
  search: { title: 'SEARCH', concept: 'BFS · DFS TRAVERSAL' },
  pathfinding: { title: 'ROUTE', concept: 'PATHFINDING · DIJKSTRA' },
  networkOptimization: { title: 'OPTIMIZE', concept: 'MINIMUM SPANNING TREE' },
  resourceOptimization: { title: 'EXTRACT', concept: 'DYNAMIC PROGRAMMING' },
  extraction: { title: 'FINAL EXTRACTION', concept: 'SYNTHESIS' },
}

/** A node inside the Phase 2 internal network. */
export interface SearchNode {
  id: string
  name: string
  depth: number
  isTarget?: boolean
}

/** An edge inside the Phase 2 internal network. */
export interface SearchEdge {
  id: string
  from: string
  to: string
}

/** An edge in the Phase 4 damaged network. */
export interface MstEdge {
  id: string
  from: string
  to: string
  cost: number
}

/** A recoverable data asset in Phase 5. */
export interface Asset {
  id: string
  name: string
  value: number
  cost: number
}

// ---------------------------------------------------------------------------
// Performance recording
// ---------------------------------------------------------------------------

export interface InfiltrationPerformance {
  visited: string[]
  discovered: string[]
  edgesTraversed: string[]
  backtrackCount: number
  decoyHits: number
}

export interface SearchPerformance {
  visitOrder: string[]
  discovered: string[]
  backtrackCount: number
  maxDepth: number
  bfsEfficiency: number
  dfsEfficiency: number
  coverage: number
  matchedStrategy: 'BFS' | 'DFS'
}

export interface PathfindingPerformance {
  playerPath: string[]
  playerCost: number
  optimalPath: string[]
  optimalCost: number
  efficiency: number
  exposureGained: number
  nodesProcessed: number
  relaxations: number
  priorityQueueOps: number
  /** Order similarity between the player's route and Dijkstra's priority-queue expansion. */
  queueMatch: number
}

export interface MstPerformance {
  selectedEdges: string[]
  playerCost: number
  optimalEdges: string[]
  optimalCost: number
  efficiency: number
  cycleRejections: number
}

export interface DpPerformance {
  selectedAssetIds: string[]
  playerValue: number
  playerWeight: number
  optimalAssetIds: string[]
  optimalValue: number
  statesEvaluated: number
  efficiency: number
}

export interface ExtractionPerformance {
  playerPath: string[]
  playerCost: number
  optimalPath: string[]
  optimalCost: number
  efficiency: number
  exposureGained: number
  nodesProcessed: number
}

export interface HeistPerformance {
  infiltration: InfiltrationPerformance
  search: SearchPerformance
  pathfinding: PathfindingPerformance
  mst: MstPerformance
  dp: DpPerformance
  extraction: ExtractionPerformance
}

// ---------------------------------------------------------------------------
// Persisted snapshot
// ---------------------------------------------------------------------------

export interface HeistSnapshot {
  version: number
  operator: string
  phase: HeistPhase
  startedAt: number
  timeLimitSec: number
  timeRemaining: number
  energy: number
  energyBudget: number
  exposure: number
  alert: number
  currentId: string
  visitedNodes: string[]
  discoveredNodes: string[]
  playerPath: string[]
  playerEdges: string[]
  searchVisited: string[]
  searchKnown: string[]
  /** Phase 3 route the player is building node-by-node. */
  routePath: string[]
  mstSelected: string[]
  mstCycleRejections: number
  dpSelected: string[]
  performance: HeistPerformance
  /** Number of gameplay phases fully completed (0–6). */
  phasesCompleted: number
  complete: boolean
  failedReason: string | null
}

export interface HeistSummary {
  operator: string
  success: boolean
  failedReason: string | null
  timeLimitSec: number
  timeRemaining: number
  elapsedSec: number
  energy: number
  energyBudget: number
  exposure: number
  alert: number
  nodesVisited: number
  nodesDiscovered: number
  /** Number of gameplay phases fully completed (0–6). */
  phasesCompleted: number
}