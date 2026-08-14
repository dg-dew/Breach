import { create } from 'zustand'
import type { MissionDefinition, MissionPhase, MissionResources, NodeRunState, EdgeRunState, GameEvent } from '@/types'
import { Graph } from '@/data-structures/Graph'

interface MissionState {
  definition: MissionDefinition | null
  graph: Graph | null
  phase: MissionPhase
  resources: MissionResources
  nodeStates: Record<string, NodeRunState>
  edgeStates: Record<string, EdgeRunState>
  currentNode: string | null
  discoveredNodes: Set<string>
  visitedNodes: Set<string>
  pathHistory: string[]
  events: GameEvent[]
  alertLevel: number
  isLockdown: boolean
  extracted: boolean
  breached: boolean
  startTime: number
  missionTimeMs: number

  startMission: (definition: MissionDefinition) => void
  setPhase: (phase: MissionPhase) => void
  moveToNode: (nodeId: string) => { success: boolean; alertDelta: number; exposureDelta: number; energyCost: number }
  discoverNode: (nodeId: string) => void
  breachTarget: () => void
  extract: () => void
  useGadget: (gadgetId: string) => { success: boolean; effect: string }
  addAlert: (delta: number, source: string) => void
  addExposure: (delta: number) => void
  consumeEnergy: (amount: number) => void
  addEvent: (event: Omit<GameEvent, 'id' | 'ts'>) => void
  triggerLockdown: () => void
  updateMissionTime: () => void
  endMission: (success: boolean) => MissionResult | null
  resetMission: () => void
}

interface MissionResult {
  success: boolean
  missionId: string
  contractId: string
  actId: string
  timeMs: number
  score: number
  pathCost: number
  nodesVisited: number
  exposure: number
  alertGenerated: number
  energyUsed: number
  optimality: number
  efficiency: number
}

const initialResources: MissionResources = {
  time: 0,
  timeLimit: 0,
  energy: 0,
  energyMax: 0,
  exposure: 0,
  alert: 0,
  lockdown: false,
}

