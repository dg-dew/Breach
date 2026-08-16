// ============================================================================
// BREACH — Post-heist network analysis
// After extraction the full facility graph is revealed: your path (amber)
// versus the algorithmic optimal (cream), the MST solution, and the moments
// where you diverge. Everything comes from recorded data + real engine runs.
// ============================================================================

import { Graph } from '@/data-structures/Graph'
import { runAlgorithm } from '@/algorithms'
import {
  ARCHIVE_ID,
  DP_ASSETS,
  DP_BUDGET,
  EXIT_ID,
  FACILITY_LOCATIONS,
  FACILITY_ROUTES,
  MST_EDGES,
  MST_NODES,
  SERVER_ID,
  asset,
  locationName,
  mstEdge,
  routeBetweenFacility,
} from './world'
import { facilityGraph, knapsack } from './solve'
import type { HeistSnapshot } from './types'

export interface AnalysisNode {
  id: string
  name: string
  kind: string
  x: number
  y: number
}

export interface AnalysisRoute {
  id: string
  from: string
  to: string
  cost: number
  timeSec: number
  exposure: number
  alert: number
  sealed: boolean
  playerUsed: boolean
  optimal: boolean
  mstSolution: boolean
  mstPlayer: boolean
}

export interface DecisionPoint {
  nodeId: string
  playerRoute: string
  optimalRoute: string
  playerCost: number
  optimalCost: number
  playerTime: number
  optimalTime: number
  playerExposure: number
  optimalExposure: number
}

export interface HeistAnalysis {
  nodes: AnalysisNode[]
  routes: AnalysisRoute[]
  playerPath: string[]
  optimalRoute: string[]
  mstOptimalEdges: string[]
  mstPlayerEdges: string[]
  mstPlayerCost: number
  mstOptimalCost: number
  mstUnnecessaryEdges: string[]
  dpPlayerValue: number
  dpOptimalValue: number
  dpPlayerAssetIds: string[]
  dpOptimalAssetIds: string[]
  dpMissing: string[]
  dpExtra: string[]
  decisionPoints: DecisionPoint[]
  elapsedSec: number
  playerExposureTotal: number
  optimalExposureTotal: number
}

// Deterministic SVG layout for the 16 facility locations (approx. 940x600).
const LAYOUT: Record<string, [number, number]> = {
  ENTRY: [140, 190],
  LOBBY: [280, 190],
  SERVICE: [280, 310],
  MAINTENANCE: [300, 540],
  SECURITY: [420, 190],
  CHECKPOINT: [420, 70],
  STORAGE: [150, 310],
  NETWORK: [560, 190],
  SERVER: [700, 190],
  POWER: [620, 310],
  CONTROL: [780, 310],
  ROUTER: [620, 430],
  ARCHIVE: [600, 500],
  EXTRACT: [760, 540],
  EXIT: [880, 540],
}

