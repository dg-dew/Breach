import type { AlgorithmResult, AlgorithmStep, GraphEdge } from '@/types'
import type { GraphDisplayState } from '@/components/graph/types'

export interface ReplayFrame {
  display: GraphDisplayState
  log: string[]
  queueSnapshot: Array<{ nodeId: string; priority: number }> | null
  currentMessage: string | null
  done: boolean
}

/**
 * The replay engine — converts a flat stream of algorithm steps into a
 * sequence of visual frames the GraphCanvas can render, step by step.
 */
export function buildReplayFrames(
  result: AlgorithmResult,
  edges: GraphEdge[],
): ReplayFrame[] {
  const frames: ReplayFrame[] = []
  const visited = new Set<string>()
  const queued: string[] = []
  const pathEdges = new Set<string>()
  const selectedEdges: string[] = []
  const rejectedEdges: string[] = []
  const distances: Record<string, number> = {}
  const logs: string[] = []
  let active: string | null = null
  let flashEdge: string | null = null
  let queueSnapshot: Array<{ nodeId: string; priority: number }> | null = null
  let t = 0

  const pushFrame = (currentMessage: string | null) => {
    frames.push({
      display: {
        visited: new Set(visited),
        active,
        queued: [...queued],
        pathNodes: [],
        pathEdges: new Set(pathEdges),
        selectedEdges: [...selectedEdges],
        rejectedEdges: [...rejectedEdges],
        flashEdge,
        distances: { ...distances },
      },
      log: [...logs],
      queueSnapshot: queueSnapshot ? [...queueSnapshot] : null,
      currentMessage,
      done: false,
    })
  }

  // Initial frame
  pushFrame(null)

  const tick = () => {
    t += 100
  }

  for (const step of result.steps) {
    const msg = step.message ?? describeStep(step)
    logs.push(`${stepLabel(step.type)} — ${msg}`)

    switch (step.type) {
      case 'init':
        break
      case 'enqueue':
        if (step.nodeId) {
          if (!queued.includes(step.nodeId)) queued.push(step.nodeId)
          if (step.distance !== undefined) distances[step.nodeId] = step.distance
        }
        break
      case 'dequeue':
        if (step.nodeId) {
          active = step.nodeId
          const idx = queued.indexOf(step.nodeId)
          if (idx !== -1) queued.splice(idx, 1)
        }
        break
      case 'visit':
        if (step.nodeId) {
          visited.add(step.nodeId)
          active = step.nodeId
        }
        break
      case 'relax':
        flashEdge = step.edgeId ?? null
        break
      case 'update':
        if (step.nodeId && step.distance !== undefined) {
          distances[step.nodeId] = step.distance
        }
        break
      case 'select-edge':
        if (step.edgeId) selectedEdges.push(step.edgeId)
        break
      case 'reject-edge':
        if (step.edgeId) rejectedEdges.push(step.edgeId)
        flashEdge = step.edgeId ?? null
        break
      case 'discovered':
        if (step.nodeId) {
          visited.add(step.nodeId)
          active = step.nodeId
        }
        break
      case 'complete-path':
        if (result.path.length > 0) {
          // Resolve edge ids from consecutive path nodes
          for (let i = 0; i < result.path.length - 1; i++) {
            const a = result.path[i]
            const b = result.path[i + 1]
            const edge = edges.find(
              (e) =>
                (e.source === a && e.target === b) || (e.source === b && e.target === a),
            )
            if (edge) pathEdges.add(edge.id)
          }
          active = null
        }
        break
    }

    if (step.queueSnapshot) queueSnapshot = step.queueSnapshot

    tick()
    pushFrame(msg)
  }

  // Mark the last frame as done
  if (frames.length) frames[frames.length - 1].done = true

  // Set path nodes on the final frame
  const finalFrame = frames[frames.length - 1]
  if (finalFrame) {
    finalFrame.display.pathNodes = result.path
  }

  return frames
}

function stepLabel(type: AlgorithmStep['type']): string {
  switch (type) {
    case 'init':
      return 'INIT'
    case 'visit':
      return 'VISIT'
    case 'enqueue':
      return 'ENQUEUE'
    case 'dequeue':
      return 'DEQUEUE'
    case 'relax':
      return 'RELAX'
    case 'select-edge':
      return 'SELECT'
    case 'reject-edge':
      return 'REJECT'
    case 'update':
      return 'UPDATE'
    case 'discovered':
      return 'TARGET'
    case 'complete-path':
      return 'PATH'
    default:
      return type.toUpperCase()
  }
}

function describeStep(step: AlgorithmStep): string {
  const who = step.nodeId ?? step.edgeId ?? ''
  switch (step.type) {
    case 'visit':
      return `Visiting ${who}`
    case 'enqueue':
      return `Queued ${who}`
    case 'dequeue':
      return `Processed ${who}`
    case 'relax':
      return `Relaxing ${who}`
    case 'update':
      return `Updated ${who}`
    case 'select-edge':
      return `Selected ${who}`
    case 'reject-edge':
      return `Rejected ${who}`
    case 'discovered':
      return `Target ${who} reached`
    case 'complete-path':
      return 'Route confirmed'
    default:
      return ''
  }
}