export const useMissionStore = create<MissionState>((set, get) => ({
  definition: null,
  graph: null,
  phase: 'recon',
  resources: initialResources,
  nodeStates: {},
  edgeStates: {},
  currentNode: null,
  discoveredNodes: new Set(),
  visitedNodes: new Set(),
  pathHistory: [],
  events: [],
  alertLevel: 0,
  isLockdown: false,
  extracted: false,
  breached: false,
  startTime: 0,
  missionTimeMs: 0,

  startMission: (definition) => {
    const graph = new Graph(definition.graph)
    const entryNode = definition.graph?.entryNode ?? 'ENTRY'

    const nodeStates: Record<string, NodeRunState> = {}
    definition.graph?.nodes.forEach((n) => {
      nodeStates[n.id] = {
        id: n.id,
        type: n.type,
        discovered: n.id === entryNode,
        visited: false,
        active: n.id === entryNode,
        compromised: false,
        blocked: n.blocked ?? false,
      }
    })

    const edgeStates: Record<string, EdgeRunState> = {}
    definition.graph?.edges.forEach((e) => {
      edgeStates[e.id] = {
        id: e.id,
        blocked: e.blocked ?? false,
        compromised: false,
      }
    })

    const discoveredNodes = new Set<string>([entryNode])
    const visitedNodes = new Set<string>()

    set({
      definition,
      graph,
      phase: 'recon',
      resources: {
        time: 0,
        timeLimit: definition.timeLimit,
        energy: definition.energyBudget,
        energyMax: definition.energyBudget,
        exposure: definition.startingExposure,
        alert: definition.startingAlert,
        lockdown: false,
      },
      nodeStates,
      edgeStates,
      currentNode: entryNode,
      discoveredNodes,
      visitedNodes,
      pathHistory: [entryNode],
      events: [],
      alertLevel: definition.startingAlert,
      isLockdown: false,
      extracted: false,
      breached: false,
      startTime: Date.now(),
      missionTimeMs: 0,
    })
  },

  setPhase: (phase) => set({ phase }),

  moveToNode: (nodeId) => {
    const state = get()
    const { graph, currentNode, resources, nodeStates, edgeStates, alertLevel, isLockdown } = state

    if (!graph || !currentNode) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }
    if (nodeId === currentNode) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }
    if (resources.energy <= 0) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }

    const edgeId = graph.getEdgeId(currentNode, nodeId)
    if (!edgeId) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }

    const edge = graph.edges.find((e) => e.id === edgeId)
    if (!edge || edge.blocked) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }
    if (edgeStates[edgeId]?.blocked) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }

    const targetNode = graph.getNode(nodeId)
    if (!targetNode || !nodeStates[nodeId]?.discovered) return { success: false, alertDelta: 0, exposureDelta: 0, energyCost: 0 }

    const alertDelta = Math.max(1, Math.floor(edge.risk * 1.5))
    const exposureDelta = Math.max(1, edge.risk)
    const energyCost = 1

    const newAlert = Math.min(100, alertLevel + alertDelta)
    const lockdownTriggered = newAlert >= 100 && !isLockdown

    // Update node states
    const newNodeStates = { ...nodeStates }
    newNodeStates[currentNode] = { ...newNodeStates[currentNode], active: false, compromised: true }
    newNodeStates[nodeId] = { ...newNodeStates[nodeId], active: true, visited: true, discovered: true }

    const newVisitedNodes = new Set(state.visitedNodes)
    newVisitedNodes.add(nodeId)

    const newDiscoveredNodes = new Set(state.discoveredNodes)
    // Discover neighbors
    if (graph) {
      graph.neighbors(nodeId).forEach((e) => {
        const neighbor = e.source === nodeId ? e.target : e.source
        newDiscoveredNodes.add(neighbor)
        if (newNodeStates[neighbor]) {
          newNodeStates[neighbor] = { ...newNodeStates[neighbor], discovered: true }
        }
      })
    }

    const newEdgeStates = { ...edgeStates }
    newEdgeStates[edgeId] = { ...newEdgeStates[edgeId], compromised: true }

    const newPathHistory = [...state.pathHistory, nodeId]

    set({
      phase: state.phase === 'recon' && nodeId === targetNode?.id ? 'breach' : state.phase,
      currentNode: nodeId,
      resources: {
        ...resources,
        energy: resources.energy - energyCost,
        exposure: Math.min(100, resources.exposure + exposureDelta),
        alert: newAlert,
        lockdown: lockdownTriggered,
      },
      nodeStates: newNodeStates,
      edgeStates: newEdgeStates,
      visitedNodes: newVisitedNodes,
      discoveredNodes: newDiscoveredNodes,
      pathHistory: newPathHistory,
      alertLevel: newAlert,
      isLockdown: lockdownTriggered,
    })

    if (lockdownTriggered) {
      get().addEvent({ type: 'lockdown', message: 'LOCKDOWN INITIATED — Security systems engaged', delta: alertDelta })
    } else {
      get().addEvent({ type: 'trace', message: `Moved to ${nodeId} — Alert +${alertDelta}`, delta: alertDelta })
    }

    return { success: true, alertDelta, exposureDelta, energyCost }
  },

  discoverNode: (nodeId) => {
    const { nodeStates, discoveredNodes, graph } = get()
    if (!nodeStates[nodeId] || discoveredNodes.has(nodeId)) return

    const newNodeStates = { ...nodeStates }
    newNodeStates[nodeId] = { ...newNodeStates[nodeId], discovered: true }

    const newDiscoveredNodes = new Set(discoveredNodes)
    newDiscoveredNodes.add(nodeId)

    // Also discover neighbors
    if (graph) {
      graph.neighbors(nodeId).forEach((e) => {
        const neighbor = e.source === nodeId ? e.target : e.source
        newDiscoveredNodes.add(neighbor)
        if (newNodeStates[neighbor]) {
          newNodeStates[neighbor] = { ...newNodeStates[neighbor], discovered: true }
        }
      })
    }

    set({ nodeStates: newNodeStates, discoveredNodes: newDiscoveredNodes })
  },

  breachTarget: () => {
    const { phase, currentNode, definition } = get()
    const targetNode = definition?.graph?.targetNode
    if (phase !== 'recon' && phase !== 'infiltration') return
    if (currentNode !== targetNode) return

    set({ phase: 'breach', breached: true })
    get().addEvent({ type: 'info', message: 'TARGET BREACHED — Objective secured. Extraction window open.' })
  },

  extract: () => {
    const { currentNode, definition, extracted } = get()
    if (extracted) return
    const exitNode = definition?.graph?.exitNode
    if (!exitNode) return
    if (currentNode !== exitNode) return

    set({ phase: 'complete', extracted: true })
    get().addEvent({ type: 'info', message: 'EXTRACTION COMPLETE — You are clear.' })
  },

  useGadget: (gadgetId) => {
    const { resources } = get()
    // Simplified - real implementation would check inventory
    const effects: Record<string, { alert: number; exposure: number }> = {
      decoy: { alert: -18, exposure: 0 },
      ghostNode: { alert: 0, exposure: -12 },
      traceBreaker: { alert: -25, exposure: 0 },
      override: { alert: 0, exposure: 0 }, // Special - unblocks a route
      deepScan: { alert: 5, exposure: 0 }, // Reveals nodes
      routeAnalyzer: { alert: 0, exposure: 0 }, // Shows optimal path
    }

    const effect = effects[gadgetId]
    if (!effect) return { success: false, effect: 'Unknown gadget' }

    set({
      resources: {
        ...resources,
        alert: Math.max(0, resources.alert + effect.alert),
        exposure: Math.max(0, resources.exposure + effect.exposure),
      },
    })

    get().addEvent({
      type: 'info',
      message: `Gadget used: ${gadgetId.toUpperCase()} — Alert ${effect.alert >= 0 ? '+' : ''}${effect.alert}%, Exposure ${effect.exposure >= 0 ? '+' : ''}${effect.exposure}%`,
    })

    return { success: true, effect: `Applied ${gadgetId}` }
  },

  addAlert: (delta, source) => {
    const { alertLevel, isLockdown, resources } = get()
    const newAlert = Math.min(100, alertLevel + delta)
    const lockdownTriggered = newAlert >= 100 && !isLockdown

    set({
      alertLevel: newAlert,
      isLockdown: lockdownTriggered,
      resources: { ...resources, alert: newAlert, lockdown: lockdownTriggered },
    })

    if (lockdownTriggered) {
      get().addEvent({ type: 'lockdown', message: 'LOCKDOWN INITIATED — All routes compromised', delta })
    } else {
      get().addEvent({ type: 'trace', message: `${source} — Alert +${delta}%`, delta })
    }
  },

  addExposure: (delta) => {
    const { resources } = get()
    set({
      resources: {
        ...resources,
        exposure: Math.min(100, resources.exposure + delta),
      },
    })
  },

  consumeEnergy: (amount) => {
    const { resources } = get()
    set({
      resources: {
        ...resources,
        energy: Math.max(0, resources.energy - amount),
      },
    })
  },

  addEvent: (event) => {
    const { events } = get()
    const newEvent: GameEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
    }
    set({ events: [newEvent, ...events].slice(0, 50) })
  },

  triggerLockdown: () => {
    const { edgeStates, nodeStates } = get()

    // Block random routes, activate security nodes
    const newEdgeStates = { ...edgeStates }
    Object.keys(newEdgeStates).forEach((id) => {
      if (Math.random() < 0.3) newEdgeStates[id] = { ...newEdgeStates[id], blocked: true }
    })

    const newNodeStates = { ...nodeStates }
    Object.values(newNodeStates).forEach((n) => {
      if (n.type === 'gate') n.blocked = true
    })

    set({
      edgeStates: newEdgeStates,
      nodeStates: newNodeStates,
      isLockdown: true,
      alertLevel: 100,
    })

    get().addEvent({ type: 'lockdown', message: 'FULL LOCKDOWN — Security grid activated', delta: 0 })
  },

  updateMissionTime: () => {
    const { startTime, resources } = get()
    const elapsed = Date.now() - startTime
    set({ missionTimeMs: elapsed, resources: { ...resources, time: Math.floor(elapsed / 1000) } })
  },

  endMission: (success) => {
    const { definition, missionTimeMs, resources, pathHistory, visitedNodes, alertLevel } = get()
    if (!definition) return null

    const optimalCost = 100 // Would compute from actual algorithm
    const actualCost = pathHistory.length * 5 // Simplified

    return {
      success,
      missionId: definition.id,
      contractId: definition.contractId,
      actId: definition.actId,
      timeMs: missionTimeMs,
      score: success ? Math.max(0, 1000 - missionTimeMs / 1000 * 10 - alertLevel * 5) : 0,
      pathCost: actualCost,
      nodesVisited: visitedNodes.size,
      exposure: resources.exposure,
      alertGenerated: alertLevel,
      energyUsed: resources.energyMax - resources.energy,
      optimality: optimalCost > 0 ? Math.min(100, Math.round((optimalCost / actualCost) * 100)) : 0,
      efficiency: Math.max(0, 100 - visitedNodes.size * 2),
    }
  },

  resetMission: () =>
    set({
      definition: null,
      graph: null,
      phase: 'recon',
      resources: initialResources,
      nodeStates: {},
      edgeStates: {},
      currentNode: null,
      discoveredNodes: new Set(),
      visitedNodes: new Set(),
      pathHistory: [],
      events: [],
      alertLevel: 0,
      isLockdown: false,
      extracted: false,
      breached: false,
      startTime: 0,
      missionTimeMs: 0,
    }),
}))