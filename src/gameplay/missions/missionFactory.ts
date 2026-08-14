import type { Contract, Difficulty, MissionDefinition } from '@/types'
import { getContract } from '@/gameplay/contracts/contracts'
import { generateMissionGraph, decoyCountFor } from './missionGraph'
import { generateTaskTemplates, generateOptimizationOptions } from './missionContent'

const NODE_COUNT: Record<Difficulty, number> = {
  EASY: 8,
  MEDIUM: 12,
  HARD: 16,
  EXPERT: 20,
}

const TIME_LIMIT: Record<Difficulty, number> = {
  EASY: 90,
  MEDIUM: 150,
  HARD: 200,
  EXPERT: 260,
}

const ENERGY: Record<Difficulty, number> = {
  EASY: 22,
  MEDIUM: 26,
  HARD: 30,
  EXPERT: 34,
}

const STARTING_ALERT: Record<Difficulty, number> = {
  EASY: 6,
  MEDIUM: 12,
  HARD: 18,
  EXPERT: 24,
}

/**
 * Turns a contract into a fully playable MissionDefinition.
 * Graphs are seeded & deterministic; every mission is guaranteed solvable.
 */
export function buildMissionDefinition(contract: Contract): MissionDefinition {
  const seed = contract.seed ?? contract.order * 100 + 1
  const difficulty = contract.difficulty
  const base: MissionDefinition = {
    id: `m-${contract.id}`,
    contractId: contract.id,
    actId: contract.actId,
    title: contract.title,
    codename: contract.codename,
    type: contract.missionType,
    difficulty,
    concept: contract.concept,
    timeLimit: TIME_LIMIT[difficulty],
    energyBudget: ENERGY[difficulty],
    startingAlert: STARTING_ALERT[difficulty],
    startingExposure: 0,
    objective: contract.objective,
    seed,
  }

  switch (contract.missionType) {
    case 'recon':
    case 'route':
    case 'hybrid': {
      const nodeCount = NODE_COUNT[difficulty]
      const graph = generateMissionGraph({
        seed,
        nodeCount,
        decoyCount: decoyCountFor(nodeCount, difficulty),
        gateCount: Math.max(1, Math.floor(nodeCount * 0.12)),
        riskCeiling: difficulty === 'EASY' ? 3 : 5,
      })
      return {
        ...base,
        graph,
        routeMode: contract.missionType === 'route' ? 'risk' : 'cost',
      }
    }
    case 'rebuild': {
      const nodeCount = NODE_COUNT[difficulty]
      const graph = generateMissionGraph({
        seed,
        nodeCount,
        decoyCount: 0,
        gateCount: 0,
        riskCeiling: 5,
      })
      const targets = graph.nodes
        .filter((n) => n.type !== 'exit')
        .slice(0, nodeCount + 2)
        .map((n) => n.id)
      return { ...base, graph, rebuildTargets: targets }
    }
    case 'queue': {
      const count = difficulty === 'EASY' ? 8 : difficulty === 'MEDIUM' ? 10 : difficulty === 'HARD' ? 12 : 14
      return {
        ...base,
        taskTemplates: generateTaskTemplates(seed, count, difficulty),
      }
    }
    case 'optimize': {
      const count = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 8 : difficulty === 'HARD' ? 10 : 12
      const { options, budget } = generateOptimizationOptions(seed, count, difficulty)
      return {
        ...base,
        optimizationOptions: options,
        energyBudget: budget,
      }
    }
  }
}

export function buildMissionDefinitionById(contractId: string): MissionDefinition | null {
  const contract = getContract(contractId)
  if (!contract) return null
  return buildMissionDefinition(contract)
}
