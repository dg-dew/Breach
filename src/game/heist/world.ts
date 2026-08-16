// ============================================================================
// BREACH — MISSION: BLACK VAULT
// One authored facility map (16 locations) plus the internal search network,
// the damaged power network (MST), and the recoverable data assets (DP).
// ============================================================================

import type { LocationKind } from '@/game/world/Location'
import type { Asset, HeistPhase, MstEdge, SearchEdge, SearchNode } from './types'

export interface FacilityLocation {
  id: string
  name: string
  kind: LocationKind
  security: number
  description: string
  decoy?: boolean
}

export interface FacilityRoute {
  id: string
  from: string
  to: string
  /** Energy spent to traverse. */
  cost: number
  /** Seconds of clock time consumed. */
  timeSec: number
  /** Exposure gained on arrival. */
  exposure: number
  /** Alert gained on arrival. */
  alert: number
  /** 0–100 display risk. */
  risk: number
  /** Sealed from this phase onward (network damaged). */
  sealedAfter?: HeistPhase
  /** Becomes extra dangerous during final extraction. */
  dangerousDuringExtraction?: boolean
  /** Only available from this phase onward (escape routes). */
  opensOn?: HeistPhase
}

export const ENTRY_ID = 'ENTRY'
export const LOBBY_ID = 'LOBBY'
export const NETWORK_ID = 'NETWORK'
export const SERVER_ID = 'SERVER'
export const ARCHIVE_ID = 'ARCHIVE'
export const EXTRACT_ID = 'EXTRACT'
export const EXIT_ID = 'EXIT'

export const FACILITY_LOCATIONS: FacilityLocation[] = [
  { id: 'ENTRY', name: 'ENTRY GATE', kind: 'entry', security: 10, description: 'Ventilation breach point.' },
  { id: 'LOBBY', name: 'SECURITY LOBBY', kind: 'lobby', security: 20, description: 'Reception floor with three corridors.' },
  { id: 'SECURITY', name: 'SECURITY POST', kind: 'security', security: 70, description: 'Guarded checkpoint corridor.' },
  { id: 'CHECKPOINT', name: 'GUARD CHECKPOINT', kind: 'security', security: 85, description: 'Heavily monitored junction.' },
  { id: 'SERVICE', name: 'SERVICE CORRIDOR', kind: 'service', security: 35, description: 'Quiet maintenance wing.' },
  { id: 'STORAGE', name: 'STORAGE', kind: 'storage', security: 30, description: 'Dead-end supply room.' },
  { id: 'MAINTENANCE', name: 'MAINTENANCE', kind: 'maintenance', security: 40, description: 'Ducts and ladder access.' },
  { id: 'NETWORK', name: 'NETWORK ACCESS ROOM', kind: 'control', security: 60, description: 'The internal network backbone.' },
  { id: 'SERVER', name: 'SERVER ROOM', kind: 'server', security: 75, description: 'Rack rows toward the archive.' },
  { id: 'POWER', name: 'POWER NODE', kind: 'maintenance', security: 55, description: 'Backup power junction.' },
  { id: 'CONTROL', name: 'CONTROL ROOM', kind: 'control', security: 80, description: 'Central monitoring hub.' },
  { id: 'ROUTER', name: 'DATA ROUTER', kind: 'workshop', security: 50, description: 'Unmonitored routing core.' },
  { id: 'BACKUP', name: 'BACKUP SERVER', kind: 'server', security: 70, description: 'Secondary storage stack.' },
  { id: 'ARCHIVE', name: 'ARCHIVE CHAMBER', kind: 'archive', security: 90, description: 'The target data.' },
  { id: 'EXTRACT', name: 'EXTRACTION TUNNEL', kind: 'corridor', security: 30, description: 'Service tunnel to the exit.' },
  { id: 'EXIT', name: 'EXIT', kind: 'exit', security: 20, description: 'The way out.' },
]

