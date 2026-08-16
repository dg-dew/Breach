// ============================================================================
// BREACH — HeistController
// A pure, testable state machine for the single six-phase heist. No React.
// Phases advance ONLY when real objectives are completed. Every benchmark
// (Dijkstra, BFS/DFS, MST, knapsack DP) is computed from the actual engine.
// ============================================================================

import { Graph } from '@/data-structures/Graph'
import { runAlgorithm } from '@/algorithms'
import {
  ARCHIVE_ID,
  DP_ASSETS,
  DP_BUDGET,
  ENTRY_ID,
  EXIT_ID,
  FACILITY_LOCATIONS,
  FACILITY_ROUTES,
  MST_EDGES,
  MST_NODES,
  NETWORK_ID,
  PHASE_INDEX,
  SEARCH_EDGES,
  SEARCH_NODES,
  SEARCH_START,
  SEARCH_TARGET,
  SERVER_ID,
  facilityAdjacency,
  locationName,
  mstEdge,
  routeBetweenFacility,
  searchAdjacency,
  searchNode,
} from './world'
import { facilityGraph, isFacilityRouteOpen, knapsack, orderSimilarity } from './solve'
import type {
  Asset,
  HeistPerformance,
  HeistPhase,
  HeistSnapshot,
  HeistSummary,
  MstPerformance,
  PathfindingPerformance,
  SearchPerformance,
  DpPerformance,
} from './types'
import type { FacilityRoute } from './world'

export const SEARCH_TIME_SEC = 3
export const MST_TIME_SEC = 20
export const DP_TIME_SEC = 15

export interface DestinationOption {
  id: string
  name: string
  routeId: string
  cost: number
  timeSec: number
  exposure: number
  alert: number
  risk: number
  sealed: boolean
  dangerous: boolean
}

export interface HeistView {
  phase: HeistPhase
  phaseIndex: number
  objectiveText: string
  timeRemaining: number
  timeLimitSec: number
  energy: number
  energyBudget: number
  exposure: number
  alert: number
  currentId: string
  currentName: string
  currentKind: string
  currentDescription: string
  available: DestinationOption[]
  pathNames: string[]
  interactLabel: string | null
  searchKnown: string[]
  searchVisited: string[]
  searchCurrent: string
  searchAvailable: string[]
  mstSelected: string[]
  mstNodes: string[]
  mstTotal: number
  mstConnected: boolean
  mstComplete: boolean
  dpSelected: string[]
  dpBudget: number
  dpUsed: number
  dpValue: number
  failedReason: string | null
  finished: boolean
}

type Listener = () => void

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

export function emptyPerformance(): HeistPerformance {
  return {
    infiltration: { visited: [], discovered: [], edgesTraversed: [], backtrackCount: 0, decoyHits: 0 },
    search: { visitOrder: [], discovered: [], backtrackCount: 0, maxDepth: 0, bfsEfficiency: 0, dfsEfficiency: 0, coverage: 0, matchedStrategy: 'BFS' },
    pathfinding: { playerPath: [], playerCost: 0, optimalPath: [], optimalCost: 0, efficiency: 0, exposureGained: 0, nodesProcessed: 0, relaxations: 0, priorityQueueOps: 0, queueMatch: 0 },
    mst: { selectedEdges: [], playerCost: 0, optimalEdges: [], optimalCost: 0, efficiency: 0, cycleRejections: 0 },
    dp: { selectedAssetIds: [], playerValue: 0, playerWeight: 0, optimalAssetIds: [], optimalValue: 0, statesEvaluated: 0, efficiency: 0 },
    extraction: { playerPath: [], playerCost: 0, optimalPath: [], optimalCost: 0, efficiency: 0, exposureGained: 0, nodesProcessed: 0 },
  }
}

export class HeistController {
  private phase: HeistPhase = 'infiltration'
  private timeRemaining: number
  private timeLimitSec = 600
  private energy: number
  private energyBudget = 100
  private exposure = 0
  private alert = 0

