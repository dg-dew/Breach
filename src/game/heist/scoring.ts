// ============================================================================
// BREACH — Transparent scoring
// Every number shown in the debrief is computed from real recorded data.
// No fabricated figures. Total score runs 0–10,000 and the formula is shown.
// ============================================================================

import { DP_BUDGET, FACILITY_LOCATIONS } from './world'
import type { HeistPerformance, HeistSummary } from './types'

export interface ScoreCategory {
  id: 'objectives' | 'routeEfficiency' | 'networkOptimization' | 'resourceEfficiency' | 'riskManagement' | 'time'
  label: string
  lines: Array<{ label: string; earned: number; max: number; detail: string }>
  earned: number
  max: number
}

export interface DsaScore {
  id: 'graphs' | 'search' | 'pathfinding' | 'priorityQueue' | 'networkOptimization' | 'dp'
  label: string
  concept: string
  value: number
  detail: string
}

export interface ScoreBreakdown {
  operator: string
  success: boolean
  categories: ScoreCategory[]
  dsa: DsaScore[]
  total: number
  max: number
  grade: string
  strengths: string[]
  improvements: string[]
  strongest: DsaScore
  improve: DsaScore
}

export const TOTAL_MAX = 10_000

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

function gradeFor(total: number): string {
  if (total >= 9000) return 'S'
  if (total >= 7500) return 'A'
  if (total >= 6000) return 'B'
  if (total >= 4500) return 'C'
  if (total >= 3000) return 'D'
  return 'F'
}

