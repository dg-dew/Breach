// ============================================================================
// BREACH — Single-heist store
// Persists the operator callsign and the live heist snapshot so a refresh
// resumes the run exactly where it left off. Results are rebuilt from the
// same snapshot — nothing is fabricated. Also persists best score and DSA
// performance records across runs.
// ============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HeistController } from '@/game/heist/HeistController'
import type { HeistSnapshot } from '@/game/heist/types'

interface HeistRecords {
  bestScore: number
  bestDsa: Record<string, number> // per-concept best values
  bestRoute: string[] | null
}

interface HeistState {
  operator: string
  snapshot: HeistSnapshot | null
  records: HeistRecords
  startHeist: (operator: string) => void
  setSnapshot: (snap: HeistSnapshot | null) => void
  clear: () => void
  recordResult: (total: number, dsa: Record<string, number>, playerPath: string[]) => void
}

export const useHeistStore = create<HeistState>()(
  persist(
    (set) => ({
      operator: '',
      snapshot: null,
      records: {
        bestScore: 0,
        bestDsa: {},
        bestRoute: null,
      },
      startHeist: (operator) => {
        const c = new HeistController(operator)
        set({ operator, snapshot: c.toSnapshot() })
      },
      setSnapshot: (snap) => set({ snapshot: snap }),
      clear: () => set({ operator: '', snapshot: null }),
      recordResult: (total, dsa, playerPath) =>
        set((state) => {
          const newRecords = { ...state.records }
          if (total > newRecords.bestScore) {
            newRecords.bestScore = total
            newRecords.bestRoute = playerPath?.length ? [...playerPath] : null
            newRecords.bestDsa = { ...dsa }
          }
          return { records: newRecords }
        }),
    }),
    {
      name: 'breach:heist',
      version: 2,
      // Migrate v1 snapshots: add missing fields
      migrate: (persistedState: any) => {
        const state = {
          operator: persistedState.operator || '',
          snapshot: persistedState.snapshot
            ? { ...persistedState.snapshot, phasesCompleted: persistedState.snapshot.phasesCompleted ?? 0 }
            : null,
          records: {
            bestScore: persistedState.records?.bestScore ?? 0,
            bestDsa: persistedState.records?.bestDsa ?? {},
            bestRoute: persistedState.records?.bestRoute ?? null,
          },
        }
        return state
      },
    },
  ),
)