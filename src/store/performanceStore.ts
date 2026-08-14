import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DSAConcept, DSAConceptProfile, ActPerformance, MissionPerformance, OperatorArchetype } from '@/types'

interface PerformanceState {
  conceptProfiles: Record<DSAConcept, DSAConceptProfile>
  actPerformances: Record<string, ActPerformance>
  missionHistory: MissionPerformance[]
  currentArchetype: OperatorArchetype | null

  recordMission: (performance: MissionPerformance) => void
  updateConceptProficiency: (concept: DSAConcept, metrics: { efficiency: number; optimality: number; timeMs: number; success: boolean }) => void
  updateActPerformance: (actId: string, performance: MissionPerformance) => void
  recalculateArchetype: () => OperatorArchetype | null
  getConceptProficiency: (concept: DSAConcept) => number
  getActProficiency: (actId: string) => number
  resetPerformance: () => void
}

const initialConceptProfiles: Record<DSAConcept, DSAConceptProfile> = {
  GRAPH_TRAVERSAL: { conceptId: 'GRAPH_TRAVERSAL', proficiency: 0, missionsPlayed: 0, missionsCompleted: 0, averageEfficiency: 0, averageOptimality: 0, averageTimeMs: 0, bestScore: 0, consistency: 0, recent: [] },
  PATHFINDING: { conceptId: 'PATHFINDING', proficiency: 0, missionsPlayed: 0, missionsCompleted: 0, averageEfficiency: 0, averageOptimality: 0, averageTimeMs: 0, bestScore: 0, consistency: 0, recent: [] },
  NETWORK_OPTIMIZATION: { conceptId: 'NETWORK_OPTIMIZATION', proficiency: 0, missionsPlayed: 0, missionsCompleted: 0, averageEfficiency: 0, averageOptimality: 0, averageTimeMs: 0, bestScore: 0, consistency: 0, recent: [] },
  STACK_QUEUE: { conceptId: 'STACK_QUEUE', proficiency: 0, missionsPlayed: 0, missionsCompleted: 0, averageEfficiency: 0, averageOptimality: 0, averageTimeMs: 0, bestScore: 0, consistency: 0, recent: [] },
  DYNAMIC_PROGRAMMING: { conceptId: 'DYNAMIC_PROGRAMMING', proficiency: 0, missionsPlayed: 0, missionsCompleted: 0, averageEfficiency: 0, averageOptimality: 0, averageTimeMs: 0, bestScore: 0, consistency: 0, recent: [] },
}

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      conceptProfiles: initialConceptProfiles,
      actPerformances: {},
      missionHistory: [],
      currentArchetype: null,

      recordMission: (performance) =>
        set((state) => ({
          missionHistory: [performance, ...state.missionHistory].slice(0, 200),
        })),

      updateConceptProficiency: (concept, metrics) =>
        set((state) => {
          const profile = state.conceptProfiles[concept]
          const newPlayed = profile.missionsPlayed + 1
          const newCompleted = profile.missionsCompleted + (metrics.success ? 1 : 0)
          const newAvgEfficiency = (profile.averageEfficiency * profile.missionsPlayed + metrics.efficiency) / newPlayed
          const newAvgOptimality = (profile.averageOptimality * profile.missionsPlayed + metrics.optimality) / newPlayed
          const newAvgTime = (profile.averageTimeMs * profile.missionsPlayed + metrics.timeMs) / newPlayed
          const newBestScore = Math.max(profile.bestScore, Math.round(metrics.efficiency * 0.4 + metrics.optimality * 0.3 + (1000 / (metrics.timeMs / 1000 + 1)) * 0.3))

          // Consistency: inverse of variance in recent scores
          const recentScores = [...profile.recent, Math.round(metrics.efficiency * 0.4 + metrics.optimality * 0.3 + (1000 / (metrics.timeMs / 1000 + 1)) * 0.3)].slice(-10)
          const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
          const variance = recentScores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / recentScores.length
          const consistency = Math.max(0, 100 - variance / 10)

          const newProficiency = Math.round(newAvgEfficiency * 0.4 + newAvgOptimality * 0.25 + consistency * 0.15 + (100 - Math.min(100, newAvgTime / 1000)) * 0.1 + (newCompleted / newPlayed) * 100 * 0.1)

          return {
            conceptProfiles: {
              ...state.conceptProfiles,
              [concept]: {
                ...profile,
                proficiency: newProficiency,
                missionsPlayed: newPlayed,
                missionsCompleted: newCompleted,
                averageEfficiency: newAvgEfficiency,
                averageOptimality: newAvgOptimality,
                averageTimeMs: newAvgTime,
                bestScore: newBestScore,
                consistency,
                recent: recentScores,
              },
            },
          }
        }),

      updateActPerformance: (actId, performance) =>
        set((state) => {
          const actPerf = state.actPerformances[actId] ?? {
            actId,
            missionsAttempted: 0,
            missionsCompleted: 0,
            proficiency: 0,
            bestScore: 0,
            recent: [],
          }

          const newAttempted = actPerf.missionsAttempted + 1
          const newCompleted = actPerf.missionsCompleted + (performance.success ? 1 : 0)
          const newBestScore = Math.max(actPerf.bestScore, performance.score)
          const recent = [...actPerf.recent, performance.score].slice(-10)
          const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
          const proficiency = Math.round(avgRecent * (newCompleted / newAttempted))

          return {
            actPerformances: {
              ...state.actPerformances,
              [actId]: {
                ...actPerf,
                missionsAttempted: newAttempted,
                missionsCompleted: newCompleted,
                proficiency,
                bestScore: newBestScore,
                recent,
              },
            },
          }
        }),

      recalculateArchetype: () => {
        const { conceptProfiles } = get()
        const scores = Object.entries(conceptProfiles).map(([concept, profile]) => ({
          concept: concept as DSAConcept,
          proficiency: profile.proficiency,
        }))
        scores.sort((a, b) => b.proficiency - a.proficiency)

        const topConcept = scores[0]?.concept
        const archetypeMap: Record<DSAConcept, OperatorArchetype> = {
          GRAPH_TRAVERSAL: 'THE_EXPLORER',
          PATHFINDING: 'ROUTE_ARCHITECT',
          NETWORK_OPTIMIZATION: 'NETWORK_ENGINEER',
          STACK_QUEUE: 'PRESSURE_HANDLER',
          DYNAMIC_PROGRAMMING: 'THE_OPTIMIZER',
        }

        const archetype = topConcept ? archetypeMap[topConcept] ?? 'HYBRID' : 'HYBRID'

        set({ currentArchetype: archetype })
        return archetype
      },

      getConceptProficiency: (concept) => get().conceptProfiles[concept]?.proficiency ?? 0,

      getActProficiency: (actId) => get().actPerformances[actId]?.proficiency ?? 0,

      resetPerformance: () =>
        set({
          conceptProfiles: initialConceptProfiles,
          actPerformances: {},
          missionHistory: [],
          currentArchetype: null,
        }),
    }),
    { name: 'breach-performance' }
  )
)