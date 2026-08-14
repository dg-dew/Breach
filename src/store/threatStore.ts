import { create } from 'zustand'
import type { GameEvent, GameEventType } from '@/types'

interface ThreatState {
  alertLevel: number
  isLockdown: boolean
  lockdownIntensity: number
  events: GameEvent[]
  maxAlert: number

  addAlert: (delta: number, source: string, type?: GameEventType) => void
  reduceAlert: (delta: number, source: string) => void
  triggerLockdown: () => void
  resolveLockdown: () => void
  escalateLockdown: () => void
  addEvent: (event: Omit<GameEvent, 'id' | 'ts'>) => void
  clearEvents: () => void
  resetThreat: () => void
}

export const useThreatStore = create<ThreatState>((set, get) => ({
  alertLevel: 0,
  isLockdown: false,
  lockdownIntensity: 0,
  events: [],
  maxAlert: 100,

  addAlert: (delta, source, type = 'trace') => {
    const { alertLevel, isLockdown, maxAlert } = get()
    const newAlert = Math.min(maxAlert, alertLevel + delta)
    const lockdownTriggered = newAlert >= maxAlert && !isLockdown

    set({
      alertLevel: newAlert,
      isLockdown: lockdownTriggered,
      lockdownIntensity: lockdownTriggered ? 1 : get().lockdownIntensity,
    })

    if (lockdownTriggered) {
      get().triggerLockdown()
    } else {
      get().addEvent({
        type,
        message: `${source} — Alert +${delta}%`,
        delta,
      })
    }
  },

  reduceAlert: (delta, source) => {
    const { alertLevel } = get()
    const newAlert = Math.max(0, alertLevel - delta)

    set({ alertLevel: newAlert })

    get().addEvent({
      type: 'info',
      message: `${source} — Alert -${delta}%`,
      delta: -delta,
    })

    // Auto-resolve lockdown if alert drops below threshold
    if (newAlert < 80 && get().isLockdown) {
      get().resolveLockdown()
    }
  },

  triggerLockdown: () => {
    set({ isLockdown: true, lockdownIntensity: 1 })
    get().addEvent({
      type: 'lockdown',
      message: 'LOCKDOWN INITIATED — Security grid activated. Routes sealing.',
      delta: 0,
    })
  },

  resolveLockdown: () => {
    set({ isLockdown: false, lockdownIntensity: 0 })
    get().addEvent({
      type: 'info',
      message: 'Lockdown resolved. Security systems returning to standby.',
      delta: 0,
    })
  },

  escalateLockdown: () => {
    const { lockdownIntensity } = get()
    const newIntensity = Math.min(3, lockdownIntensity + 1)
    set({ lockdownIntensity: newIntensity })
    get().addEvent({
      type: 'lockdown',
      message: `Lockdown escalated to level ${newIntensity}`,
      delta: 0,
    })
  },

  addEvent: (event) => {
    const { events } = get()
    const newEvent: GameEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
    }
    set({ events: [newEvent, ...events].slice(0, 100) })
  },

  clearEvents: () => set({ events: [] }),

  resetThreat: () =>
    set({
      alertLevel: 0,
      isLockdown: false,
      lockdownIntensity: 0,
      events: [],
      maxAlert: 100,
    }),
}))