  private currentId = ENTRY_ID
  private visited = new Set<string>([ENTRY_ID])
  private discovered = new Set<string>([ENTRY_ID])
  private playerPath: string[] = [ENTRY_ID]
  private playerEdges: string[] = []

  private searchCurrent = SEARCH_START
  private searchVisited: string[] = [SEARCH_START]
  private searchKnown = new Set<string>([SEARCH_START])

  private mstSelected = new Set<string>()
  private mstCycleRejections = 0

  private dpSelected = new Set<string>()

  private performance: HeistPerformance = emptyPerformance()
  private complete = false
  private failedReason: string | null = null

  private phasesCompleted = 0

  private listeners = new Set<Listener>()
  private view: HeistView | null = null

  constructor(private operator: string, private startedAt: number = Date.now()) {
    this.energy = this.energyBudget
    this.timeRemaining = this.timeLimitSec
    for (const r of facilityAdjacency(ENTRY_ID)) {
      const dest = r.to === ENTRY_ID ? r.from : r.to
      this.discovered.add(dest)
    }
  }

  // ------------------------------------------------------------ persistence --
  toSnapshot(): HeistSnapshot {
    return {
      version: 1,
      operator: this.operator,
      phase: this.phase,
      startedAt: this.startedAt,
      timeLimitSec: this.timeLimitSec,
      timeRemaining: this.timeRemaining,
      energy: this.energy,
      energyBudget: this.energyBudget,
      exposure: this.exposure,
      alert: this.alert,
      currentId: this.currentId,
      visitedNodes: [...this.visited],
      discoveredNodes: [...this.discovered],
      playerPath: [...this.playerPath],
      playerEdges: [...this.playerEdges],
      searchVisited: [...this.searchVisited],
      searchKnown: [...this.searchKnown],
      mstSelected: [...this.mstSelected],
      mstCycleRejections: this.mstCycleRejections,
      dpSelected: [...this.dpSelected],
      performance: structuredClone(this.performance),
      phasesCompleted: this.phasesCompleted,
      complete: this.complete,
      failedReason: this.failedReason,
    }
  }

  static fromSnapshot(snap: HeistSnapshot): HeistController {
    const c = new HeistController(snap.operator, snap.startedAt)
    c.phase = snap.phase
    c.timeRemaining = snap.timeRemaining
    c.energy = snap.energy
    c.exposure = snap.exposure
    c.alert = snap.alert
    c.currentId = snap.currentId
    c.visited = new Set(snap.visitedNodes)
    c.discovered = new Set(snap.discoveredNodes)
    c.playerPath = [...snap.playerPath]
    c.playerEdges = [...snap.playerEdges]
    c.searchCurrent = snap.searchVisited[snap.searchVisited.length - 1] ?? SEARCH_START
    c.searchVisited = [...snap.searchVisited]
    c.searchKnown = new Set(snap.searchKnown)
    c.mstSelected = new Set(snap.mstSelected)
    c.mstCycleRejections = snap.mstCycleRejections
    c.dpSelected = new Set(snap.dpSelected)
    c.performance = structuredClone(snap.performance)
    c.phasesCompleted = snap.phasesCompleted ?? 0
    c.complete = snap.complete
    c.failedReason = snap.failedReason
    return c
  }

  // ---------------------------------------------------------------- public --
  getState(): HeistSnapshot {
    return this.toSnapshot()
  }

  getView(): HeistView {
    return this.view ?? this.rebuild()
  }

  getSummary(): HeistSummary {
    return {
      operator: this.operator,
      success: this.phase === 'complete',
      failedReason: this.failedReason,
      timeLimitSec: this.timeLimitSec,
      timeRemaining: this.timeRemaining,
      elapsedSec: this.timeLimitSec - this.timeRemaining,
      energy: this.energy,
      energyBudget: this.energyBudget,
      exposure: this.exposure,
      alert: this.alert,
      nodesVisited: this.visited.size,
      nodesDiscovered: this.discovered.size,
      phasesCompleted: this.phasesCompleted,
    }
  }