export function buildAnalysis(snap: HeistSnapshot): HeistAnalysis {
  const nodes: AnalysisNode[] = FACILITY_LOCATIONS.map((l) => {
    const [x, y] = LAYOUT[l.id] ?? [500, 250]
    return { id: l.id, name: l.name, kind: l.kind, x, y }
  })

  // Pathfinding optimal from SERVER to ARCHIVE (phase 3) then ARCHIVE to EXIT (phase 6)
  const pathfindingOptimal = runAlgorithm(
    'DIJKSTRA',
    facilityGraph('pathfinding'),
    SERVER_ID,
    ARCHIVE_ID,
  ).path
  const extractionOptimal = runAlgorithm(
    'DIJKSTRA',
    facilityGraph('extraction'),
    ARCHIVE_ID,
    EXIT_ID,
  ).path
  const optimalRoute = [...pathfindingOptimal, ...extractionOptimal.slice(1)]

  const playerPath = snap.playerPath
  const playerEdges = new Set(snap.playerEdges)

  // MST
  const mstRun = runAlgorithm(
    'KRUSKAL',
    new Graph({
      nodes: MST_NODES.map((id) => ({ id, label: id, type: 'router' as const, securityLevel: 0, position: { x: 0, y: 0 } })),
      edges: MST_EDGES.map((e) => ({ id: e.id, source: e.from, target: e.to, weight: e.cost, risk: 0 })),
    }),
    MST_NODES[0],
  )
  const mstOptimalEdges = mstRun.edgesSelected ?? []
  const mstPlayerEdges = snap.performance.mst.selectedEdges
  const mstPlayerCost = mstPlayerEdges.reduce((s, id) => {
    const e = mstEdge(id)
    return e ? s + e.cost : s
  }, 0)

  // Unnecessary player edges: player MST edges that are NOT in the optimal MST
  const mstUnnecessaryEdges = mstPlayerEdges.filter(
    (eid) => !mstOptimalEdges.includes(eid),
  )

  // Build the route list with player / optimal / mst flags
  const optimalEdgeSet = new Set<string>()
  for (let i = 1; i < optimalRoute.length; i++) {
    const r = routeBetweenFacility(optimalRoute[i - 1], optimalRoute[i])
    if (r) optimalEdgeSet.add(r.id)
  }
  const mstOptimalEdgeSet = new Set(mstOptimalEdges)
  const routes: AnalysisRoute[] = FACILITY_ROUTES.map((r) => ({
    id: r.id,
    from: r.from,
    to: r.to,
    cost: r.cost,
    timeSec: r.timeSec,
    exposure: r.exposure,
    alert: r.alert,
    sealed: false,
    playerUsed: playerEdges.has(r.id),
    optimal: optimalEdgeSet.has(r.id),
    mstSolution: mstOptimalEdgeSet.has(r.id),
    mstPlayer: snap.performance.mst.selectedEdges.includes(r.id),
  }))

  // DP optimal
  const optimalDp = knapsack(DP_ASSETS, DP_BUDGET)
  const dpPlayerValue = [...snap.performance.dp.selectedAssetIds]
    .reduce((s, id) => s + (asset(id)?.value ?? 0), 0)
  const dpOptimalValue = optimalDp.optimalValue
  const dpPlayerAssetIds = [...snap.performance.dp.selectedAssetIds].sort()
  const dpOptimalAssetIds = [...optimalDp.optimalIds].sort()

  // Missing and extra assets
  const dpMissing = dpOptimalAssetIds.filter((id) => !dpPlayerAssetIds.includes(id))
  const dpExtra = dpPlayerAssetIds.filter((id) => !dpOptimalAssetIds.includes(id))

  // Decision points: where player diverged from optimal
  const decisionPoints = computeDecisionPoints(
    playerPath,
    optimalRoute,
    snap.performance.pathfinding.queueMatch,
  )

  return {
    nodes,
    routes,
    playerPath,
    optimalRoute,
    mstOptimalEdges,
    mstPlayerEdges,
    mstPlayerCost,
    mstOptimalCost: mstRun.pathCost,
    mstUnnecessaryEdges,
    dpPlayerValue,
    dpOptimalValue,
    dpPlayerAssetIds,
    dpOptimalAssetIds,
    dpMissing,
    dpExtra,
    decisionPoints,
    elapsedSec: snap.timeLimitSec - snap.timeRemaining,
    playerExposureTotal: snap.exposure,
    optimalExposureTotal: 0, // computed per-route if needed
  }
}

/**
 * Where the player left the algorithmic route, and the cost of each choice.
 * A decision point is recorded the first time the player's next move differs
 * from the optimal next move; the walk then continues until the player's path
 * rejoins the optimal route (so one detour yields one point, not several).
 */
export function computeDecisionPoints(
  playerPath: string[],
  optimalRoute: string[],
  _queueMatch?: number,
): DecisionPoint[] {
  const points: DecisionPoint[] = []
  if (playerPath.length < 2 || optimalRoute.length < 2) return points

  const startIdx = playerPath.indexOf(SERVER_ID)
  const leg = startIdx >= 0 ? playerPath.slice(startIdx) : playerPath

  let o = 0
  let i = 0
  while (i < leg.length - 1 && o < optimalRoute.length - 1) {
    const from = leg[i]
    const next = leg[i + 1]
    const optNext = optimalRoute[o + 1]

    if (from === optimalRoute[o] && next === optNext) {
      o += 1
      i += 1
      continue
    }

    const playerR = routeBetweenFacility(from, next)
    const optR = routeBetweenFacility(from, optNext)
    if (playerR && optR) {
      points.push({
        nodeId: from,
        playerRoute: playerR.id,
        optimalRoute: optR.id,
        playerCost: playerR.cost,
        optimalCost: optR.cost,
        playerTime: playerR.timeSec,
        optimalTime: optR.timeSec,
        playerExposure: playerR.exposure,
        optimalExposure: optR.exposure,
      })
    }

    // Skip ahead until the player's path rejoins the optimal route.
    let rejoined = false
    for (let j = i + 1; j < leg.length; j++) {
      const idx = optimalRoute.indexOf(leg[j], o + 1)
      if (idx !== -1) {
        o = idx
        i = j
        rejoined = true
        break
      }
    }
    if (!rejoined) break
    if (points.length >= 6) break
  }
  return points
}

export function locationLabel(id: string): string {
  return locationName(id)
}

export function mstEdgeLabel(edgeId: string): string {
  const e = mstEdge(edgeId)
  if (!e) return edgeId
  return `${e.from} ↔ ${e.to} · ${e.cost}`
}