// @ts-nocheck
import type { AlgorithmType, Mission, MissionResult, ScoringConfig } from '@/types'
import { ALGORITHM_META } from '@/algorithms'

export interface ScoreBreakdown {
  score: number
  lines: Array<{ label: string; value: number; positive?: boolean }>
  efficiency: number
  optimal: boolean
}

/**
 * Compute a mission score from how the player performed.
 * Rewards speed, low exposure, optimal routes; penalizes wandering.
 */
export function computeScore(
  mission: Mission,
  opts: {
    timeMs: number
    pathCost: number
    nodesVisited: number
    exposure: number
    optimalCost: number
    optimalVisits: number
  },
): ScoreBreakdown {
  const cfg: ScoringConfig = mission.scoring
  const { pathCost, nodesVisited, exposure, optimalCost, optimalVisits } = opts

  const lines: Array<{ label: string; value: number; positive?: boolean }> = []
  let score = cfg.baseScore
  lines.push({ label: 'BASE SCORE', value: cfg.baseScore, positive: true })

  // Time bonus: full bonus if under half the limit, scaling down to zero.
  const timeRatio = Math.min(1, opts.timeMs / (cfg.timeLimitSeconds * 1000))
  const timeBonus = Math.max(0, Math.round(cfg.timeBonus * (1 - timeRatio)))
  score += timeBonus
  lines.push({ label: 'TIME BONUS', value: timeBonus, positive: timeBonus > 0 })

  // Exposure bonus: reward low exposure.
  const exposureRatio = Math.min(1, exposure / 100)
  const exposureBonus = Math.max(0, Math.round(cfg.lowExposureBonus * (1 - exposureRatio)))
  score += exposureBonus
  lines.push({ label: 'LOW EXPOSURE', value: exposureBonus, positive: exposureBonus > 0 })

  // Optimal route bonus.
  const pathIsOptimal = optimalCost > 0 && pathCost <= optimalCost
  if (pathIsOptimal) {
    score += cfg.optimalRouteBonus
    lines.push({ label: 'OPTIMAL ROUTE', value: cfg.optimalRouteBonus, positive: true })
  }

  // Penalty for unnecessary nodes visited beyond optimal.
  const extraNodes = Math.max(0, nodesVisited - optimalVisits)
  const penalty = Math.min(cfg.unnecessaryNodePenalty * 2, extraNodes * cfg.unnecessaryNodePenalty)
  if (penalty > 0) {
    score -= penalty
    lines.push({ label: `UNNECESSARY NODES (−${extraNodes})`, value: -penalty, positive: false })
  }

  const efficiency = Math.max(
    5,
    Math.round(
      (100 *
        ((cfg.efficiencyFactor * (1 - Math.min(1, timeRatio))) +
          (0.4 * (pathIsOptimal ? 1 : optimalCost ? Math.max(0, optimalCost / pathCost) : 0)))),
    ),
  )

  score = Math.max(0, score)

  return {
    score,
    lines,
    efficiency,
    optimal: pathIsOptimal,
  }
}

export function toMissionResult(
  mission: Mission,
  breakdown: ScoreBreakdown,
  opts: {
    timeMs: number
    pathCost: number
    nodesVisited: number
    exposure: number
    algorithm?: AlgorithmType
  },
): MissionResult {
  return {
    missionId: mission.id,
    completedAt: new Date().toISOString(),
    timeMs: opts.timeMs,
    pathCost: opts.pathCost,
    nodesVisited: opts.nodesVisited,
    exposure: opts.exposure,
    score: breakdown.score,
    algorithm: opts.algorithm ?? mission.algorithm,
    optimal: breakdown.optimal,
    efficiency: breakdown.efficiency,
  }
}

export function algorithmComplexityLabel(algo: AlgorithmType): string {
  return ALGORITHM_META[algo].time
}