import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OperatorProfile, OperatorArchetype, DSAConceptProfile, ActPerformance, MissionPerformance } from '@/types'
import { rankForReputation } from '@/gameplay/progression/ranks'

interface PlayerState {
  profile: OperatorProfile | null
  isInitialized: boolean
  initialize: (callsign: string) => void
  updateProfile: (updates: Partial<OperatorProfile>) => void
  addCredits: (amount: number) => void
  addReputation: (amount: number) => void
  recordMissionPerformance: (performance: MissionPerformance) => void
  updateDSAProficiency: (concept: DSAConceptProfile) => void
  updateActPerformance: (act: ActPerformance) => void
  recalculateArchetype: () => void
  resetPlayer: () => void
}

const initialProfile: OperatorProfile = {
  callsign: '',
  rank: 'INITIATE',
  reputation: 0,
  credits: 0,
  completedOps: 0,
  failedOps: 0,
  totalPlayTimeMs: 0,
  bestScores: {},
  equipment: [],
  activeGadgets: [],
  archetype: null,
  created: new Date().toISOString(),
  finishedCampaign: false,
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      profile: null,
      isInitialized: false,

      initialize: (callsign: string) => {
        const profile: OperatorProfile = {
          ...initialProfile,
          callsign,
        }
        set({ profile, isInitialized: true })
      },

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      addCredits: (amount) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, credits: state.profile.credits + amount }
            : null,
        })),

      addReputation: (amount) =>
        set((state) => {
          if (!state.profile) return {}
          const newRep = state.profile.reputation + amount
          const newRank = rankForReputation(newRep)
          return {
            profile: {
              ...state.profile,
              reputation: newRep,
              rank: newRank,
            },
          }
        }),

      recordMissionPerformance: (performance) =>
        set((state) => {
          if (!state.profile) return {}
          const isSuccess = performance.success
          return {
            profile: {
              ...state.profile,
              completedOps: isSuccess
                ? state.profile.completedOps + 1
                : state.profile.completedOps,
              failedOps: isSuccess
                ? state.profile.failedOps
                : state.profile.failedOps + 1,
              totalPlayTimeMs: state.profile.totalPlayTimeMs + performance.timeMs,
              bestScores: {
                ...state.profile.bestScores,
                [performance.missionId]: Math.max(
                  state.profile.bestScores[performance.missionId] ?? 0,
                  performance.score
                ),
              },
            },
          }
        }),

      updateDSAProficiency: (_concept) =>
        set((state) => {
          if (!state.profile) return {}
          return {
            profile: {
              ...state.profile,
              // DSA proficiency would be stored separately or computed from history
            },
          }
        }),

      updateActPerformance: (_act) =>
        set((state) => {
          // Act performance tracking
          return state
        }),

      recalculateArchetype: () =>
        set((state) => {
          if (!state.profile) return {}
          // Archetype calculation based on DSA proficiency
          // This is a simplified version - real implementation would analyze proficiency profiles
          const proficiencies = {
            GRAPH_TRAVERSAL: 0,
            PATHFINDING: 0,
            NETWORK_OPTIMIZATION: 0,
            STACK_QUEUE: 0,
            DYNAMIC_PROGRAMMING: 0,
          }
          // In real implementation, compute from actual performance history
          const maxConcept = Object.entries(proficiencies).reduce((a, b) =>
            proficiencies[a[0] as keyof typeof proficiencies] > proficiencies[b[0] as keyof typeof proficiencies] ? a : b
          )[0]

          const archetypeMap: Record<string, OperatorArchetype> = {
            GRAPH_TRAVERSAL: 'THE_EXPLORER',
            PATHFINDING: 'ROUTE_ARCHITECT',
            NETWORK_OPTIMIZATION: 'NETWORK_ENGINEER',
            STACK_QUEUE: 'PRESSURE_HANDLER',
            DYNAMIC_PROGRAMMING: 'THE_OPTIMIZER',
          }

          return {
            profile: {
              ...state.profile,
              archetype: archetypeMap[maxConcept] ?? 'HYBRID',
            },
          }
        }),

      resetPlayer: () => set({ profile: null, isInitialized: false }),
    }),
    { name: 'breach-player' }
  )
)