// ============================================================================
// BREACH — Core data model
// The game is a campaign-driven algorithmic cyber-heist. DSA is the engine.
// ============================================================================

// ---------------------------------------------------------------------------
// Graph primitives
// ---------------------------------------------------------------------------

export type NodeType =
  | 'entry'
  | 'terminal'
  | 'router'
  | 'database'
  | 'gate'
  | 'archive'
  | 'vault'
  | 'control'
  | 'server'
  | 'decoy'
  | 'target'
  | 'exit'
  | 'workstation'
  | 'security'
  | 'datacenter'

export type AlgorithmType = 'BFS' | 'DFS' | 'DIJKSTRA' | 'PRIM' | 'KRUSKAL' | 'PRIORITY_QUEUE'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  securityLevel: number
  blocked?: boolean
  position: { x: number; y: number }
  /** Used by vault/target nodes — loot value. */
  value?: number
  /** Used by control nodes — a gadget/objective switch. */
  gate?: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  weight: number
  risk: number
  blocked?: boolean
  hidden?: boolean
}

export interface GraphDefinition {
  nodes: GraphNode[]
  edges: GraphEdge[]
  entryNode?: string
  targetNode?: string
  exitNode?: string
}

// ---------------------------------------------------------------------------
// Algorithm engine
// ---------------------------------------------------------------------------

export interface AlgorithmStep {
  type:
    | 'init'
    | 'visit'
    | 'enqueue'
    | 'dequeue'
    | 'relax'
    | 'select-edge'
    | 'reject-edge'
    | 'update'
    | 'discovered'
    | 'push'
    | 'pop'
    | 'complete-path'
  nodeId?: string
  edgeId?: string
  distance?: number
  message?: string
  queueSnapshot?: Array<{ nodeId: string; priority: number }>
}

export interface AlgorithmResult {
  path: string[]
  pathCost: number
  nodesVisited: string[]
  totalVisits: number
  steps: AlgorithmStep[]
  priorityQueueSnapshot?: Array<{ nodeId: string; priority: number }>
  distanceMap?: Record<string, number>
  edgesSelected?: string[]
  message?: string
}

// ---------------------------------------------------------------------------
// Campaign / Acts / Contracts
// ---------------------------------------------------------------------------

export type DSAConcept =
  | 'GRAPH_TRAVERSAL'
  | 'PATHFINDING'
  | 'NETWORK_OPTIMIZATION'
  | 'STACK_QUEUE'
  | 'DYNAMIC_PROGRAMMING'

export type MissionType = 'recon' | 'route' | 'rebuild' | 'queue' | 'optimize' | 'hybrid'

export type ContractStatus = 'available' | 'locked' | 'completed' | 'failed'

export interface Act {
  id: string
  index: number
  title: string
  subtitle: string
  concept: DSAConcept
  coreConcepts: string[]
  description: string
  requiredRank: OperatorRank
  contractsRequired: number
}

export interface Contract {
  id: string
  actId: string
  title: string
  codename: string
  client: string
  target: string
  payout: number
  reputationReward: number
  risk: RiskLevel
  difficulty: Difficulty
  estimatedTime: string
  requiredRank: OperatorRank
  missionType: MissionType
  concept?: DSAConcept
  objective: string
  narrative: string
  briefing: string[]
  featured?: boolean
  seed?: number
  status: ContractStatus
  order: number
}

// ---------------------------------------------------------------------------
// Operator profile
// ---------------------------------------------------------------------------

export type OperatorRank =
  | 'INITIATE'
  | 'SCOUT'
  | 'RUNNER'
  | 'GHOST'
  | 'OPERATIVE'
  | 'ARCHITECT'

export type OperatorArchetype =
  | 'ROUTE_ARCHITECT'
  | 'THE_EXPLORER'
  | 'NETWORK_ENGINEER'
  | 'PRESSURE_HANDLER'
  | 'THE_OPTIMIZER'
  | 'HYBRID'

export interface OperatorProfile {
  callsign: string
  rank: OperatorRank
  reputation: number
  credits: number
  completedOps: number
  failedOps: number
  totalPlayTimeMs: number
  bestScores: Record<string, number>
  equipment: string[]
  activeGadgets: string[]
  archetype: OperatorArchetype | null
  created: string
  finishedCampaign: boolean
}

// ---------------------------------------------------------------------------
// Performance / proficiency
// ---------------------------------------------------------------------------

export interface MissionPerformance {
  missionId: string
  contractId: string
  actId: string
  missionType: MissionType
  concept: DSAConcept
  success: boolean
  timeMs: number
  score: number
  payout: number
  reputationReward: number
  pathCost?: number
  optimalCost?: number
  nodesVisited?: number
  optimalVisits?: number
  exposure?: number
  alertGenerated?: number
  energyUsed?: number
  optimality: number
  efficiency: number
  algorithmLabel?: string
  metrics?: Record<string, number>
  completedAt: string
}

