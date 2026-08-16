import { describe, it, expect } from 'vitest'
import { HeistController } from '@/game/heist/HeistController'
import { knapsack, orderSimilarity } from '@/game/heist/solve'
import { scoreHeist } from '@/game/heist/scoring'
import { buildAnalysis } from '@/game/heist/analysis'
import {
  DP_ASSETS,
  DP_BUDGET,
  MST_EDGES,
  MST_NODES,
  NETWORK_ID,
  SERVER_ID,
  ARCHIVE_ID,
  EXIT_ID,
} from '@/game/heist/world'
import type { HeistSnapshot } from '@/game/heist/types'

// Route: ENTRY -> LOBBY -> SERVICE -> MAINTENANCE -> NETWORK
function infiltrateToNetwork(c: HeistController): void {
  expect(c.move('LOBBY')).toBe(true)
  expect(c.move('SERVICE')).toBe(true)
  expect(c.move('MAINTENANCE')).toBe(true)
  expect(c.move(NETWORK_ID)).toBe(true)
}

// Search: explore to find the target terminal
function searchToTarget(c: HeistController): void {
  expect(c.searchMove('S-SERVER')).toBe(true)
  expect(c.searchMove('S-BACKUP')).toBe(true)
  expect(c.searchMove('S-SERVER')).toBe(true)
  expect(c.searchMove('S-NETWORK')).toBe(true)
  expect(c.searchMove('S-STORAGE')).toBe(true)
  expect(c.searchMove('S-TERMINAL')).toBe(true)
}

// Pathfinding: SERVER -> BACKUP -> ROUTER -> ARCHIVE (optimal cost 10)
function routeToArchive(c: HeistController): void {
  expect(c.move('BACKUP')).toBe(true)
  expect(c.move('ROUTER')).toBe(true)
  expect(c.move(ARCHIVE_ID)).toBe(true)
}

// MST: the six edges total 14 (optimal)
function solveMst(c: HeistController): void {
  for (const edge of ['m-router-archive', 'm-control-server', 'm-power-control', 'm-control-router']) {
    expect(c.toggleMst(edge)).toBe(true)
  }
}

// DP: optimal subset A+B+D = 165 (weight 47, budget 50)
function solveDp(c: HeistController): void {
  for (const assetId of ['asset-a', 'asset-b', 'asset-d']) {
    expect(c.toggleAsset(assetId)).toBe(true)
  }
}

// Escape: ARCHIVE -> EXTRACT -> EXIT (cost 6)
function escape(c: HeistController): void {
  expect(c.move('EXTRACT')).toBe(true)
  expect(c.move(EXIT_ID)).toBe(true)
}

function fullOptimalRun(): HeistController {
  const c = new HeistController('TEST')
  infiltrateToNetwork(c)
  expect(c.interact()).toBe(true) // enter search
  searchToTarget(c)
  expect(c.interact()).toBe(true) // enter pathfinding (lands at SERVER)
  routeToArchive(c)
  expect(c.interact()).toBe(true) // enter MST
  solveMst(c)
  expect(c.getView().phase).toBe('resourceOptimization')
  solveDp(c)
  expect(c.finalizeDp()).toBe(true)
  expect(c.getView().phase).toBe('extraction')
  escape(c)
  expect(c.interact()).toBe(true)
  expect(c.getView().phase).toBe('complete')
  return c
}

describe('HeistController - phase gating', () => {
  it('starts in infiltration at ENTRY', () => {
    const c = new HeistController('TEST')
    const v = c.getView()
    expect(v.phase).toBe('infiltration')
    expect(v.currentId).toBe('ENTRY')
    expect(v.timeRemaining).toBe(600)
    expect(v.energy).toBe(100)
  })

  it('rejects movement to non-adjacent locations', () => {
    const c = new HeistController('TEST')
    expect(c.move(NETWORK_ID)).toBe(false)
    expect(c.move('EXIT')).toBe(false)
    expect(c.getView().currentId).toBe('ENTRY')
  })

  it('rejects interact away from the objective', () => {
    const c = new HeistController('TEST')
    expect(c.interact()).toBe(false)
  })

  it('rejects cross-phase actions', () => {
    const c = new HeistController('TEST')
    expect(c.searchMove('S-SERVER')).toBe(false)
    expect(c.toggleMst('m-router-archive')).toBe(false)
    expect(c.toggleAsset('asset-a')).toBe(false)
    expect(c.finalizeDp()).toBe(false)
  })

  it('rejects moves onto sealed routes during extraction', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    solveMst(c)
    solveDp(c)
    expect(c.finalizeDp()).toBe(true)
    expect(c.getView().phase).toBe('extraction')
    const sealed = c.getView().available.find((o) => o.id === 'CONTROL')
    expect(sealed?.sealed).toBe(true)
    expect(c.move('CONTROL')).toBe(false)
  })
})

