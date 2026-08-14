import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AlgorithmType, GameState, MissionResult } from '@/types'
import { buildMissions } from '@/game/missions/missionDefinitions'

const MISSIONS = buildMissions()

export const MISSION_COUNT = MISSIONS.length

interface GameStore extends GameState {
  enter: () => void
  completeMission: (result: MissionResult) => void
  addResult: (result: MissionResult) => void
  recordProficiency: (algo: AlgorithmType, efficiency: number) => void
  resetProgress: () => void
}

const initialState: GameState = {
  clearanceLevel: 1,
  completedMissions: [],
  highScores: {},
  totalScore: 0,
  operationsCompleted: 0,
  bestTime: 0,
  networksBreached: 0,
  algorithmProficiency: {
    BFS: 0,
    DFS: 0,
    DIJKSTRA: 0,
    PRIM: 0,
    KRUSKAL: 0,
    PRIORITY_QUEUE: 0,
  },
  hasEntered: false,
  lastMission: null,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      enter: () => set({ hasEntered: true }),

      completeMission: (result) =>
        set((state) => {
          const completed = state.completedMissions.includes(result.missionId)
          return {
            completedMissions: completed
              ? state.completedMissions
              : [...state.completedMissions, result.missionId],
            operationsCompleted: completed
              ? state.operationsCompleted
              : state.operationsCompleted + 1,
            totalScore: state.totalScore + result.score,
            bestTime:
              state.bestTime === 0 ? result.timeMs : Math.min(state.bestTime, result.timeMs),
            networksBreached: completed
              ? state.networksBreached
              : state.networksBreached + 1,
            highScores: {
              ...state.highScores,
              [result.missionId]: Math.max(
                state.highScores[result.missionId] ?? 0,
                result.score,
              ),
            },
            clearanceLevel: Math.min(
              8,
              1 + Math.floor(state.completedMissions.length / 2),
            ),
            lastMission: result.missionId,
          }
        }),

      addResult: (result) =>
        set((state) => ({
          highScores: {
            ...state.highScores,
            [result.missionId]: Math.max(state.highScores[result.missionId] ?? 0, result.score),
          },
        })),

      recordProficiency: (algo, efficiency) =>
        set((state) => ({
          algorithmProficiency: {
            ...state.algorithmProficiency,
            [algo]: Math.max(state.algorithmProficiency[algo], efficiency),
          },
        })),

      resetProgress: () => set({ ...initialState }),
    }),
    { name: 'breach-progress' },
  ),
)

export { MISSIONS }