export const FACILITY_ROUTES: FacilityRoute[] = [
  { id: 'en-lobby', from: 'ENTRY', to: 'LOBBY', cost: 1, timeSec: 6, exposure: 1, alert: 1, risk: 15 },
  { id: 'lobby-security', from: 'LOBBY', to: 'SECURITY', cost: 2, timeSec: 5, exposure: 3, alert: 5, risk: 40 },
  { id: 'lobby-service', from: 'LOBBY', to: 'SERVICE', cost: 1, timeSec: 6, exposure: 1, alert: 1, risk: 10 },
  { id: 'service-storage', from: 'SERVICE', to: 'STORAGE', cost: 1, timeSec: 4, exposure: 1, alert: 1, risk: 10 },
  { id: 'service-maintenance', from: 'SERVICE', to: 'MAINTENANCE', cost: 2, timeSec: 7, exposure: 1, alert: 1, risk: 25 },
  { id: 'maintenance-network', from: 'MAINTENANCE', to: 'NETWORK', cost: 3, timeSec: 9, exposure: 1, alert: 1, risk: 20 },
  { id: 'security-checkpoint', from: 'SECURITY', to: 'CHECKPOINT', cost: 2, timeSec: 5, exposure: 4, alert: 8, risk: 70 },
  { id: 'security-network', from: 'SECURITY', to: 'NETWORK', cost: 2, timeSec: 6, exposure: 2, alert: 3, risk: 30 },
  { id: 'network-server', from: 'NETWORK', to: 'SERVER', cost: 2, timeSec: 6, exposure: 2, alert: 2, risk: 20 },
  { id: 'server-control', from: 'SERVER', to: 'CONTROL', cost: 4, timeSec: 8, exposure: 2, alert: 2, risk: 25 },
  { id: 'server-power', from: 'SERVER', to: 'POWER', cost: 2, timeSec: 5, exposure: 1, alert: 1, risk: 10 },
  { id: 'server-backup', from: 'SERVER', to: 'BACKUP', cost: 5, timeSec: 10, exposure: 2, alert: 2, risk: 25 },
  { id: 'control-router', from: 'CONTROL', to: 'ROUTER', cost: 6, timeSec: 11, exposure: 3, alert: 4, risk: 35 },
  { id: 'power-router', from: 'POWER', to: 'ROUTER', cost: 8, timeSec: 14, exposure: 4, alert: 5, risk: 40 },
  { id: 'backup-router', from: 'BACKUP', to: 'ROUTER', cost: 2, timeSec: 5, exposure: 1, alert: 1, risk: 10 },
  { id: 'router-archive', from: 'ROUTER', to: 'ARCHIVE', cost: 3, timeSec: 7, exposure: 2, alert: 2, risk: 15 },
  { id: 'control-archive', from: 'CONTROL', to: 'ARCHIVE', cost: 7, timeSec: 9, exposure: 5, alert: 7, risk: 45, sealedAfter: 'extraction' },
  { id: 'archive-extract', from: 'ARCHIVE', to: 'EXTRACT', cost: 4, timeSec: 10, exposure: 5, alert: 8, risk: 60, dangerousDuringExtraction: true },
  { id: 'extract-exit', from: 'EXTRACT', to: 'EXIT', cost: 2, timeSec: 6, exposure: 2, alert: 2, risk: 20 },
  { id: 'maintenance-archive', from: 'MAINTENANCE', to: 'ARCHIVE', cost: 2, timeSec: 7, exposure: 1, alert: 2, risk: 20, opensOn: 'extraction' },
  { id: 'maintenance-extract', from: 'MAINTENANCE', to: 'EXTRACT', cost: 3, timeSec: 8, exposure: 1, alert: 1, risk: 15, opensOn: 'extraction' },
]

// ---------------------------------------------------------------------------
// Phase 2 — internal search network (partially hidden, fogged)
// ---------------------------------------------------------------------------

export const SEARCH_NODES: SearchNode[] = [
  { id: 'S-NETWORK', name: 'NETWORK CORE', depth: 0 },
  { id: 'S-SERVER', name: 'SERVER BRANCH', depth: 1 },
  { id: 'S-CONTROL', name: 'CONTROL BRANCH', depth: 1 },
  { id: 'S-STORAGE', name: 'STORAGE BRANCH', depth: 1 },
  { id: 'S-BACKUP', name: 'BACKUP NODE', depth: 2 },
  { id: 'S-POWER', name: 'POWER NODE', depth: 2 },
  { id: 'S-SECURITY', name: 'SECURITY NODE', depth: 2 },
  { id: 'S-TERMINAL', name: 'ACCESS TERMINAL', depth: 2, isTarget: true },
  { id: 'S-CABLE', name: 'CABLE LINE', depth: 3 },
  { id: 'S-RELAY', name: 'RELAY LINE', depth: 3 },
  { id: 'S-LOGS', name: 'LOG FILE', depth: 3 },
]