export function scoreHeist(
  perf: HeistPerformance,
  summary: HeistSummary,
): ScoreBreakdown {
  const categories: ScoreCategory[] = []
  const dsa: DsaScore[] = []
  const strengths: string[] = []
  const improvements: string[] = []

  // -- 1. OBJECTIVES --------------------------------------------------------
  {
    const phaseReached = summary.phasesCompleted // 0–6 fully completed
    const objectivesEarned = Math.round((phaseReached / 6) * 1800)
    const objectivesMax = 1800
    categories.push({
      id: 'objectives',
      label: 'OBJECTIVES',
      lines: [
        {
          label: 'PHASES COMPLETED',
          earned: objectivesEarned,
          max: objectivesMax,
          detail: `${phaseReached} / 6 phases completed`,
        },
      ],
      earned: objectivesEarned,
      max: objectivesMax,
    })
  }

  // -- 2. ROUTE EFFICIENCY --------------------------------------------------
  {
    const path = perf.pathfinding
    const routeCostEarned = Math.round((path.efficiency / 100) * 1100)
    const routeCostMax = 1100
    const exposureLost = Math.max(0, 200 - path.exposureGained * 20)
    const exposureMax = 200
    const routeEarned = routeCostEarned + exposureLost
    const routeMax = 1300
    categories.push({
      id: 'routeEfficiency',
      label: 'ROUTE EFFICIENCY',
      lines: [
        {
          label: 'COST EFFICIENCY',
          earned: routeCostEarned,
          max: routeCostMax,
          detail: `your cost ${path.playerCost} vs Dijkstra optimal ${path.optimalCost} — ${path.efficiency}%`,
        },
        {
          label: 'LOW EXPOSURE',
          earned: exposureLost,
          max: exposureMax,
          detail: `+${path.exposureGained} exposure avoided on approach`,
        },
      ],
      earned: routeEarned,
      max: routeMax,
    })
  }

  // -- 3. NETWORK OPTIMIZATION ----------------------------------------------
  {
    const mst = perf.mst
    const efficiency = Math.round((mst.efficiency / 100) * 1600)
    const cyclePenalty = Math.min(mst.cycleRejections, 4) * 50
    categories.push({
      id: 'networkOptimization',
      label: 'NETWORK OPTIMIZATION',
      lines: [
        {
          label: 'TREE COST',
          earned: efficiency,
          max: 1600,
          detail: `your tree ${mst.playerCost} vs Kruskal optimal ${mst.optimalCost}`,
        },
        {
          label: 'CYCLE REJECTIONS',
          earned: Math.max(0, 200 - cyclePenalty),
          max: 200,
          detail: `${mst.cycleRejections} cycle attempt${mst.cycleRejections === 1 ? '' : 's'} rejected`,
        },
      ],
      earned: efficiency + Math.max(0, 200 - cyclePenalty),
      max: 1800,
    })
  }

  // -- 4. RESOURCE EFFICIENCY -----------------------------------------------
  {
    const dp = perf.dp
    const dpEarned = Math.round((dp.efficiency / 100) * 1800)
    const dpMax = 1800
    categories.push({
      id: 'resourceEfficiency',
      label: 'RESOURCE EFFICIENCY',
      lines: [
        {
          label: 'EXTRACTED VALUE',
          earned: dpEarned,
          max: dpMax,
          detail: `recovered ${dp.playerValue} / ${dp.optimalValue} capacity-optimal (weight ${dp.playerWeight}/${DP_BUDGET})`,
        },
      ],
      earned: dpEarned,
      max: dpMax,
    })
  }

  // -- 5. RISK MANAGEMENT ---------------------------------------------------
  {
    const exposureEarned = Math.max(0, 800 - summary.exposure * 8)
    const exposureMax = 800
    const alertEarned = Math.max(0, 350 - summary.alert * 3.5)
    const alertMax = 350
    const backtrackEarned = Math.max(
      0,
      350 - (perf.infiltration.backtrackCount + perf.search.backtrackCount) * 50,
    )
    const backtrackMax = 350
    const riskEarned = exposureEarned + alertEarned + backtrackEarned
    const riskMax = 1500
    categories.push({
      id: 'riskManagement',
      label: 'RISK MANAGEMENT',
      lines: [
        {
          label: 'EXPOSURE',
          earned: exposureEarned,
          max: exposureMax,
          detail: `final exposure ${summary.exposure} / 100`,
        },
        {
          label: 'ALERT',
          earned: alertEarned,
          max: alertMax,
          detail: `final alert ${summary.alert} / 100`,
        },
        {
          label: 'BACKTRACKING',
          earned: backtrackEarned,
          max: backtrackMax,
          detail: `${perf.infiltration.backtrackCount} infiltration + ${perf.search.backtrackCount} search backtracks`,
        },
      ],
      earned: riskEarned,
      max: riskMax,
    })
  }

  // -- 6. TIME --------------------------------------------------------------
  {
    const timeEarned = Math.round((summary.timeRemaining / summary.timeLimitSec) * 900)
    const timeMax = 900
    categories.push({
      id: 'time',
      label: 'TIME',
      lines: [
        {
          label: 'TIME REMAINING',
          earned: timeEarned,
          max: timeMax,
          detail: `${summary.timeRemaining}s remaining of ${summary.timeLimitSec}s`,
        },
      ],
      earned: timeEarned,
      max: timeMax,
    })
  }

  // --- DSA Concept Scores ---
  // GRAPHS: infiltration coverage + backtrack + decoy
  {
    const infil = perf.infiltration
    const visitedMax = FACILITY_LOCATIONS.length // 16
    const covered = Math.min(100, Math.round((infil.visited.length / visitedMax) * 100))
    const graphs = Math.round(clamp((covered + (100 - infil.backtrackCount * 10)) / 2))
    dsa.push({
      id: 'graphs',
      label: 'GRAPHS',
      concept: 'GRAPH REPRESENTATION',
      value: graphs,
      detail: `covered ${infil.visited.length} of ${visitedMax} locations, ${infil.backtrackCount} backtracks`,
    })
    if (graphs >= 85) strengths.push(`Swept ${infil.visited.length} locations with minimal backtracking.`)
    if (infil.backtrackCount > 0) improvements.push(`Backtracked ${infil.backtrackCount} location${infil.backtrackCount === 1 ? '' : 's'} during infiltration.`)
  }

  // BFS·DFS
  {
    const search = perf.search
    const searchScore = Math.max(search.bfsEfficiency, search.dfsEfficiency)
    dsa.push({
      id: 'search',
      label: 'BFS · DFS',
      concept: 'BFS · DFS TRAVERSAL',
      value: searchScore,
      detail: `matched real ${search.matchedStrategy} traversal at ${searchScore}%`,
    })
    if (searchScore >= 90) strengths.push(`Your search order leaned ${search.matchedStrategy}.`)
    if (search.backtrackCount > 0) improvements.push(`Retraced ${search.backtrackCount} network node${search.backtrackCount === 1 ? '' : 's'} during the search.`)
  }

  // PATHFINDING
  {
    const path = perf.pathfinding
    dsa.push({
      id: 'pathfinding',
      label: 'PATHFINDING',
      concept: 'PATHFINDING · DIJKSTRA',
      value: path.efficiency,
      detail: `efficiency ${path.efficiency}% (cost ${path.playerCost} vs optimal ${path.optimalCost})`,
    })
    if (path.efficiency >= 100) strengths.push('Dijkstra-optimal route into the archive.')
    else improvements.push(`Your route cost ${path.playerCost}; Dijkstra reached the archive at ${path.optimalCost}.`)
  }

  // PRIORITY QUEUE
  {
    const pq = perf.pathfinding.queueMatch
    dsa.push({
      id: 'priorityQueue',
      label: 'PRIORITY QUEUE',
      concept: 'PRIORITY QUEUE BREACH',
      value: pq,
      detail: `order similarity ${pq}% between player leg and Dijkstra priority-queue expansion`,
    })
    if (pq >= 80) strengths.push('Your path closely followed the priority-queue expansion order.')
    if (pq < 80) improvements.push(`Your path diverged from the priority-queue expansion at ${100 - pq}% points.`)
  }

  // NETWORK OPTIMIZATION
  {
    const mst = perf.mst
    dsa.push({
      id: 'networkOptimization',
      label: 'NETWORK OPTIMIZATION',
      concept: 'MINIMUM SPANNING TREE',
      value: mst.efficiency,
      detail: `MST efficiency ${mst.efficiency}% (cost ${mst.playerCost} vs optimal ${mst.optimalCost})`,
    })
    if (mst.efficiency >= 100) strengths.push('Minimum-cost spanning tree — textbook Kruskal result.')
    else improvements.push(`Your restored network cost ${mst.playerCost}; the MST is ${mst.optimalCost}.`)
  }

  // DYNAMIC PROGRAMMING
  {
    const dp = perf.dp
    dsa.push({
      id: 'dp',
      label: 'DYNAMIC PROGRAMMING',
      concept: 'DYNAMIC PROGRAMMING',
      value: dp.efficiency,
      detail: `DP efficiency ${dp.efficiency}% (value ${dp.playerValue} / optimal ${dp.optimalValue})`,
    })
    if (dp.efficiency >= 100) strengths.push('Knapsack-optimal extraction — maximum value under capacity.')
    else improvements.push(`Left ${dp.optimalValue - dp.playerValue} value behind; the knapsack optimum was ${dp.optimalValue}.`)
  }

  // --- Strongest / Improve ---
  // Pick the highest and lowest DSA concept scores for feedback
  const strongestDsa = dsa.reduce((a, b) => (a.value > b.value ? a : b))
  const improveDsa = dsa.reduce((a, b) => (a.value < b.value ? a : b))

  // Add evidence-based strengths/improvements from categories too
  if (perf.pathfinding.efficiency >= 100) strengths.push('Dijkstra-optimal route into the archive.')
  if (perf.mst.efficiency >= 100) strengths.push('Minimum-cost spanning tree — textbook Kruskal result.')
  if (perf.dp.efficiency >= 100) strengths.push('Knapsack-optimal extraction — maximum value under capacity.')
  if (perf.extraction.efficiency >= 100) strengths.push('Clean, Dijkstra-optimal escape.')

  const total = Math.min(
    TOTAL_MAX,
    categories.reduce((s, c) => s + c.earned, 0),
  )

  return {
    operator: summary.operator,
    success: summary.success,
    categories,
    dsa,
    total,
    max: TOTAL_MAX,
    grade: gradeFor(total),
    strengths,
    improvements,
    strongest: strongestDsa,
    improve: improveDsa,
  }
}

/** Compact algorithmic profile used by the results screen. */
export function algorithmicProfile(perf: HeistPerformance) {
  return {
    bfsEfficiency: perf.search.bfsEfficiency,
    dfsEfficiency: perf.search.dfsEfficiency,
    matchedStrategy: perf.search.matchedStrategy,
    pathfindingEfficiency: perf.pathfinding.efficiency,
    mstEfficiency: perf.mst.efficiency,
    dpEfficiency: perf.dp.efficiency,
    extractionEfficiency: perf.extraction.efficiency,
    average: Math.round(
      (perf.search.bfsEfficiency +
        perf.search.dfsEfficiency +
        perf.pathfinding.efficiency +
        perf.mst.efficiency +
        perf.dp.efficiency +
        perf.extraction.efficiency) /
        6,
    ),
  }
}