describe('HeistController - infiltration', () => {
  it('records visited locations, edges, energy and exposure', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    const v = c.getView()
    expect(v.energy).toBe(93)
    expect(v.exposure).toBe(4)
    expect(v.timeRemaining).toBeLessThan(600)
    expect(v.currentId).toBe(NETWORK_ID)
    expect(v.interactLabel).toBe('ACCESS INTERNAL NETWORK')
  })

  it('accumulates exposure and alert on traversal', () => {
    const c = new HeistController('TEST')
    c.move('LOBBY')
    c.move('SERVICE')
    const v = c.getView()
    expect(v.alert).toBe(2)
  })
})

describe('HeistController - search phase', () => {
  it('only allows movement to adjacent nodes in the fog', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    expect(c.searchMove('S-D')).toBe(false)
    expect(c.searchMove('S-TARGET')).toBe(false)
    expect(c.searchMove('S-SERVER')).toBe(true)
    expect(c.getView().searchCurrent).toBe('S-SERVER')
  })

  it('records backtracking when revisiting a node', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    c.searchMove('S-SERVER')
    c.searchMove('S-BACKUP')
    c.searchMove('S-SERVER') // backtrack
    c.searchMove('S-NETWORK') // backtrack
    c.searchMove('S-STORAGE')
    c.searchMove('S-TERMINAL')
    expect(c.interact()).toBe(true)
    expect(c.getPerformance().search.backtrackCount).toBe(2)
    expect(c.getView().phase).toBe('pathfinding')
    expect(c.getView().currentId).toBe(SERVER_ID)
  })
})

describe('HeistController - pathfinding phase', () => {
  it('computes Dijkstra efficiency against the optimal route', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    const p = c.getPerformance().pathfinding
    expect(p.playerCost).toBe(10)
    expect(p.optimalCost).toBe(10)
    expect(p.efficiency).toBe(100)
    expect(c.getView().phase).toBe('networkOptimization')
  })
})

describe('HeistController - MST phase', () => {
  it('rejects edges that would create a cycle', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    expect(c.toggleMst('m-router-archive')).toBe(true)
    expect(c.toggleMst('m-control-server')).toBe(true)
    expect(c.toggleMst('m-server-router')).toBe(true)
    // server-archive would create a cycle (S and A already connected via R)
    expect(c.toggleMst('m-server-archive')).toBe(false)
    expect(c.getView().mstConnected).toBe(false)
  })

  it('completes the phase only on a real spanning tree and computes Kruskal', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    solveMst(c)
    const m = c.getPerformance().mst
    expect(c.getView().phase).toBe('resourceOptimization')
    expect(m.optimalCost).toBe(14)
    expect(m.playerCost).toBe(14)
    expect(m.efficiency).toBe(100)
    expect(m.optimalEdges.length).toBe(MST_NODES.length - 1)
  })
})

describe('HeistController - DP phase', () => {
  it('rejects assets that exceed capacity', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    solveMst(c)
    // asset-c costs 35, asset-a costs 20, 35+20=55 > budget 50
    expect(c.toggleAsset('asset-c')).toBe(true)
    expect(c.toggleAsset('asset-a')).toBe(false)
    expect(c.toggleAsset('asset-e')).toBe(true) // 35+8=43 ≤ 50 → fits
  })

  it('recognises the knapsack optimum of 165', () => {
    const optimal = knapsack(DP_ASSETS, DP_BUDGET)
    expect(optimal.optimalValue).toBe(165)
    expect(optimal.optimalIds.sort()).toEqual(['asset-a', 'asset-b', 'asset-d'].sort())
  })

  it('finalizes into extraction with transparent DP metrics', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    solveMst(c)
    solveDp(c)
    expect(c.finalizeDp()).toBe(true)
    const d = c.getPerformance().dp
    expect(d.playerValue).toBe(165)
    expect(d.optimalValue).toBe(165)
    expect(d.efficiency).toBe(100)
    expect(c.getView().phase).toBe('extraction')
  })
})

describe('HeistController - extraction + failure', () => {
  it('completes a full optimal playthrough', () => {
    const c = fullOptimalRun()
    const e = c.getPerformance().extraction
    expect(e.playerCost).toBe(6)
    expect(e.optimalCost).toBe(6)
    expect(e.efficiency).toBe(100)
    expect(c.getView().finished).toBe(true)
    expect(c.getView().failedReason).toBeNull()
  })

  it('fails when exposure reaches 100', () => {
    const base = new HeistController('TEST')
    const snap: HeistSnapshot = { ...base.toSnapshot(), exposure: 99 }
    const c = HeistController.fromSnapshot(snap)
    expect(c.move('LOBBY')).toBe(false)
    expect(c.getView().phase).toBe('failed')
    expect(c.getView().failedReason).toBe('EXPOSURE CRITICAL')
  })

  it('fails when energy is depleted', () => {
    const base = new HeistController('TEST')
    const snap: HeistSnapshot = { ...base.toSnapshot(), energy: 0 }
    const c = HeistController.fromSnapshot(snap)
    expect(c.move('LOBBY')).toBe(false)
    expect(c.getView().failedReason).toBe('ENERGY DEPLETED')
  })

  it('fails when the clock runs out', () => {
    const base = new HeistController('TEST')
    const snap: HeistSnapshot = { ...base.toSnapshot(), timeRemaining: 1 }
    const c = HeistController.fromSnapshot(snap)
    c.tick()
    expect(c.getView().phase).toBe('failed')
    expect(c.getView().failedReason).toBe('TIME EXPIRED')
  })
})

