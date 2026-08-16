// ============================================================================
// BREACH — New gameplay world model
// The player experiences a location-based heist, not a graph visualizer.
// A MissionMap is a small authored world: locations connected by routes with
// real consequences. The DSA engine operates underneath for analysis only.
// ============================================================================

import type { DSAConcept } from '@/types'

export type LocationKind =
  | 'entry'
  | 'lobby'
  | 'corridor'
  | 'security'
  | 'service'
  | 'server'
  | 'archive'
  | 'vault'
  | 'control'
  | 'storage'
  | 'maintenance'
  | 'workshop'
  | 'terminal'
  | 'exit'

/** A location the player can stand in. */
export interface LocationSpec {
  id: string
  name: string
  kind: LocationKind
  /** 0–100 security rating shown on the card. */
  security: number
  /** One-line flavor shown on the card / intel feed. */
  description: string
  /** Decoy locations raise alert + exposure when entered. */
  decoy?: boolean
}

/** A route between two locations. Moving along it always costs something. */
export interface RouteSpec {
  id: string
  from: string
  to: string
  /** Energy spent to traverse. */
  cost: number
  /** Seconds of time consumed. */
  timeSec: number
  /** Exposure gained on arrival. */
  exposure: number
  /** Alert gained on arrival. */
  alert: number
  /** 0–100 display risk for the route preview. */
  risk: number
  /** Opens only after the objective is acquired. */
  opensOnObjective?: boolean
  /** Closes after the objective is acquired. */
  closesOnObjective?: boolean
}

/** An ambient narrative event that can fire during play. */
export interface AmbientEvent {
  message: string
  /** Optional alert swing applied when the event fires. */
  alertDelta?: number
}

/** One step of the mission progression timeline. */
export interface StageDef {
  id: string
  title: string
  /** One-line description shown under the stage title. */
  shortDescription: string
  /** Checklist label used in the objectives list. */
  checklistLabel: string
  /** The real gameplay condition that completes this stage. */
  trigger: 'move' | 'locate' | 'secure' | 'extract'
}

export interface MissionMap {
  id: string
  title: string
  codename: string
  concept: DSAConcept
  difficulty: string
  objective: string
  timeLimitSec: number
  energyBudget: number
  startingAlert: number
  startingExposure: number
  entryId: string
  objectiveId: string
  exitId: string
  locations: LocationSpec[]
  routes: RouteSpec[]
  /** Random ambient feed events that keep the world feeling alive. */
  ambient?: AmbientEvent[]
  /** Optional authored progression timeline. Defaults to a 4-stage template. */
  stageTemplate?: StageDef[]
}
