import type { Gadget, GadgetId } from '@/types'

/**
 * Fictional field equipment. These modify game abstractions only —
 * there is no real-world hacking content anywhere in BREACH.
 */
export const GADGETS: Record<GadgetId, Gadget> = {
  routeAnalyzer: {
    id: 'routeAnalyzer',
    name: 'ROUTE ANALYZER',
    desc: 'Computes the lowest-exposure route across the discovered network.',
    cost: 4000,
    charges: 3,
    effect: 'Runs a weighted shortest-path scan (Dijkstra) and highlights the optimal route to the objective.',
  },
  deepScan: {
    id: 'deepScan',
    name: 'DEEP SCAN',
    desc: 'Pulses the local subnet and reveals undiscovered neighbouring nodes.',
    cost: 2500,
    charges: 3,
    effect: 'Runs a breadth-first sweep (BFS) outward from your position, unveiling nearby nodes layer by layer.',
  },
  ghostNode: {
    id: 'ghostNode',
    name: 'GHOST NODE',
    desc: 'A throwaway identity node that absorbs the next trace.',
    cost: 1800,
    charges: 2,
    effect: 'Drops exposure by 12% immediately.',
  },
  decoy: {
    id: 'decoy',
    name: 'DECOY',
    desc: 'A fake signal that diverts security away from you.',
    cost: 2200,
    charges: 2,
    effect: 'Reduces alert by 18% immediately.',
  },
  override: {
    id: 'override',
    name: 'OVERRIDE',
    desc: 'Forces a locked/blocked route open once.',
    cost: 3000,
    charges: 2,
    effect: 'Unblocks one locked corridor for the rest of the operation.',
  },
  traceBreaker: {
    id: 'traceBreaker',
    name: 'TRACE BREAKER',
    desc: 'Cuts an active trace before it reaches you.',
    cost: 3500,
    charges: 2,
    effect: 'Wipes 25% of alert and clears the current lockdown surge.',
  },
}

export const GADGET_LIST: Gadget[] = Object.values(GADGETS)

export const STARTING_GADGETS: GadgetId[] = ['decoy']

export function getGadget(id: GadgetId): Gadget {
  return GADGETS[id]
}