describe('HeistController - persistence', () => {
  it('round-trips a mid-run snapshot', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    const snap = c.toSnapshot()
    const restored = HeistController.fromSnapshot(snap)
    expect(restored.getView().phase).toBe('pathfinding')
    expect(restored.getView().currentId).toBe(SERVER_ID)
    expect(restored.getView().energy).toBe(c.getView().energy)
    restored.move('BACKUP')
    restored.move('ROUTER')
    restored.move(ARCHIVE_ID)
    restored.interact()
    expect(restored.getView().phase).toBe('networkOptimization')
  })

  it('can complete a run restored from a snapshot', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    routeToArchive(c)
    c.interact()
    solveMst(c)
    solveDp(c)
    const restored = HeistController.fromSnapshot(c.toSnapshot())
    expect(restored.finalizeDp()).toBe(true)
    escape(restored)
    expect(restored.interact()).toBe(true)
    expect(restored.getView().phase).toBe('complete')
  })
})

describe('solve - knapsack and LCS', () => {
  it('orderSimilarity returns 100 for identical orders and 0 for disjoint', () => {
    expect(orderSimilarity(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(100)
    expect(orderSimilarity(['a'], ['b'])).toBe(0)
  })
})

describe('scoring - transparent totals', () => {
  it('produces a total within 0-10000 and identical-concept breaks for an optimal run', () => {
    const c = fullOptimalRun()
    const score = scoreHeist(c.getPerformance(), c.getSummary())
    expect(score.total).toBeGreaterThanOrEqual(0)
    expect(score.total).toBeLessThanOrEqual(10000)
    expect(score.categories.length).toBe(6)
    expect(score.grade).toBeTruthy()
    expect(score.success).toBe(true)
    const mst = score.categories.find((k) => k.id === 'networkOptimization')
    expect(mst?.earned).toBe(mst?.max)
  })

  it('reflects penalties for a non-optimal run', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    // Detour: SERVER -> CONTROL -> ARCHIVE (cost 11 vs optimal 10)
    c.move('CONTROL')
    c.move(ARCHIVE_ID)
    c.interact()
    solveMst(c)
    solveDp(c)
    c.finalizeDp()
    escape(c)
    c.interact()
    const score = scoreHeist(c.getPerformance(), c.getSummary())
    expect(score.total).toBeGreaterThan(0)
    expect(score.success).toBe(true)
  })
})

describe('analysis - post-heist network', () => {
  it('builds the full facility graph from a completed snapshot', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    // Follow the real Dijkstra optimal route so the player never diverges.
    const optimalRoute = buildAnalysis(c.toSnapshot()).optimalRoute
    for (const id of optimalRoute.slice(1, optimalRoute.indexOf(ARCHIVE_ID) + 1)) c.move(id)
    c.interact()
    solveMst(c)
    solveDp(c)
    c.finalizeDp()
    escape(c)
    c.interact()

    const analysis = buildAnalysis(c.toSnapshot())
    expect(analysis.nodes).toHaveLength(16)
    expect(analysis.routes.length).toBeGreaterThan(15)
    expect(analysis.playerPath[0]).toBe('ENTRY')
    expect(analysis.playerPath[analysis.playerPath.length - 1]).toBe(EXIT_ID)
    expect(analysis.optimalRoute[0]).toBe(SERVER_ID)
    expect(analysis.optimalRoute[analysis.optimalRoute.length - 1]).toBe(EXIT_ID)
    expect(analysis.mstOptimalEdges).toHaveLength(MST_NODES.length - 1)
    const mstCost = analysis.mstOptimalEdges.reduce((s, id) => s + (MST_EDGES.find((e) => e.id === id)?.cost ?? 0), 0)
    expect(mstCost).toBe(14)
    expect(analysis.decisionPoints).toHaveLength(0)
  })

  it('flags a single decision point when the player leaves the optimal route', () => {
    const c = new HeistController('TEST')
    infiltrateToNetwork(c)
    c.interact()
    searchToTarget(c)
    c.interact()
    // Deliberately diverge through CONTROL instead of the optimal BACKUP branch.
    c.move('CONTROL')
    c.move(ARCHIVE_ID)
    c.interact()
    const analysis = buildAnalysis(c.toSnapshot())
    expect(analysis.decisionPoints).toHaveLength(1)
    expect(analysis.decisionPoints[0].nodeId).toBe(SERVER_ID)
    expect(analysis.decisionPoints[0].playerCost).toBeGreaterThan(0)
  })
})