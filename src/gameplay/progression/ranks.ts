import type { OperatorRank } from '@/types'

export const RANKS: OperatorRank[] = [
  'INITIATE',
  'SCOUT',
  'RUNNER',
  'GHOST',
  'OPERATIVE',
  'ARCHITECT',
]

export const RANK_LABEL: Record<OperatorRank, string> = {
  INITIATE: 'INITIATE',
  SCOUT: 'SCOUT',
  RUNNER: 'RUNNER',
  GHOST: 'GHOST',
  OPERATIVE: 'OPERATIVE',
  ARCHITECT: 'ARCHITECT',
}

/** Reputation thresholds required to reach each rank. */
export const RANK_REPUTATION: Record<OperatorRank, number> = {
  INITIATE: 0,
  SCOUT: 800,
  RUNNER: 2400,
  GHOST: 6000,
  OPERATIVE: 14000,
  ARCHITECT: 28000,
}

export function rankIndex(rank: OperatorRank): number {
  return RANKS.indexOf(rank)
}

export function nextRank(rank: OperatorRank): OperatorRank | null {
  const i = RANKS.indexOf(rank)
  return i >= 0 && i < RANKS.length - 1 ? RANKS[i + 1] : null
}

/** Given accumulated reputation, return the highest rank earned. */
export function rankForReputation(reputation: number): OperatorRank {
  let current: OperatorRank = 'INITIATE'
  for (const rank of RANKS) {
    if (reputation >= RANK_REPUTATION[rank]) current = rank
    else break
  }
  return current
}

export function reputationProgress(rank: OperatorRank, reputation: number): number {
  const current = RANK_REPUTATION[rank]
  const next = nextRank(rank)
  if (!next) return 100
  const nextReq = RANK_REPUTATION[next]
  if (nextReq <= current) return 100
  return Math.max(
    0,
    Math.min(100, Math.round(((reputation - current) / (nextReq - current)) * 100)),
  )
}