export const SEARCH_EDGES: SearchEdge[] = [
  { id: 'se-network-server', from: 'S-NETWORK', to: 'S-SERVER' },
  { id: 'se-network-control', from: 'S-NETWORK', to: 'S-CONTROL' },
  { id: 'se-network-storage', from: 'S-NETWORK', to: 'S-STORAGE' },
  { id: 'se-server-backup', from: 'S-SERVER', to: 'S-BACKUP' },
  { id: 'se-server-power', from: 'S-SERVER', to: 'S-POWER' },
  { id: 'se-control-security', from: 'S-CONTROL', to: 'S-SECURITY' },
  { id: 'se-storage-terminal', from: 'S-STORAGE', to: 'S-TERMINAL' },
  { id: 'se-backup-cable', from: 'S-BACKUP', to: 'S-CABLE' },
  { id: 'se-power-relay', from: 'S-POWER', to: 'S-RELAY' },
  { id: 'se-security-logs', from: 'S-SECURITY', to: 'S-LOGS' },
]

export const SEARCH_START = 'S-NETWORK'
export const SEARCH_TARGET = 'S-TERMINAL'

// ---------------------------------------------------------------------------
// Phase 4 — damaged power network (MST puzzle)
// ---------------------------------------------------------------------------

export const MST_NODES = ['POWER', 'CONTROL', 'SERVER', 'ROUTER', 'ARCHIVE']

export const MST_EDGES: MstEdge[] = [
  { id: 'm-power-control', from: 'POWER', to: 'CONTROL', cost: 4 },
  { id: 'm-power-server', from: 'POWER', to: 'SERVER', cost: 7 },
  { id: 'm-control-server', from: 'CONTROL', to: 'SERVER', cost: 3 },
  { id: 'm-control-router', from: 'CONTROL', to: 'ROUTER', cost: 5 },
  { id: 'm-server-router', from: 'SERVER', to: 'ROUTER', cost: 6 },
  { id: 'm-server-archive', from: 'SERVER', to: 'ARCHIVE', cost: 9 },
  { id: 'm-router-archive', from: 'ROUTER', to: 'ARCHIVE', cost: 2 },
]

// ---------------------------------------------------------------------------
// Phase 5 — recoverable data assets (DP knapsack)
// ---------------------------------------------------------------------------

export const DP_BUDGET = 50

export const DP_ASSETS: Asset[] = [
  { id: 'asset-a', name: 'ARCHIVE A', value: 70, cost: 20 },
  { id: 'asset-b', name: 'ARCHIVE B', value: 40, cost: 12 },
  { id: 'asset-c', name: 'ARCHIVE C', value: 90, cost: 35 },
  { id: 'asset-d', name: 'ARCHIVE D', value: 55, cost: 15 },
  { id: 'asset-e', name: 'ARCHIVE E', value: 30, cost: 8 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const locationById = new Map(FACILITY_LOCATIONS.map((l) => [l.id, l]))

export function locationName(id: string): string {
  return locationById.get(id)?.name ?? id
}

export function routeBetweenFacility(a: string, b: string): FacilityRoute | null {
  return FACILITY_ROUTES.find((r) => (r.from === a && r.to === b) || (r.from === b && r.to === a)) ?? null
}

/** Adjacency list (route entries) for a location. */
export function facilityAdjacency(id: string): FacilityRoute[] {
  return FACILITY_ROUTES.filter((r) => r.from === id || r.to === id)
}

export function searchAdjacency(id: string): SearchEdge[] {
  return SEARCH_EDGES.filter((e) => e.from === id || e.to === id)
}

export function searchNode(id: string): SearchNode {
  return SEARCH_NODES.find((n) => n.id === id) ?? SEARCH_NODES[0]
}

export function mstEdge(id: string): MstEdge | null {
  return MST_EDGES.find((e) => e.id === id) ?? null
}

export function asset(id: string): Asset | null {
  return DP_ASSETS.find((a) => a.id === id) ?? null
}

export const PHASE_INDEX: Record<HeistPhase, number> = {
  infiltration: 0,
  search: 1,
  pathfinding: 2,
  networkOptimization: 3,
  resourceOptimization: 4,
  extraction: 5,
  complete: 6,
  failed: 7,
}