export interface DSAConceptProfile {
  conceptId: DSAConcept
  proficiency: number
  missionsPlayed: number
  missionsCompleted: number
  averageEfficiency: number
  averageOptimality: number
  averageTimeMs: number
  bestScore: number
  consistency: number
  recent: number[]
}

export interface ActPerformance {
  actId: string
  missionsAttempted: number
  missionsCompleted: number
  proficiency: number
  bestScore: number
  recent: number[]
}

// ---------------------------------------------------------------------------
// Mission runtime
// ---------------------------------------------------------------------------

export type MissionPhase =
  | 'recon'
  | 'infiltration'
  | 'breach'
  | 'extraction'
  | 'complete'
  | 'failed'

export interface MissionResources {
  time: number
  timeLimit: number
  energy: number
  energyMax: number
  exposure: number
  alert: number
  lockdown: boolean
}

export interface NodeRunState {
  id: string
  type: NodeType
  discovered: boolean
  visited: boolean
  active: boolean
  compromised: boolean
  blocked: boolean
}

export interface EdgeRunState {
  id: string
  blocked: boolean
  compromised: boolean
}

export type GameEventType =
  | 'trace'
  | 'alarm'
  | 'checkpoint'
  | 'decoy'
  | 'route-blocked'
  | 'route-open'
  | 'lockdown'
  | 'discovery'
  | 'info'
  | 'danger'

export interface GameEvent {
  id: string
  type: GameEventType
  message: string
  delta?: number
  ts: number
}

export interface MissionDefinition {
  id: string
  contractId: string
  actId: string
  title: string
  codename: string
  type: MissionType
  difficulty: Difficulty
  concept?: DSAConcept
  graph?: GraphDefinition
  timeLimit: number
  energyBudget: number
  startingAlert: number
  startingExposure: number
  objective: string
  // route / recon / hybrid
  routeMode?: 'risk' | 'cost'
  // rebuild
  rebuildTargets?: string[]
  // queue
  taskTemplates?: QueueTaskTemplate[]
  // optimize
  optimizationOptions?: OptimizationOption[]
  // hybrid / procedural
  nodeCount?: number
  seed?: number
}

export interface QueueTaskTemplate {
  id: string
  name: string
  priority: number
  deadline: number
  reward: number
  penalty: number
  window: [number, number]
}

export interface OptimizationOption {
  id: string
  name: string
  reward: number
  cost: number
  requires?: string[]
}

// ---------------------------------------------------------------------------
// Equipment / gadgets
// ---------------------------------------------------------------------------

export type GadgetId =
  | 'routeAnalyzer'
  | 'deepScan'
  | 'ghostNode'
  | 'decoy'
  | 'override'
  | 'traceBreaker'

export interface Gadget {
  id: GadgetId
  name: string
  desc: string
  cost: number
  charges: number
  /** Gameplay effect description (not real hacking). */
  effect: string
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type ThemeMode = 'green' | 'amber'

export interface Settings {
  sound: boolean
  sfxVolume: number
  ambienceVolume: number
  animationIntensity: 'low' | 'medium' | 'high'
  reducedMotion: boolean
  brightness: number
  graphSpeed: number
}

// ---------------------------------------------------------------------------
// Legacy game store types (used by old pages)
// ---------------------------------------------------------------------------

export interface GameState {
  clearanceLevel: number
  completedMissions: string[]
  highScores: Record<string, number>
  totalScore: number
  operationsCompleted: number
  bestTime: number
  networksBreached: number
  algorithmProficiency: Record<AlgorithmType, number>
  hasEntered: boolean
  lastMission: string | null
}

export interface MissionResult {
  missionId: string
  score: number
  timeMs: number
  nodesVisited: number
  pathCost: number
  completed: boolean
  completedAt?: string
  exposure?: number
  algorithm?: AlgorithmType
}

export interface Mission {
  id: string
  name?: string
  algorithm: AlgorithmType
  difficulty: Difficulty
  description?: string
  nodes?: number
  edges?: number
  timeLimit?: number
  scoring?: ScoringConfig
  title?: string
  codename?: string
  objective?: string
  narrative?: string
  order?: number
  graph?: GraphDefinition
  entryNode?: string
  targetNode?: string
}

export interface ScoringConfig {
  timeWeight?: number
  pathWeight?: number
  nodeWeight?: number
  riskWeight?: number
  targetScore?: number
  timeTarget?: number
  pathTarget?: number
  nodeTarget?: number
  timeLimitSeconds?: number
  timeBonus?: number
  lowExposureBonus?: number
  optimalRouteBonus?: number
  unnecessaryNodePenalty?: number
  efficiencyFactor?: number
  baseScore?: number
}
