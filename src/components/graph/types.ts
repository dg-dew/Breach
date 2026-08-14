import type { GraphEdge, GraphNode } from '@/types'

/** Visual state overlaid onto a graph during algorithm replay. */
export interface GraphDisplayState {
  visited: Set<string>
  active: string | null
  queued: string[]
  pathNodes: string[]
  pathEdges: Set<string>
  selectedEdges: string[]
  rejectedEdges: string[]
  flashEdge: string | null
  distances: Record<string, number>
}

export const EMPTY_DISPLAY: GraphDisplayState = {
  visited: new Set(),
  active: null,
  queued: [],
  pathNodes: [],
  pathEdges: new Set(),
  selectedEdges: [],
  rejectedEdges: [],
  flashEdge: null,
  distances: {},
}

export interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  display?: GraphDisplayState
  entryNode?: string
  targetNode?: string
  mode?: 'view' | 'build'
  selectedNodeId?: string | null
  selectedEdgeId?: string | null
  onNodeClick?: (id: string) => void
  onNodeMove?: (id: string, x: number, y: number) => void
  onEdgeClick?: (id: string) => void
  onCanvasClick?: () => void
  interactive?: boolean
  className?: string
  animateEdges?: boolean
}