import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface HeroNode {
  id: string
  x: number
  y: number
  r: number
  type: 'node' | 'target' | 'entry' | 'hidden'
  phase: number
}

interface HeroEdge {
  a: string
  b: string
}

const NODE_LAYOUT: Array<[number, number]> = [
  [120, 200],
  [270, 90],
  [300, 260],
  [430, 160],
  [450, 330],
  [590, 90],
  [620, 250],
  [760, 170],
  [880, 120],
  [880, 320],
]

/**
 * The cinematic hero network — a lightweight SVG graph that reacts gently
 * to cursor position, with pulsing nodes and flowing edges.
 */
export function HeroNetwork() {
  const containerRef = useRef<SVGSVGElement>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null)

  const nodes = useMemo<HeroNode[]>(() => {
    const types: HeroNode['type'][] = ['node', 'node', 'node', 'node', 'node', 'node', 'node', 'target', 'hidden', 'entry']
    return NODE_LAYOUT.map(([x, y], i) => ({
      id: `n${i}`,
      x,
      y,
      r: i === 7 ? 14 : i === 9 ? 10 : 7 + (i % 3) * 1.5,
      type: types[i],
      phase: i * 0.6,
    }))
  }, [])

  const edges = useMemo<HeroEdge[]>(
    () => [
      { a: 'n0', b: 'n1' },
      { a: 'n0', b: 'n2' },
      { a: 'n1', b: 'n3' },
      { a: 'n2', b: 'n3' },
      { a: 'n2', b: 'n4' },
      { a: 'n3', b: 'n5' },
      { a: 'n4', b: 'n6' },
      { a: 'n5', b: 'n7' },
      { a: 'n6', b: 'n7' },
      { a: 'n6', b: 'n8' },
      { a: 'n7', b: 'n9' },
      { a: 'n8', b: 'n9' },
      { a: 'n5', b: 'n8' },
    ],
    [],
  )

  const pos = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (const n of nodes) map.set(n.id, { x: n.x, y: n.y })
    return map
  }, [nodes])

  useEffect(() => {
    const svg = containerRef.current
    if (!svg) return
    const handleMove = (e: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      setMouse({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      })
    }
    const handleLeave = () => setMouse(null)
    svg.addEventListener('pointermove', handleMove)
    svg.addEventListener('pointerleave', handleLeave)
    return () => {
      svg.removeEventListener('pointermove', handleMove)
      svg.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  const offsetX = (mouse?.x ?? 0) * 10
  const offsetY = (mouse?.y ?? 0) * 8

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 1000 460"
      className="h-full w-full"
      role="img"
      aria-label="Animated network visualization"
    >
      <g transform={`translate(${offsetX}, ${offsetY})`} style={{ transition: 'transform 0.4s ease-out' }}>
        {edges.map((e, i) => {
          const a = pos.get(e.a)!
          const b = pos.get(e.b)!
          const isTargetEdge = e.a === 'n7' || e.b === 'n7'
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isTargetEdge ? '#E7B85C' : '#1E4A35'}
                strokeWidth={isTargetEdge ? 1.6 : 1}
                opacity={isTargetEdge ? 0.7 : 0.5}
                className={isTargetEdge ? 'edge-flow' : undefined}
              />
            </g>
          )
        })}

        {nodes.map((n) => {
          const isTarget = n.type === 'target'
          const isEntry = n.type === 'entry'
          const isHidden = n.type === 'hidden'
          return (
            <motion.g
              key={n.id}
              animate={{ opacity: isHidden ? [0.2, 0.45, 0.2] : 1 }}
              transition={{ duration: 3 + n.phase, repeat: Infinity, ease: 'easeInOut' }}
            >
              {isTarget && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={26}
                  fill="none"
                  stroke="rgba(231,184,92,0.25)"
                  strokeWidth={1}
                  animate={{ r: [20, 30, 20], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={isTarget ? '#183B2B' : '#0D1B14'}
                stroke={isTarget ? '#E7B85C' : isEntry ? '#6FA37B' : '#275D40'}
                strokeWidth={isTarget ? 2 : 1.2}
              />
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={n.r - 3}
                fill={isTarget ? '#E7B85C' : 'none'}
                opacity={isTarget ? 0.85 : 0}
                animate={isTarget ? { opacity: [0.5, 1, 0.5] } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.g>
          )
        })}
      </g>
    </svg>
  )
}