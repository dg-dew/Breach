import { memo, useCallback, useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { GraphEdge, GraphNode } from '@/types'
import { NodeGlyph } from './NodeGlyph'
import { EMPTY_DISPLAY, type GraphCanvasProps, type GraphDisplayState } from './types'

export const VIEW_W = 1000
export const VIEW_H = 620
const R = 24

interface EdgeWithPos extends GraphEdge {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}

interface NodeVisual {
  stroke: string
  fill: string
  halo?: string
  dim?: boolean
  dash?: string
}

function nodeVisual(node: GraphNode, state: GraphDisplayState, hovered: boolean, selected: boolean): NodeVisual {
  const { visited, active, queued, pathNodes } = state
  const base: NodeVisual = { stroke: '#1E4A35', fill: '#0D1B14' }

  if (node.blocked) {
    return { stroke: '#5a3a3a', fill: '#0a1010', dim: true, dash: '4 3' }
  }
  if (active === node.id) {
    return { stroke: '#E7B85C', fill: '#182C22', halo: 'rgba(231,184,92,0.35)' }
  }
  if (selected) {
    return { ...base, stroke: '#F2C66D', halo: 'rgba(231,184,92,0.5)' }
  }
  if (pathNodes.includes(node.id)) {
    return { stroke: '#E7B85C', fill: '#183B2B', halo: 'rgba(231,184,92,0.22)' }
  }
  if (visited.has(node.id)) {
    return { stroke: '#275D40', fill: '#14271E' }
  }
  if (queued.includes(node.id)) {
    return { ...base, stroke: '#D6A84F', dash: '5 3' }
  }
  if (hovered) {
    return { ...base, stroke: '#6FA37B' }
  }
  return base
}

interface NodeProps {
  node: GraphNode
  display: GraphDisplayState
  hovered: boolean
  selected: boolean
  onPointerDown: (e: ReactPointerEvent, id: string) => void
  onPointerMove: (e: ReactPointerEvent, id: string) => void
  onPointerUp: () => void
  onClick: (id: string) => void
  interactive: boolean
  showDistance: boolean
}

const GraphNodeSVG = memo(function GraphNodeSVG({
  node,
  display,
  hovered,
  selected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
  interactive,
  showDistance,
}: NodeProps) {
  const v = nodeVisual(node, display, hovered, selected)
  const { x, y } = node.position
  const hex = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 6
      pts.push(`${x + R * Math.cos(ang)},${y + R * Math.sin(ang)}`)
    }
    return pts.join(' ')
  }, [x, y])

  const dist = showDistance ? display.distances[node.id] : undefined
  const isTarget = node.type === 'target'
  const isEntry = node.type === 'entry'

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer select-none"
      style={{ opacity: v.dim ? 0.4 : 1 }}
      onPointerDown={(e) => {
        if (interactive) {
          e.stopPropagation()
          onPointerDown(e, node.id)
        }
      }}
      onPointerMove={(e) => {
        if (interactive) onPointerMove(e, node.id)
      }}
      onPointerUp={(e) => {
        if (interactive) {
          e.stopPropagation()
          onPointerUp()
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (interactive) onClick(node.id)
      }}
      role="button"
      aria-label={`Node ${node.label}`}
      data-node-id={node.id}
    >
      {v.halo && (
        <polygon
          points={hex}
          fill="none"
          stroke={v.halo}
          strokeWidth={10}
          opacity={0.7}
          style={{ filter: 'blur(6px)' }}
        />
      )}
      <polygon
        points={hex}
        fill={v.fill}
        stroke={v.stroke}
        strokeWidth={hovered || selected || !!v.halo ? 2 : 1.4}
        strokeDasharray={v.dash}
      />
      <NodeGlyph type={node.type} />
      <g transform="translate(0, -R - 7)" textAnchor="middle">
        <text
          fill={isTarget ? '#E7B85C' : '#8D9B8F'}
          fontSize={isTarget ? 11 : 9}
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="1"
          fontWeight={isTarget ? 600 : 400}
        >
          {node.label}
        </text>
      </g>
      {dist !== undefined && dist !== Infinity && (
        <g transform="translate(0, -R - 19)" textAnchor="middle">
          <text fill="#E7B85C" fontSize={10} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
            {dist}
          </text>
        </g>
      )}
      {isEntry && (
        <g transform="translate(0, R + 14)" textAnchor="middle">
          <text fill="#6FA37B" fontSize={7} fontFamily="'JetBrains Mono', monospace" letterSpacing="1">
            ENTRY
          </text>
        </g>
      )}
      {!isEntry && !isTarget && (
        <g>
          {Array.from({ length: Math.max(1, node.securityLevel) })
            .slice(0, 4)
            .map((_, i) => (
              <rect
                key={i}
                x={-5 + i * 3}
                y={R + 4}
                width={2}
                height={3}
                rx={0.5}
                fill={node.securityLevel > 3 ? '#A34D4D' : '#8D9B8F'}
                opacity={0.7}
              />
            ))}
        </g>
      )}
    </g>
  )
})

