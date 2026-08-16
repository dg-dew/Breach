import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buildAnalysis } from '@/game/heist/analysis'
import { MST_EDGES, MST_NODES, DP_BUDGET, mstEdge, asset } from '@/game/heist/world'
import { useHeistStore } from '@/store/heistStore'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'

const ANALYSIS_MODES = ['MY PATH', 'OPTIMAL PATH', 'COMPARE'] as const

export function AnalysisPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const snapshot = useHeistStore((s) => s.snapshot)
  const operator = useHeistStore((s) => s.operator)

  useEffect(() => {
    if (!snapshot) navigate('/', { replace: true })
  }, [snapshot, navigate])

  const analysis = useMemo(() => (snapshot ? buildAnalysis(snapshot) : null), [snapshot])
  const [mode, setMode] = useState<'MY PATH' | 'OPTIMAL PATH' | 'COMPARE'>('MY PATH')

  if (!analysis) return null

  const visited = new Set(analysis.playerPath)

  // Mode buttons
  const modeButtons = (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {ANALYSIS_MODES.map((m) => (
        <Button
          key={m}
          variant={mode === m ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMode(m)}
          >
            {m}
        </Button>
      ))}
    </div>
  )

  // Render routes based on mode
  const renderedRoutes = analysis.routes.map((r) => {
    const a = analysis.nodes.find((n) => n.id === r.from)!
    const b = analysis.nodes.find((n) => n.id === r.to)!
    let stroke = 'rgba(255,255,255,0.12)'
    let width = 1.2
    let dasharray = undefined

    if (mode === 'MY PATH' && r.playerUsed) {
      stroke = '#E7B85C'
      width = 3
    } else if (mode === 'OPTIMAL PATH' && r.optimal) {
      stroke = 'rgba(240,234,214,0.55)'
      width = 2.2
      dasharray = '6 6'
    } else if (mode === 'COMPARE') {
      if (r.playerUsed && r.optimal) {
        stroke = '#E7B85C'
        width = 2.5
      } else if (r.optimal && !r.playerUsed) {
        stroke = 'rgba(240,234,214,0.55)'
        width = 2
        dasharray = '6 6'
      } else if (r.sealed) {
        stroke = 'rgba(255,255,255,0.06)'
        width = 1
      } else {
        stroke = 'rgba(255,255,255,0.12)'
        width = 1.2
      }
    }

    return (
      <line
        key={r.id}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dasharray}
        opacity={r.sealed ? 0.5 : 1}
      >
        <title>
          {`${a.name} → ${b.name} · cost ${r.cost} · ${r.timeSec}s · +${r.exposure} EXP`}
        </title>
      </line>
    )
  })

  // Legend
  const legendItems = [
    { color: '#E7B85C', label: 'YOUR PATH' },
    { color: 'rgba(240,234,214,0.55)', label: 'OPTIMAL (DIJKSTRA)' },
    { color: 'rgba(255,255,255,0.12)', label: 'UNUSED ROUTE' },
    { color: 'rgba(255,255,255,0.06)', label: 'SEALED' },
  ]

  // Decision points detail
  const decisionDetail = mode === 'COMPARE'
    ? analysis.decisionPoints.map((d, i) => (
        <li key={i} className="border-b border-white/5 pb-2">
          <p className="font-mono text-[11px] text-cream">
            <span className="text-amber">▸ {d.nodeId}</span> — you diverged from the optimal route.
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            YOUR LINE <span className="text-amber">{d.playerRoute} · +{d.playerCost - d.optimalCost} cost</span>
          </p>
          <p className="font-mono text-[10px] text-muted">
            OPTIMAL LINE <span className="text-cream">{d.optimalRoute} · cost {d.optimalCost}</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            RESULT: +{d.playerCost - d.optimalCost} cost, +{d.playerTime - d.optimalTime} sec, +{d.playerExposure - d.optimalExposure} exposure
          </p>
        </li>
      ))
    : analysis.decisionPoints.length === 0
      ? (
        <p className="font-mono text-xs text-success">You held the Dijkstra-optimal line at every junction.</p>
      )
      : null

  // MST compare panel
  const mstCompare = (
    <div className="mt-6 panel px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="label">RESTORED NETWORK — MST SOLUTION</p>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted">KRUSKAL</span>
      </div>
      <svg viewBox="0 0 400 260" className="mt-3 w-full" role="img" aria-label="Minimum spanning tree solution">
        {MST_EDGES.map((e) => {
          const optimal = analysis.mstOptimalEdges.includes(e.id)
          const player = analysis.mstPlayerEdges.includes(e.id)
          const stroke = player ? '#E7B85C' : optimal ? 'rgba(240,234,214,0.6)' : 'rgba(255,255,255,0.1)'
          const width = player ? 3 : optimal ? 2.4 : 1.2
          const dash = optimal && !player ? '6 6' : undefined
          return (
            <g key={e.id}>
              <line x1={0} y1={0} x2={100} y2={100} stroke={stroke} strokeWidth={width} strokeDasharray={dash} />
              <text x={50} y={50} textAnchor="middle" fontSize="9" fill="#E7B85C" className="font-mono">
                {e.cost}
              </text>
            </g>
          )
        })}
        {MST_NODES.map((id) => {
          const [x, y] = { POWER: [40, 60], CONTROL: [200, 60], SERVER: [360, 60], ROUTER: [120, 200], ARCHIVE: [280, 200] }[id] ?? [0, 0]
          return (
            <g key={id}>
              <circle cx={x} cy={y} r={14} fill="#0D1B14" stroke={analysis.mstPlayerEdges.some((ed) => mstEdge(ed)?.from === id || mstEdge(ed)?.to === id) ? '#E7B85C' : 'rgba(255,255,255,0.25)'} strokeWidth={1.5} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fill="#E7B85C" className="font-mono">
                {id}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.2em]">
        <span className="text-success">OPTIMAL COST 14</span>
        <span>YOUR COST: {analysis.mstPlayerCost}</span>
        {analysis.mstUnnecessaryEdges.length > 0 && (
          <span className="text-dangerBright">UNNECESSARY: {analysis.mstUnnecessaryEdges.join(', ')}</span>
        )}
      </div>
    </div>
  )

  // DP compare panel
  const dpCompare = (
    <div className="mt-6 panel px-5 py-4">
      <p className="label">DATA RECOVERY — DYNAMIC PROGRAMMING</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <p className="font-mono text-[10px] text-muted">YOUR VALUE</p>
          <p className="font-mono text-lg font-semibold text-cream">{analysis.dpPlayerValue}</p>
          <p className="font-mono text-[9px] text-muted/60">weight {analysis.dpPlayerAssetIds.length ? analysis.dpPlayerAssetIds.reduce((s, id) => s + (asset(id)?.cost ?? 0), 0) : 0}/{DP_BUDGET}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-muted">OPTIMAL VALUE</p>
          <p className="font-mono text-lg font-semibold text-cream">{analysis.dpOptimalValue}</p>
          <p className="font-mono text-[9px] text-muted/60">weight {analysis.dpOptimalAssetIds.length ? analysis.dpOptimalAssetIds.reduce((s, id) => s + (asset(id)?.cost ?? 0), 0) : 0}/{DP_BUDGET}</p>
        </div>
      </div>
      {analysis.dpMissing.length > 0 && (
        <div className="mt-3 text-dangerBright">
          <p className="font-mono text-[9px] tracking-widest text-muted">MISSING:</p>
          <p className="font-mono text-[10px] text-cream/80">{analysis.dpMissing.join(', ')}</p>
        </div>
      )}
      {analysis.dpExtra.length > 0 && (
        <div className="mt-3 text-amber">
          <p className="font-mono text-[9px] tracking-widest text-muted">EXTRA:</p>
          <p className="font-mono text-[10px] text-cream/80">{analysis.dpExtra.join(', ')}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="grid-lines grain crt-lines min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="label mb-2">POST-HEIST ANALYSIS // {operator}</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-4xl font-bold text-cream">THE FULL NETWORK</h1>
            <div className="text-right">
              <p className="font-mono text-sm text-amber">{analysis.elapsedSec}s OPERATION</p>
              <p className="label mt-1">REVEALED AFTER EXTRACTION</p>
            </div>
          </div>
        </motion.div>

          <div className="panel mt-6 overflow-hidden px-2 py-2">
            <svg viewBox="0 0 1000 560" className="w-full" role="img" aria-label="Facility network graph">
              <rect width="1000" height="560" fill="transparent" />
              {renderedRoutes}
              {analysis.nodes.map((n) => {
                const wasVisited = visited.has(n.id)
                const isEndpoint = n.id === 'ENTRY' || n.id === 'EXIT'
                return (
                  <g key={n.id}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isEndpoint ? 11 : 8}
                      fill={wasVisited ? (n.id === 'EXIT' ? '#E7B85C' : '#15301F') : '#0D1B14'}
                      stroke={wasVisited ? '#E7B85C' : 'rgba(255,255,255,0.25)'}
                      strokeWidth={wasVisited ? 2 : 1}
                    >
                      <title>{n.name}</title>
                    </circle>
                    <text
                      x={n.x}
                      y={n.y - 14}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize="10"
                      fill={wasVisited ? '#E7B85C' : 'rgba(240,234,214,0.55)'}
                      letterSpacing="1"
                    >
                      {n.id}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {modeButtons}

          <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-[0.2em]">
            {legendItems.map((li) => (
              <span key={li.label} className="flex items-center gap-2 text-muted">
                <span className="inline-block h-0.5 w-6" style={{ background: li.color }} />
                {li.label}
              </span>
            ))}
          </div>

          {decisionDetail}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="panel px-5 py-4">
              <p className="label mb-3">DECISION POINTS</p>
              {decisionDetail}
            </div>

            <div className="panel px-5 py-4">
              <p className="label mb-3">OPTIMAL PATH</p>
              <p className="font-mono text-xs leading-relaxed text-cream/85">
                {analysis.optimalRoute.join(' → ')}
              </p>
              <p className="label mb-3 mt-5">YOUR ROUTE</p>
              <p className="font-mono text-xs leading-relaxed text-amber">
                {analysis.playerPath.join(' → ')}
              </p>
            </div>
          </div>

          {mstCompare}

          {dpCompare}

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => { play('uiClick'); navigate('/results') }}>
              BACK TO REPORT
            </Button>
            <Button variant="ghost" onClick={() => { useHeistStore.getState().clear(); navigate('/') }}>
              EXIT
            </Button>
          </div>
      </div>
    </div>
  )
}