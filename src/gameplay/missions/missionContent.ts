import type { Difficulty, OptimizationOption, QueueTaskTemplate } from '@/types'
import { createRng, rngInt, rngPick } from '@/utils/seededRandom'

const TASK_NAMES = [
  'DECRYPT PACKET',
  'RELAY HANDOFF',
  'TRACE JAM',
  'PROXY WASH',
  'KEY ROTATION',
  'LOG FLUSH',
  'ALERT DAMPEN',
  'SIGNAL REBROADCAST',
  'SEED SCRUB',
  'ROUTE VET',
  'GHOST AUTH',
  'COLD SYNC',
]

/** Generate the batch of incoming tasks for a queue mission. */
export function generateTaskTemplates(seed: number, count: number, difficulty: Difficulty): QueueTaskTemplate[] {
  const rng = createRng(seed)
  const tasks: QueueTaskTemplate[] = []
  const scale =
    difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 0.75 : difficulty === 'HARD' ? 0.6 : 0.5

  for (let i = 0; i < count; i++) {
    const priority = rngInt(rng, 1, 10)
    const deadline = Math.round((rngInt(rng, 5, 16) * scale) * 10) / 10
    const window: [number, number] = [rngInt(rng, 0, Math.floor(count * 0.4)), rngInt(rng, Math.floor(count * 0.5), count)]
    tasks.push({
      id: `task-${i}`,
      name: rngPick(rng, TASK_NAMES),
      priority,
      deadline,
      reward: 60 + priority * 30,
      penalty: 4 + priority * 2,
      window,
    })
  }

  // Guarantee at least the first task is very urgent so the player learns the mechanic.
  if (tasks.length > 0) {
    tasks[0].deadline = 4
    tasks[0].priority = 10
  }
  return tasks
}

const OPTION_NAMES = [
  'VAULT PICK',
  'MAIL SEED',
  'ARCHIVE STRIP',
  'CONTROL PROBE',
  'RELAY TAP',
  'CREDIT MIRROR',
  'DECOY BURN',
  'BACKUP SCRAPE',
  'LEDGER FORK',
  'GATE KEYS',
]

/**
 * Generate optimization options with a dependency graph and reward/cost pairs.
 * The optimal selection is a knapsack-with-prerequisites problem.
 */
export function generateOptimizationOptions(
  seed: number,
  count: number,
  difficulty: Difficulty,
): { options: OptimizationOption[]; budget: number } {
  const rng = createRng(seed)
  const budget =
    difficulty === 'EASY' ? 12 : difficulty === 'MEDIUM' ? 16 : difficulty === 'HARD' ? 20 : 24

  const options: OptimizationOption[] = []
  const names = [...OPTION_NAMES]

  // A cheap, worthwhile baseline item guarantees a positive score.
  options.push({ id: 'opt-0', name: 'BASIC SEED', reward: 80, cost: 2 })

  for (let i = 1; i < count; i++) {
    const cost = rngInt(rng, 3, 6)
    const reward = cost * (rngInt(rng, 2, 4) + (difficulty === 'HARD' || difficulty === 'EXPERT' ? 1 : 0))
    options.push({ id: `opt-${i}`, name: rngPick(rng, names), reward, cost })
  }

  // Add prerequisites to create chain decisions.
  const chainStart = options.length > 4 ? 2 : 1
  for (let i = chainStart; i < options.length; i++) {
    if (rng() < 0.45) {
      const idx = rngInt(rng, 0, i - 1)
      options[i].requires = [options[idx].id]
    }
  }

  return { options, budget }
}