interface EdgeProps {
  edge: EdgeWithPos
  display: GraphDisplayState
  selected: boolean
  onClick: (id: string) => void
  interactive: boolean
  animate: boolean
}

const GraphEdgeSVG = memo(function GraphEdgeSVG({
  edge,
  display,
  selected,
  onClick,
  interactive,
  animate,
}: EdgeProps) {
  const { pathEdges, selectedEdges, rejectedEdges, flashEdge } = display

  let stroke = '#1E4A35'
  let width = 1.2
  let dash: string | undefined
  let opacity = 0.7
  let isPath = false
  let isFlash = false

  if (pathEdges.has(edge.id)) {
    stroke = '#E7B85C'
    width = 2.6
    isPath = true
    opacity = 1
  } else if (selectedEdges.includes(edge.id)) {
    stroke = '#E7B85C'
    width = 2.2
    opacity = 1
  } else if (rejectedEdges.includes(edge.id)) {
    stroke = '#5a3a3a'
    width = 1.2
    dash = '3 4'
    opacity = 0.5
  } else if (flashEdge === edge.id) {
    stroke = '#F2C66D'
    width = 2.4
    isFlash = true
    opacity = 1
  }

  if (edge.blocked) {
    stroke = '#5a3a3a'
    width = 1.4
    dash = '5 4'
    opacity = 0.45
  }

  const midX = (edge.sourceX + edge.targetX) / 2
  const midY = (edge.sourceY + edge.targetY) / 2

  return (
    <g
      onClick={(e) => {
        e.stopPropagation()
        if (interactive) onClick(edge.id)
      }}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
      data-edge-id={edge.id}
    >
      {(isPath || isFlash) && (
        <line
          x1={edge.sourceX}
          y1={edge.sourceY}
          x2={edge.targetX}
          y2={edge.targetY}
          stroke="#F2C66D"
          strokeWidth={6}
          opacity={0.18}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <line
        x1={edge.sourceX}
        y1={edge.sourceY}
        x2={edge.targetX}
        y2={edge.targetY}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={opacity}
        className={isFlash || (isPath && animate) ? 'edge-flow' : undefined}
        vectorEffect="non-scaling-stroke"
      />
      {selected && (
        <circle cx={midX} cy={midY} r={14} fill="none" stroke="#E7B85C" strokeWidth={1} strokeDasharray="3 3" opacity={0.8} />
      )}
      <g transform={`translate(${midX}, ${midY - 9})`} textAnchor="middle">
        <rect x={-9} y={-8} width={18} height={14} rx={2} fill="#0A1510" stroke="#1E4A35" strokeWidth={0.7} />
        <text fill={edge.blocked ? '#5a3a3a' : '#8D9B8F'} fontSize={9} fontFamily="'JetBrains Mono', monospace" dominantBaseline="middle">
          {edge.weight}
        </text>
      </g>
      {edge.risk >= 4 && !edge.blocked && (
        <g transform={`translate(${midX}, ${midY + 8})`} textAnchor="middle">
          <text fill="#A34D4D" fontSize={8} fontFamily="'JetBrains Mono', monospace">
            ▲ {edge.risk}
          </text>
        </g>
      )}
      {edge.blocked && (
        <g transform={`translate(${midX}, ${midY + 8})`} textAnchor="middle">
          <text fill="#A34D4D" fontSize={8} fontFamily="'JetBrains Mono', monospace">
            LOCKED
          </text>
        </g>
      )}
    </g>
  )
})

/**
 * The reusable graph renderer — SVG-based for precise interaction.
 * Renders the weighted network with full state highlighting.
 */
export function GraphCanvas({
  nodes,
  edges,
  display = EMPTY_DISPLAY,
  entryNode,
  targetNode,
  mode = 'view',
  selectedNodeId = null,
  selectedEdgeId = null,
  onNodeClick,
  onNodeMove,
  onEdgeClick,
  onCanvasClick,
  interactive = true,
  className = '',
  animateEdges = true,
}: GraphCanvasProps) {
  const hoveredNode = useRef<string | null>(null)
  const dragging = useRef<string | null>(null)
  const didDrag = useRef(false)

  const pos = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (const n of nodes) map.set(n.id, n.position)
    return map
  }, [nodes])

  const edgesWithPos: EdgeWithPos[] = useMemo(
    () =>
      edges.map((e) => {
        const s = pos.get(e.source)
        const t = pos.get(e.target)
        return { ...e, sourceX: s?.x ?? 0, sourceY: s?.y ?? 0, targetX: t?.x ?? 0, targetY: t?.y ?? 0 }
      }),
    [edges, pos],
  )

  const showEntryTarget = entryNode !== undefined || targetNode !== undefined

  const handlePointerMove = useCallback((e: ReactPointerEvent, id: string) => {
    if (dragging.current === id) {
      didDrag.current = true
      const svgEl = e.currentTarget.closest('svg')
      const rect = svgEl?.getBoundingClientRect()
      if (!rect) return
      const scaleX = VIEW_W / rect.width
      const scaleY = VIEW_H / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY
      onNodeMove?.(id, Math.round(Math.min(VIEW_W - 30, Math.max(30, x))), Math.round(Math.min(VIEW_H - 30, Math.max(30, y))))
    } else {
      hoveredNode.current = id
    }
  }, [onNodeMove])

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent, id: string) => {
      if (mode === 'build') {
        e.preventDefault()
        dragging.current = id
        didDrag.current = false
      }
    },
    [mode],
  )

  const handlePointerUp = useCallback(() => {
    dragging.current = null
  }, [])

  const handleClick = useCallback(
    (id: string) => {
      if (didDrag.current) {
        didDrag.current = false
        return
      }
      onNodeClick?.(id)
    },
    [onNodeClick],
  )

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`h-full w-full ${className}`}
      onClick={() => onCanvasClick?.()}
      role="img"
      aria-label={`Network graph${showEntryTarget ? ` (entry ${entryNode}, target ${targetNode})` : ''}`}
      data-mode={mode}
    >
      {edgesWithPos.map((edge) => (
        <GraphEdgeSVG
          key={edge.id}
          edge={edge}
          display={display}
          selected={selectedEdgeId === edge.id}
          onClick={onEdgeClick ?? (() => {})}
          interactive={interactive}
          animate={animateEdges}
        />
      ))}

      {nodes.map((node) => (
        <GraphNodeSVG
          key={node.id}
          node={node}
          display={display}
          hovered={hoveredNode.current === node.id}
          selected={selectedNodeId === node.id}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          interactive={interactive}
          showDistance={Object.keys(display.distances).length > 0}
        />
      ))}
    </svg>
  )
}

export const GraphCanvasMemo = memo(GraphCanvas)