  getPerformance(): HeistPerformance {
    return structuredClone(this.performance)
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // ------------------------------------------------------------ phase moves --
  /** Move through the facility (infiltration / pathfinding / extraction). */
  move(destId: string): boolean {
    if (!this.canMove() || this.complete) return false
    if (this.energy <= 0) {
      this.fail('ENERGY DEPLETED')
      return false
    }

    const route = routeBetweenFacility(this.currentId, destId)
    if (!route || !isFacilityRouteOpen(this.phase, route.id)) return false

    const dangerous = this.phase === 'extraction' && route.dangerousDuringExtraction
    const isDecoy = this.locationOf(destId)?.decoy === true
    let exposureDelta = route.exposure + (dangerous ? 4 : 0) + (isDecoy ? 3 : 0)
    let alertDelta = route.alert + (dangerous ? 6 : 0) + (isDecoy ? 4 : 0)

    this.energy = Math.max(0, this.energy - route.cost)
    this.timeRemaining = Math.max(0, this.timeRemaining - route.timeSec)
    this.exposure = clamp(this.exposure + exposureDelta)
    this.alert = clamp(this.alert + alertDelta)
    this.playerEdges.push(route.id)

    if (this.exposure >= 100) {
      this.fail('EXPOSURE CRITICAL')
      return false
    }

    if (this.visited.has(destId)) this.performance.infiltration.backtrackCount += 1
    this.visited.add(destId)
    this.discovered.add(destId)
    this.playerPath.push(destId)
    if (isDecoy) this.performance.infiltration.decoyHits += 1
    this.currentId = destId

    for (const r of facilityAdjacency(destId)) {
      const nid = r.to === destId ? r.from : r.to
      this.discovered.add(nid)
    }

    // Stranded with no energy away from the current objective.
    if (this.energy <= 0 && !this.atObjective()) {
      this.fail('ENERGY DEPLETED')
      return false
    }

    this.emit()
    return true
  }

  /** Explore the internal network during the search phase. */
  searchMove(nodeId: string): boolean {
    if (this.phase !== 'search' || this.complete) return false
    const adjacent = searchAdjacency(this.searchCurrent).some((e) => e.from === nodeId || e.to === nodeId)
    if (!adjacent || !SEARCH_NODES.some((n) => n.id === nodeId)) return false

    if (this.searchVisited.includes(nodeId)) this.performance.search.backtrackCount += 1
    this.searchVisited.push(nodeId)
    this.searchKnown.add(nodeId)
    this.searchCurrent = nodeId
    this.timeRemaining = Math.max(0, this.timeRemaining - SEARCH_TIME_SEC)

    for (const e of searchAdjacency(nodeId)) {
      const nid = e.from === nodeId ? e.to : e.from
      this.searchKnown.add(nid)
    }

    if (this.timeRemaining <= 0) {
      this.fail('TIME EXPIRED')
      return false
    }
    this.emit()
    return true
  }

  /** Contextual interaction — advances the phase only at real objectives. */
  interact(): boolean {
    if (this.complete) return false
    if (this.phase === 'infiltration' && this.currentId === NETWORK_ID) {
      this.beginSearch()
      return true
    }
    if (this.phase === 'search' && this.searchCurrent === SEARCH_TARGET) {
      this.finishSearch()
      return true
    }
    if (this.phase === 'pathfinding' && this.currentId === ARCHIVE_ID) {
      this.beginOptimization()
      return true
    }
    if (this.phase === 'extraction' && this.currentId === EXIT_ID) {
      this.completeHeist()
      return true
    }
    return false
  }

  /** Toggle a network edge in the MST puzzle. Returns false if it would create a cycle. */
  toggleMst(edgeId: string): boolean {
    if (this.phase !== 'networkOptimization' || this.complete) return false
    const edge = mstEdge(edgeId)
    if (!edge) return false

    if (this.mstSelected.has(edgeId)) {
      this.mstSelected.delete(edgeId)
      this.emit()
      return true
    }

    if (this.wouldCreateCycle(edgeId)) {
      this.mstCycleRejections += 1
      this.emit()
      return false
    }

    this.mstSelected.add(edgeId)
    if (this.isSpanningTree()) {
      this.finishOptimization()
      return true
    }
    this.emit()
    return true
  }

  toggleAsset(assetId: string): boolean {
    if (this.phase !== 'resourceOptimization' || this.complete) return false
    const a = this.assetOf(assetId)
    if (!a) return false

    if (this.dpSelected.has(assetId)) {
      this.dpSelected.delete(assetId)
      this.emit()
      return true
    }
    if (this.dpWeight() + a.cost > DP_BUDGET) {
      this.emit()
      return false
    }
    this.dpSelected.add(assetId)
    this.emit()
    return true
  }

  /** Lock in the asset selection and advance to the final extraction. */
  finalizeDp(): boolean {
    if (this.phase !== 'resourceOptimization' || this.complete) return false
    this.timeRemaining = Math.max(0, this.timeRemaining - DP_TIME_SEC)
    this.finishResourceOptimization()
    return true
  }

  /** Global heist clock — decremented every second by the UI. */
  tick(): void {
    if (this.complete || this.phase === 'complete' || this.phase === 'failed') return
    this.timeRemaining = Math.max(0, this.timeRemaining - 1)
    if (this.phase === 'extraction') {
      this.exposure = clamp(this.exposure + 1)
      this.alert = clamp(this.alert + 2)
    }
    if (this.timeRemaining <= 0) {
      this.fail('TIME EXPIRED')
      return
    }
    if (this.exposure >= 100) {
      this.phase === 'extraction'
        ? this.fail('SECURITY LOCKDOWN')
        : this.fail('EXPOSURE CRITICAL')
      return
    }
    this.emit()
  }

  // ---------------------------------------------------------- transitions --
  private beginSearch(): void {
    this.phasesCompleted += 1
    this.performance.infiltration = {
      visited: [...this.visited],
      discovered: [...this.discovered],
      edgesTraversed: [...this.playerEdges],
      backtrackCount: this.performance.infiltration.backtrackCount,
      decoyHits: this.performance.infiltration.decoyHits,
    }
    this.phase = 'search'
    // Reveal the starting node's neighbours so the search can begin.
    for (const e of searchAdjacency(this.searchCurrent)) {
      const nid = e.from === this.searchCurrent ? e.to : e.from
      this.searchKnown.add(nid)
    }
    this.emit()
  }

  private finishSearch(): void {
    this.performance.search = this.computeSearchPerformance()
    this.phasesCompleted += 1
    this.phase = 'pathfinding'
    this.currentId = SERVER_ID
    this.visited.add(SERVER_ID)
    this.discovered.add(SERVER_ID)
    if (!this.playerPath.includes(SERVER_ID)) {
      this.playerPath.push(SERVER_ID)
      this.playerEdges.push('network-server')
    }
    for (const r of facilityAdjacency(SERVER_ID)) {
      const nid = r.to === SERVER_ID ? r.from : r.to
      this.discovered.add(nid)
    }
    this.emit()
  }

  private beginOptimization(): void {
    this.phasesCompleted += 1
    this.performance.pathfinding = this.computePathfindingPerformance()
    this.phase = 'networkOptimization'
    this.emit()
  }

  private finishOptimization(): void {
    this.phasesCompleted += 1
    this.performance.mst = this.computeMstPerformance()
    this.timeRemaining = Math.max(0, this.timeRemaining - MST_TIME_SEC)
    if (this.timeRemaining <= 0) {
      this.fail('TIME EXPIRED')
      return
    }
    this.phase = 'resourceOptimization'
    this.emit()
  }

  private finishResourceOptimization(): void {
    this.phasesCompleted += 1
    this.performance.dp = this.computeDpPerformance()
    this.phase = 'extraction'
    this.emit()
  }

  private completeHeist(): void {
    this.phasesCompleted += 1
    this.performance.extraction = this.computeExtractionPerformance()
    this.complete = true
    this.phase = 'complete'
    this.emit()
  }

  private fail(reason: string): void {
    if (this.complete) return
    this.phase = 'failed'
    this.complete = true
    this.failedReason = reason
    this.emit()
  }

  // ------------------------------------------------------------ benchmarks --
  private computeSearchPerformance(): SearchPerformance {
    const graph = new Graph({
      nodes: SEARCH_NODES.map((n) => ({ id: n.id, label: n.name, type: 'router' as const, securityLevel: 0, position: { x: 0, y: 0 } })),
      edges: SEARCH_EDGES.map((e) => ({ id: e.id, source: e.from, target: e.to, weight: 1, risk: 0 })),
    })
    const bfsOrder = runAlgorithm('BFS', graph, SEARCH_START).nodesVisited
    const dfsOrder = runAlgorithm('DFS', graph, SEARCH_START).nodesVisited
    const bfsEfficiency = orderSimilarity(this.searchVisited, bfsOrder)
    const dfsEfficiency = orderSimilarity(this.searchVisited, dfsOrder)
    const maxDepth = Math.max(...this.searchVisited.map((id) => searchNode(id).depth))
    return {
      visitOrder: [...this.searchVisited],
      discovered: [...this.searchKnown],
      backtrackCount: this.performance.search.backtrackCount,
      maxDepth,
      bfsEfficiency,
      dfsEfficiency,
      coverage: Math.round((this.searchKnown.size / SEARCH_NODES.length) * 100),
      matchedStrategy: bfsEfficiency >= dfsEfficiency ? 'BFS' : 'DFS',
    }
  }

  private computePathfindingPerformance(): PathfindingPerformance {
    const run = runAlgorithm('DIJKSTRA', facilityGraph('pathfinding'), SERVER_ID, ARCHIVE_ID)
    const startIdx = this.playerPath.indexOf(SERVER_ID)
    const legPath = startIdx >= 0 ? this.playerPath.slice(startIdx) : [SERVER_ID, ...this.playerPath]
    const legEdges = startIdx >= 0 ? this.playerEdges.slice(startIdx) : []
    let playerCost = 0
    let exposureGained = 0
    for (const r of this.facilityRoutesFor(legEdges)) {
      playerCost += r.cost
      exposureGained += r.exposure
    }
    const optimalCost = run.pathCost
    const efficiency = optimalCost > 0 ? Math.round(clamp((optimalCost / Math.max(1, playerCost)) * 100)) : 100
    return {
      playerPath: legPath,
      playerCost,
      optimalPath: run.path,
      optimalCost,
      efficiency,
      exposureGained,
      nodesProcessed: run.totalVisits,
      relaxations: run.steps.filter((s) => s.type === 'relax').length,
      priorityQueueOps: run.steps.filter((s) => s.type === 'enqueue' || s.type === 'dequeue' || s.type === 'update').length,
      queueMatch: orderSimilarity(legPath, run.nodesVisited),
    }
  }

  private computeMstPerformance(): MstPerformance {
    const graph = new Graph({
      nodes: MST_NODES.map((id) => ({ id, label: id, type: 'router' as const, securityLevel: 0, position: { x: 0, y: 0 } })),
      edges: MST_EDGES.map((e) => ({ id: e.id, source: e.from, target: e.to, weight: e.cost, risk: 0 })),
    })
    const run = runAlgorithm('KRUSKAL', graph, MST_NODES[0])
    const playerCost = this.mstTotalCost()
    const optimalCost = run.pathCost
    const efficiency = optimalCost > 0 ? Math.round(clamp((optimalCost / Math.max(1, playerCost)) * 100)) : 100
    return {
      selectedEdges: [...this.mstSelected],
      playerCost,
      optimalEdges: run.edgesSelected ?? [],
      optimalCost,
      efficiency,
      cycleRejections: this.mstCycleRejections,
    }
  }

  private computeDpPerformance(): DpPerformance {
    const optimal = knapsack(DP_ASSETS, DP_BUDGET)
    let playerValue = 0
    for (const id of this.dpSelected) {
      const a = this.assetOf(id)
      if (a) playerValue += a.value
    }
    const efficiency = optimal.optimalValue > 0 ? Math.round(clamp((playerValue / optimal.optimalValue) * 100)) : 100
    return {
      selectedAssetIds: [...this.dpSelected],
      playerValue,
      playerWeight: this.dpWeight(),
      optimalAssetIds: optimal.optimalIds,
      optimalValue: optimal.optimalValue,
      statesEvaluated: optimal.statesEvaluated,
      efficiency,
    }
  }

  private computeExtractionPerformance() {
    const run = runAlgorithm('DIJKSTRA', facilityGraph('extraction'), ARCHIVE_ID, EXIT_ID)
    const startIdx = this.playerPath.indexOf(ARCHIVE_ID)
    const legPath = startIdx >= 0 ? this.playerPath.slice(startIdx) : []
    const legEdges = startIdx >= 0 ? this.playerEdges.slice(startIdx) : []
    let playerCost = 0
    let exposureGained = 0
    for (const r of this.facilityRoutesFor(legEdges)) {
      playerCost += r.cost
      exposureGained += r.exposure
    }
    const optimalCost = run.pathCost
    const efficiency = optimalCost > 0 ? Math.round(clamp((optimalCost / Math.max(1, playerCost)) * 100)) : 100
    return {
      playerPath: legPath,
      playerCost,
      optimalPath: run.path,
      optimalCost,
      efficiency,
      exposureGained,
      nodesProcessed: run.totalVisits,
    }
  }

  // ---------------------------------------------------------------- helpers --
  private canMove(): boolean {
    return this.phase === 'infiltration' || this.phase === 'pathfinding' || this.phase === 'extraction'
  }

  private atObjective(): boolean {
    if (this.phase === 'infiltration') return this.currentId === NETWORK_ID
    if (this.phase === 'pathfinding') return this.currentId === ARCHIVE_ID
    if (this.phase === 'extraction') return this.currentId === EXIT_ID
    return false
  }

  private locationOf(id: string) {
    return FACILITY_LOCATIONS.find((l) => l.id === id)
  }

  private assetOf(id: string): Asset | null {
    return DP_ASSETS.find((a) => a.id === id) ?? null
  }

  private facilityRoutesFor(edgeIds: string[]) {
    return edgeIds.map((id) => FACILITY_ROUTES.find((r) => r.id === id)).filter((r): r is FacilityRoute => Boolean(r))
  }

  private mstTotalCost(): number {
    let total = 0
    for (const id of this.mstSelected) {
      const e = mstEdge(id)
      if (e) total += e.cost
    }
    return total
  }

  private dpWeight(): number {
    let w = 0
    for (const id of this.dpSelected) {
      const a = this.assetOf(id)
      if (a) w += a.cost
    }
    return w
  }

  /** Would adding this edge connect two already-connected nodes (cycle)? */
  private wouldCreateCycle(edgeId: string): boolean {
    const edge = mstEdge(edgeId)
    if (!edge) return true
    const parent = new Map<string, string>()
    const find = (n: string): string => {
      let root = n
      while (parent.get(root) !== undefined && parent.get(root) !== root) root = parent.get(root)!
      return root
    }
    const union = (a: string, b: string) => {
      const ra = find(a)
      const rb = find(b)
      if (ra !== rb) parent.set(rb, ra)
    }
    for (const id of this.mstSelected) {
      const e = mstEdge(id)
      if (!e) continue
      union(e.from, e.to)
    }
    return find(edge.from) === find(edge.to)
  }

  /** True when the selected edges form a spanning tree over all nodes. */
  private isSpanningTree(): boolean {
    if (this.mstSelected.size !== MST_NODES.length - 1) return false
    const parent = new Map<string, string>()
    const find = (n: string): string => {
      let root = n
      while (parent.get(root) !== undefined && parent.get(root) !== root) root = parent.get(root)!
      return root
    }
    const union = (a: string, b: string) => {
      const ra = find(a)
      const rb = find(b)
      if (ra !== rb) parent.set(rb, ra)
    }
    for (const id of this.mstSelected) {
      const e = mstEdge(id)
      if (!e) continue
      union(e.from, e.to)
    }
    const root = find(MST_NODES[0])
    return MST_NODES.every((n) => find(n) === root)
  }

  // --------------------------------------------------------------- view ---------
  private interactLabel(): string | null {
    if (this.phase === 'infiltration' && this.currentId === NETWORK_ID) return 'ACCESS INTERNAL NETWORK'
    if (this.phase === 'search' && this.searchCurrent === SEARCH_TARGET) return 'LOCATE ACCESS TERMINAL'
    if (this.phase === 'pathfinding' && this.currentId === ARCHIVE_ID) return 'SECURE THE ARCHIVE'
    if (this.phase === 'extraction' && this.currentId === EXIT_ID) return 'EXTRACT'
    return null
  }

  private objectiveText(): string {
    switch (this.phase) {
      case 'infiltration':
        return 'Reach the internal network core.'
      case 'search':
        return 'Locate the hidden access terminal.'
      case 'pathfinding':
        return 'Reach the BLACK ARCHIVE with minimum cost.'
      case 'networkOptimization':
        return 'Restore the network using the lowest total cost.'
      case 'resourceOptimization':
        return `Extract maximum value within capacity ${DP_BUDGET}.`
      case 'extraction':
        return 'Get out. The network is watching.'
      case 'complete':
        return 'Operation complete.'
      case 'failed':
        return `Failed — ${this.failedReason ?? 'unknown cause'}`
    }
  }

  private rebuild(): HeistView {
    const available: DestinationOption[] = []
    for (const r of facilityAdjacency(this.currentId)) {
      const destId = r.to === this.currentId ? r.from : r.to
      const loc = this.locationOf(destId)
      if (!loc) continue
      available.push({
        id: destId,
        name: loc.name,
        routeId: r.id,
        cost: r.cost,
        timeSec: r.timeSec,
        exposure: r.exposure + (this.phase === 'extraction' && r.dangerousDuringExtraction ? 4 : 0),
        alert: r.alert + (this.phase === 'extraction' && r.dangerousDuringExtraction ? 6 : 0),
        risk: r.risk,
        sealed: !isFacilityRouteOpen(this.phase, r.id),
        dangerous: Boolean(this.phase === 'extraction' && r.dangerousDuringExtraction),
      })
    }

    this.view = {
      phase: this.phase,
      phaseIndex: PHASE_INDEX[this.phase],
      objectiveText: this.objectiveText(),
      timeRemaining: this.timeRemaining,
      timeLimitSec: this.timeLimitSec,
      energy: this.energy,
      energyBudget: this.energyBudget,
      exposure: this.exposure,
      alert: this.alert,
      currentId: this.currentId,
      currentName: locationName(this.currentId),
      currentKind: this.locationOf(this.currentId)?.kind ?? 'unknown',
      currentDescription: this.locationOf(this.currentId)?.description ?? '',
      available,
      pathNames: this.playerPath.map(locationName),
      interactLabel: this.interactLabel(),
      searchKnown: [...this.searchKnown],
      searchVisited: [...this.searchVisited],
      searchCurrent: this.searchCurrent,
      searchAvailable: searchAdjacency(this.searchCurrent)
        .map((e) => (e.from === this.searchCurrent ? e.to : e.from))
        .filter((id) => this.searchKnown.has(id)),
      mstSelected: [...this.mstSelected],
      mstNodes: [...MST_NODES],
      mstTotal: this.mstTotalCost(),
      mstConnected: this.isSpanningTree(),
      mstComplete: this.phase === 'networkOptimization' ? this.isSpanningTree() : false,
      dpSelected: [...this.dpSelected],
      dpBudget: DP_BUDGET,
      dpUsed: this.dpWeight(),
      dpValue: [...this.dpSelected].reduce((s, id) => s + (this.assetOf(id)?.value ?? 0), 0),
      failedReason: this.failedReason,
      finished: this.complete,
    }
    return this.view
  }

  private emit(): void {
    this.rebuild()
    this.listeners.forEach((l) => l())
  }
}