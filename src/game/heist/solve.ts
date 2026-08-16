// ============================================================================
// BREACH — Pure benchmarks used by the heist engine
// Knapsack (DP), traversal-order similarity (LCS), and the facility graph.
// ============================================================================

import { Graph } from '@/data-structures/Graph'
import { FACILITY_ROUTES, PATHFINDING_EDGES, PHASE_INDEX } from './world'
import type { Asset, HeistPhase } from './types'

/** Is this facility route open during the given phase? */
export function isFacilityRouteOpen(phase: HeistPhase, routeId: string): boolean {
  const route = FACILITY_ROUTES.find((r) => r.id === routeId)
  if (!route) return false
  if (route.opensOn && PHASE_INDEX[phase] < PHASE_INDEX[route.opensOn]) return false
  if (route.sealedAfter && PHASE_INDEX[phase] >= PHASE_INDEX[route.sealedAfter]) return false
  return true
}

/** Build the weighted facility graph as it exists during a given phase. */
export function facilityGraph(phase: HeistPhase): Graph {
  const nodes = FACILITY_ROUTES.reduce<string[]>((acc, r) => {
    if (!acc.includes(r.from)) acc.push(r.from)
    if (!acc.includes(r.to)) acc.push(r.to)
    return acc
  }, [])
  const edges = FACILITY_ROUTES.filter((r) => isFacilityRouteOpen(phase, r.id)).map((r) => ({
    id: r.id,
    source: r.from,
    target: r.to,
    weight: r.cost,
    risk: r.risk,
  }))
  return new Graph({ nodes: nodes.map((id) => ({ id, label: id, type: 'router' as const, securityLevel: 0, position: { x: 0, y: 0 } })), edges })
}

/**
 * The dedicated Phase 3 weighted graph used by Dijkstra.
 * Primary weight is the pathfinding edge cost.
 */
export function pathfindingGraph(): Graph {
  return new Graph({
    nodes: PATHFINDING_EDGES.reduce<string[]>((acc, e) => {
      if (!acc.includes(e.from)) acc.push(e.from)
      if (!acc.includes(e.to)) acc.push(e.to)
      return acc
    }, []).map((id) => ({ id, label: id, type: 'router' as const, securityLevel: 0, position: { x: 0, y: 0 } })),
    edges: PATHFINDING_EDGES.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      weight: e.cost,
      risk: 0,
    })),
  })
}

/**
 * 0/1 knapsack via dynamic programming.
 * Returns the optimal total value, the chosen asset ids, and the number of
 * DP states evaluated (table cells) — all real.
 */
export function knapsack(assets: Asset[], budget: number): { optimalValue: number; optimalIds: string[]; statesEvaluated: number } {
  const n = assets.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(0))
  const statesEvaluated = (n + 1) * (budget + 1)

  for (let i = 1; i <= n; i++) {
    const a = assets[i - 1]
    for (let w = 0; w <= budget; w++) {
      if (a.cost <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - a.cost] + a.value)
      } else {
        dp[i][w] = dp[i - 1][w]
      }
    }
  }

  const optimalIds: string[] = []
  let w = budget
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      optimalIds.unshift(assets[i - 1].id)
      w -= assets[i - 1].cost
    }
  }

  return { optimalValue: dp[n][budget], optimalIds, statesEvaluated }
}

/** Longest-common-subsequence similarity between two visit orders (0–100). */
export function orderSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const m = a.length
  const n = b.length
  const lcs: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      lcs[i][j] = a[i - 1] === b[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1])
    }
  }
  return Math.round((lcs[m][n] / Math.max(m, n)) * 100)
}