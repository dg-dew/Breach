import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HeistController } from '@/game/heist/HeistController'
import { PHASE_META, PHASE_ORDER } from '@/game/heist/types'
import type { HeistPhase } from '@/game/heist/types'
import {
  DP_ASSETS,
  MST_EDGES,
  MST_NODES,
  PATHFINDING_EDGES,
  PATHFINDING_NODES,
  PATHFINDING_START,
  PATHFINDING_TARGET,
  SEARCH_TARGET,
  pathfindingEdgeBetween,
  searchNode,
} from '@/game/heist/world'
import { useHeistStore } from '@/store/heistStore'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { HeistView } from '@/game/heist/HeistController'

const SEGMENTS = ['INFILTRATE', 'SEARCH', 'ROUTE', 'REPAIR', 'EXTRACT']
const SEGMENT_INDEX: Record<HeistPhase, number> = {
  infiltration: 0,
  search: 1,
  pathfinding: 2,
  networkOptimization: 3,
  resourceOptimization: 4,
  extraction: 4,
  complete: 4,
  failed: 4,
}

const fmtTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

interface HeistAction {
  id: string
  kind: 'interact' | 'move' | 'node' | 'route' | 'edge' | 'asset' | 'finalize' | 'undo' | 'reset'
  label: string
  hint?: string
  target?: string
  selected?: boolean
  disabled?: boolean
  danger?: boolean
}

function buildActions(view: HeistView): HeistAction[] {
  const actions: HeistAction[] = []
  const isMovement = view.phase === 'infiltration' || view.phase === 'extraction'

  if (view.interactLabel) {
    actions.push({ id: 'interact', kind: 'interact', label: view.interactLabel, danger: view.phase === 'extraction' })
  }

  if (isMovement) {
    for (const d of view.available) {
      if (d.sealed) {
        actions.push({ id: `sealed-${d.id}`, kind: 'move', label: `${d.name}`, hint: 'ROUTE SEALED', disabled: true })
      } else {
        actions.push({
          id: `move-${d.id}`,
          kind: 'move',
          label: `${d.name}`,
          hint: `${d.dangerous ? 'RISK+' : ''} −${d.timeSec}s · −${d.cost}E · +${d.exposure} EXP`,
          target: d.id,
          danger: d.dangerous,
        })
      }
    }
  }

  if (view.phase === 'search') {
    for (const nodeId of view.searchAvailable) {
      const n = searchNode(nodeId)
      actions.push({
        id: `node-${nodeId}`,
        kind: 'node',
        label: n.isTarget ? `${n.name} ★ TARGET` : n.name,
        hint: `DEPTH ${n.depth}`,
        target: nodeId,
        selected: nodeId === view.searchCurrent,
      })
    }
  }

  if (view.phase === 'pathfinding') {
    for (const nodeId of view.routeAvailable) {
      const n = PATHFINDING_NODES.find((pn) => pn.id === nodeId)
      const edge = pathfindingEdgeBetween(view.routeCurrent, nodeId)
      const isTarget = nodeId === PATHFINDING_TARGET
      actions.push({
        id: `route-${nodeId}`,
        kind: 'route',
        label: n ? (isTarget ? `${n.name} ★ TARGET` : n.name) : nodeId,
        hint: edge ? `COST ${edge.cost} · +${edge.timeSec}s · +${edge.exposure} EXP` : '',
        target: nodeId,
      })
    }
    if (view.routePath.length > 1) {
      actions.push({ id: 'undo-route', kind: 'undo', label: 'UNDO LAST MOVE' })
      actions.push({ id: 'reset-route', kind: 'reset', label: 'RESET ROUTE' })
    }
  }

  if (view.phase === 'networkOptimization') {
    for (const e of MST_EDGES) {
      const selected = view.mstSelected.includes(e.id)
      actions.push({
        id: `edge-${e.id}`,
        kind: 'edge',
        label: `${e.from} ↔ ${e.to}`,
        hint: selected ? `CONNECTED · COST ${e.cost} — PRESS TO DROP` : `COST ${e.cost}`,
        target: e.id,
        selected,
      })
    }
  }

  if (view.phase === 'resourceOptimization') {
    for (const a of DP_ASSETS) {
      const selected = view.dpSelected.includes(a.id)
      actions.push({
        id: `asset-${a.id}`,
        kind: 'asset',
        label: a.name,
        hint: selected ? `+${a.value}V · ${a.cost}W — PRESS TO DROP` : `+${a.value}V · ${a.cost}W`,
        target: a.id,
        selected,
      })
    }
    actions.push({
      id: 'finalize',
      kind: 'finalize',
      label: 'CONFIRM EXTRACTION',
      hint: `SELECTED ${view.dpValue}V · ${view.dpUsed}/${view.dpBudget}W`,
      disabled: view.dpSelected.length === 0,
    })
  }

  return actions
}

function segmentState(
  segIndex: number,
  phaseIndex: number,
  phasesCompleted: number,
): 'active' | 'done' | 'future' {
  if (phaseIndex === segIndex) return 'active'
  if (phasesCompleted > segIndex) return 'done'
  return 'future'
}

export function HeistPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const operator = useHeistStore((s) => s.operator)

  const [controller, setController] = useState<HeistController | null>(() => {
    const snap = useHeistStore.getState().snapshot
    return snap && !snap.complete ? HeistController.fromSnapshot(snap) : null
  })
  const [paused, setPaused] = useState(false)
  const [focus, setFocus] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ phase: HeistPhase; key: number } | null>(null)
  const navigatedRef = useRef(false)

  // No active run → entry. Completed snapshot → results.
  useEffect(() => {
    const snap = useHeistStore.getState().snapshot
    if (!snap || !operator) navigate('/', { replace: true })
    else if (snap.complete) navigate('/results', { replace: true })
  }, [navigate, operator])

  const view: HeistView | null = useSyncExternalStore(
    useCallback((cb: () => void) => (controller ? controller.subscribe(cb) : () => {}), [controller]),
    useCallback(() => (controller ? controller.getView() : null), [controller]),
    () => null,
  )

  // Heist clock.
  useEffect(() => {
    if (!controller || !view) return
    if (view.finished || paused) return
    const id = window.setInterval(() => controller.tick(), 1000)
    return () => window.clearInterval(id)
  }, [controller, paused, view?.finished])

  // Persist every change so a refresh resumes mid-run.
  useEffect(() => {
    if (controller) useHeistStore.getState().setSnapshot(controller.getState())
  }, [controller, view])

  // Navigate to results once the run finishes.
  useEffect(() => {
    if (!view?.finished || navigatedRef.current) return
    navigatedRef.current = true
    const t = window.setTimeout(() => navigate('/results'), 1600)
    return () => window.clearTimeout(t)
  }, [view?.finished, navigate])

  // Phase banner on each phase change.
  useEffect(() => {
    if (!view) return
    setBanner({ phase: view.phase, key: Date.now() })
    const t = window.setTimeout(() => setBanner(null), 2400)
    return () => window.clearTimeout(t)
  }, [view?.phase])

  // Reset selection on phase change.
  useEffect(() => setFocus(0), [view?.phase])

  const actions = useMemo(() => (view ? buildActions(view) : []), [view])

  const trigger = useCallback(
    (action: HeistAction) => {
      if (!controller || action.disabled) return
      switch (action.kind) {
        case 'interact':
          play('uiClick')
          controller.interact()
          break
        case 'move':
          if (controller.move(action.target!)) play('edgeTraverse')
          break
        case 'node':
          if (controller.searchMove(action.target!)) play('nodeActivate')
          break
        case 'route':
          if (controller.routeSelect(action.target!)) play('edgeTraverse')
          else play('warning')
          break
        case 'undo':
          if (controller.undoRoute()) play('uiClick')
          break
        case 'reset':
          if (controller.resetRoute()) play('uiClick')
          break
        case 'edge':
          if (controller.toggleMst(action.target!)) {
            play('uiClick')
          } else {
            play('warning')
            setFlash('CYCLE REJECTED — EDGE WOULD CLOSE A LOOP')
          }
          break
        case 'asset':
          if (controller.toggleAsset(action.target!)) {
            play('uiClick')
          } else {
            play('warning')
            setFlash('CAPACITY EXCEEDED')
          }
          break
        case 'finalize':
          play('uiClick')
          controller.finalizeDp()
          break
      }
    },
    [controller, play],
  )

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 2200)
    return () => window.clearTimeout(t)
  }, [flash])

  // Keyboard controls: W/S cycle, E confirm, ESC pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaused((p) => !p)
        return
      }
      if (paused || actions.length === 0) return
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault()
        setFocus((f) => (f + actions.length - 1) % actions.length)
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFocus((f) => (f + 1) % actions.length)
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault()
        trigger(actions[Math.min(focus, actions.length - 1)])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paused, actions, focus, trigger])

  const restart = useCallback(() => {
    const c = new HeistController(operator)
    useHeistStore.getState().setSnapshot(c.toSnapshot())
    navigatedRef.current = false
    setController(c)
    setPaused(false)
    setFocus(0)
    play('uiClick')
  }, [operator, play])

  const abort = useCallback(() => {
    useHeistStore.getState().clear()
    navigate('/')
  }, [navigate])

  if (!view) return null

  const phase = view.phase
  const meta = PHASE_META[phase] ?? PHASE_META.infiltration
  const bannerMeta = banner ? PHASE_META[banner.phase] : null
  const phasesCompleted = view.phase === 'complete' ? 6 : Math.min(6, (view as any).phasesCompleted ?? 0)

  // Objectives per phase
  const objectives = useMemo(() => {
    const obj: Record<string, string[]> = {
      INFILTRATE: [
        'REACH NETWORK ACCESS ROOM',
        'CHOOSE ENTRY ROUTE (hot vs quiet)',
      ],
      SEARCH: [
        'LOCATE THE ACCESS TERMINAL',
        'EXPLORE THE NETWORK BRANCHES',
      ],
      ROUTE: [
        'REACH THE ARCHIVE CHAMBER',
      ],
      REPAIR: [
        'RESTORE ALL LINES',
        'NO LOOPS',
      ],
      EXTRACT: [
        'MAXIMIZE DATA VALUE',
      ],
    }
    return obj
  }, [])

  // Objectives per phase
  return (
    <div className="grain crt-lines relative flex min-h-screen flex-col bg-bg-base">
      {/* HUD */}
      <header className="border-b border-white/5 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-lg font-bold tracking-[0.18em] text-amber">BREACH</span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted">
              PHASE {String(view.phaseIndex + 1).padStart(2, '0')}/{String(PHASE_ORDER.length).padStart(2, '0')}
            </span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {SEGMENTS.map((s, i) => {
              const active = segmentState(i, SEGMENT_INDEX[phase], phasesCompleted) === 'active'
              const done = segmentState(i, SEGMENT_INDEX[phase], phasesCompleted) === 'done'
              return (
                <div key={s} className="flex items-center gap-1">
                  <span
                    className={`rounded-sm border px-2 py-1 font-mono text-[9px] tracking-[0.2em] ${
                      active
                        ? 'border-amber/60 bg-amber/15 text-amber'
                        : done
                          ? 'border-success/30 text-success'
                          : 'border-white/5 text-muted/60'
                    }`}
                  >
                    {s}
                  </span>
                  {i < SEGMENTS.length - 1 && <span className="h-px w-2 bg-white/10" />}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-5 font-mono text-[11px]">
            <span className={view.timeRemaining <= 60 ? 'text-dangerBright' : 'text-cream'}>
              TIME {fmtTime(view.timeRemaining)}
            </span>
            <span className={`${view.exposure >= 80 ? 'text-dangerBright' : 'text-muted'} hidden sm:inline`}>
              EXP {view.exposure}
            </span>
            <span className={`${view.energy <= 20 ? 'text-dangerBright' : 'text-muted'} hidden sm:inline`}>
              EN {view.energy}
            </span>
          </div>

          {/* Lockdown banner during extraction */}
          {phase === 'extraction' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm"
            >
              <div className="panel corners px-14 py-10 text-center text-dangerBright">
                <p className="label mb-2">LOCKDOWN INITIATED</p>
                <p className="font-mono text-[11px] tracking-[0.3em] text-dangerBright">
                  EXPOSURE +1 / ALERT +2 per second · SECURITY LOCKDOWN
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main play area + right mission HUD */}
      <main className="mx-auto w-full max-w-5xl flex-1 flex flex-col px-6 py-5">
        {/* Objective strip */}
        <div className="mx-auto w-full max-w-5xl px-6 pt-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-amber">▸</span> {view.objectiveText}
          </p>
        </div>

        {/* Phase content area + right mission HUD */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left: main play view */}
          <div className="flex-1">
            {phase === 'search' ? (
              <SearchGrid view={view} focus={focus} actions={actions} onTrigger={trigger} />
            ) : phase === 'pathfinding' ? (
              <RouteGraphView view={view} focus={focus} actions={actions} onTrigger={trigger} />
            ) : phase === 'networkOptimization' ? (
              <MstPanel view={view} focus={focus} actions={actions} onTrigger={trigger} />
            ) : phase === 'resourceOptimization' ? (
              <DpPanel view={view} focus={focus} actions={actions} onTrigger={trigger} />
            ) : (
              <MovementView view={view} focus={focus} actions={actions} onTrigger={trigger} />
            )}
          </div>

          {/* Right: Mission HUD panel */}
          <div className="w-full max-w-sm sm:w-64 flex flex-col sm:items-start border-l sm:border-l border-white/5 pt-4 sm:pt-0">
            {/* Segment indicators */}
            <div className="mb-6">
              <p className="font-mono text-xs text-muted text-center mb-2">MISSION PROGRESS</p>
              {SEGMENTS.map((s, i) => {
                const state = segmentState(i, SEGMENT_INDEX[phase], phasesCompleted)
                const done = state === 'done'
                const active = state === 'active'
                return (
                  <div
                    key={s}
                    className={`rounded-sm border px-2 py-1 font-mono text-[9px] tracking-[0.2em] ${
                      active
                        ? 'border-amber/60 bg-amber/15 text-amber'
                        : done
                          ? 'border-success/30 text-success'
                          : 'border-white/5 text-muted/60'
                    }`}
                  >
                    <span className="font-display capitalize">{s}</span>
                    {done && <span className="text-success/80">✓</span>}
                  </div>
                )
              })}
            </div>

            {/* Current objective */}
            <div className="mb-4">
              <p className="font-mono text-xs text-muted mb-1">CURRENT OBJECTIVE</p>
              <p className="font-mono text-sm text-cream">{view.objectiveText}</p>
            </div>

            {/* TIME / EXPOSURE / ENERGY */}
            <div className="mb-4">
              <p className="font-mono text-xs text-muted mb-2">RESOURCES</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <ProgressBar value={view.exposure} color={view.exposure >= 80 ? 'danger' : 'amber'} label="EXP" />
                  <p className="label mt-1 text-[9px] text-muted">EXP {view.exposure}</p>
                </div>
                <div>
                  <ProgressBar value={view.energy} color="green" label="ENERGY" />
                  <p className="label mt-1 text-[9px] text-muted">EN {view.energy}</p>
                </div>
              </div>
              <ProgressBar value={view.timeRemaining} max={view.timeLimitSec} color="amber" label="TIME" />
              <p className="label mt-1 text-[9px] text-muted">TIME {fmtTime(view.timeRemaining)}</p>
            </div>

            {/* Objectives checklist */}
            <div className="mt-4">
              <p className="font-mono text-xs text-muted mb-1">CHECKLIST</p>
              {SEGMENTS.map((phaseName) => {
                const phaseObjs = objectives[phaseName]
                const done = phaseName === 'INFILTRATE'
                  ? phasesCompleted >= 1
                  : phaseName === 'SEARCH'
                    ? phasesCompleted >= 2
                    : phaseName === 'ROUTE'
                      ? phasesCompleted >= 3
                      : phaseName === 'REPAIR'
                        ? phasesCompleted >= 4
                        : phasesCompleted >= 5
                return (
                  <div
                    key={phaseName}
                    className={`flex items-center gap-2 mb-1 ${
                      done ? 'text-success' : 'text-muted'
                    }`}
                  >
                    <span className="flex-1">{phaseName}:</span>
                    {phaseObjs.map((obj) => (
                      <span
                        key={obj}
                        className={`font-mono text-[9px] ${done ? 'text-success/80' : 'text-muted/60'}`}
                      >
                        {done ? `✓ ${obj}` : obj}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Flash message */}
        {flash && (
          <div className="mt-4 rounded-sm border border-danger/50 bg-danger/10 px-4 py-3 text-center font-mono text-xs tracking-[0.2em] text-dangerBright">
            {flash}
          </div>
        )}

        {/* Phase banner */}
        <AnimatePresence>
          {banner && bannerMeta && (
            <motion.div
              key={banner.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm"
            >
              <div className="panel corners px-14 py-10 text-center">
                <p className="label mb-2">
                  PHASE {String(banner.phase === 'complete' ? PHASE_ORDER.length + 1 : SEGMENT_INDEX[banner.phase] + 1).padStart(2, '0')}
                </p>
                <h2 className="font-display text-4xl font-bold tracking-[0.15em] text-amber text-shadow-amber">
                  {banner.phase === 'complete' ? 'OPERATION COMPLETE' : banner.phase === 'failed' ? 'OPERATION FAILED' : meta.title}
                </h2>
                <p className="mt-3 font-mono text-[11px] tracking-[0.3em] text-muted">
                  DSA CONCEPT · {banner.phase === 'complete' || banner.phase === 'failed' ? 'SIX PHASES SYNTHESIZED' : bannerMeta.concept}
                </p>
                <p className="mt-2 font-mono text-xs text-cream/80">
                  {banner.phase === 'failed' ? view.failedReason : view.objectiveText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause overlay */}
        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm"
            >
              <div className="panel corners w-full max-w-sm px-8 py-8 text-center">
                <h2 className="font-display text-2xl font-bold tracking-[0.2em] text-cream">PAUSED</h2>
                <div className="mt-6 flex flex-col gap-3">
                  <Button variant="primary" onClick={() => setPaused(false)}>
                    RESUME
                  </Button>
                  <Button variant="outline" onClick={restart}>
                    RESTART HEIST
                  </Button>
                  <Button variant="ghost" onClick={abort}>
                    ABANDON OPERATION
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ---------------------------------------------------------------- subviews */

interface ActionProps {
  focus: number
  actions: HeistAction[]
  onTrigger: (a: HeistAction) => void
}

function ActionGrid({ focus, actions, onTrigger }: ActionProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {actions.map((a, i) => {
        const active = i === focus
        const sel = a.selected
        return (
          <button
            key={a.id}
            onClick={() => onTrigger(a)}
            className={`rounded-sm border px-4 py-3 text-left transition-all ${
              active
                ? 'border-amber/70 bg-amber/10 shadow-halo'
                : sel
                  ? 'border-success/50 bg-success/10'
                  : a.danger
                    ? 'border-danger/40 bg-danger/5'
                    : 'border-white/10 bg-surface/60 hover:border-white/25'
            } ${a.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`font-display text-base font-semibold ${sel ? 'text-success' : 'text-cream'}`}>
                {active && <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] bg-amber" />}
                {a.label}
              </span>
              {sel && <span className="font-mono text-[10px] tracking-[0.2em] text-success">SELECTED</span>}
            </div>
            {a.hint && <p className="mt-1 font-mono text-[10px] tracking-widest text-muted">{a.hint}</p>}
          </button>
        )
      })}
    </div>
  )
}

function MovementView({ view, focus, actions, onTrigger }: ActionProps & { view: HeistView }) {
  return (
    <div className="space-y-5">
      <div className="panel px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {view.pathNames.map((name, i) => (
            <span key={`${name}-${i}`} className="flex items-center gap-2">
              {i > 0 && <span className="text-amber">→</span>}
              <span className={`font-mono text-[11px] tracking-widest ${i === view.pathNames.length - 1 ? 'text-amber' : 'text-muted'}`}>
                {name}
              </span>
            </span>
          ))}
        </div>
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="label">CURRENT LOCATION</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-cream">{view.currentName}</h2>
          <p className="mt-1 font-mono text-[11px] text-muted">
            {view.currentKind.toUpperCase()} · SECURITY RATING {view.currentDescription ? '—' : ''}
          </p>
          <p className="mt-1 font-mono text-xs text-cream/70">{view.currentDescription}</p>
        </div>
      </div>
      <ActionGrid focus={focus} actions={actions} onTrigger={onTrigger} />
    </div>
  )
}

function SearchGrid({ view, focus, actions, onTrigger }: ActionProps & { view: HeistView }) {
  const visited = new Set(view.searchVisited)
  return (
    <div className="space-y-5">
      <div className="panel px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">INTERNAL NETWORK — LOGICAL LAYER</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              VISITED {view.searchVisited.length} · REVEALED {view.searchKnown.length} · CURRENT{' '}
              <span className="text-amber">{searchNode(view.searchCurrent).name}</span>
            </p>
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted">BFS · DFS TRAVERSAL</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {view.searchKnown.map((id) => {
          const n = searchNode(id)
          const isCurrent = id === view.searchCurrent
          const wasVisited = visited.has(id)
          const isTarget = id === SEARCH_TARGET
          return (
            <div
              key={id}
              className={`rounded-sm border px-3 py-2.5 ${
                isCurrent
                  ? 'border-amber/70 bg-amber/10'
                  : isTarget
                    ? 'border-success/40 bg-success/5'
                    : 'border-white/10 bg-surface/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[11px] tracking-widest ${isCurrent ? 'text-amber' : isTarget ? 'text-success' : 'text-cream'}`}>
                  {n.name}
                </span>
                {isTarget && <span className="font-mono text-[9px] tracking-[0.2em] text-success">TARGET</span>}
              </div>
              <p className="mt-1 font-mono text-[9px] tracking-widest text-muted">
                {isCurrent ? '● CURRENT' : wasVisited ? '● VISITED' : '○ IN RANGE'}
              </p>
            </div>
          )
        })}
      </div>

      <div className="panel px-6 py-4">
        <p className="label mb-3">CHOOSE NEXT NODE</p>
        <ActionGrid focus={focus} actions={actions} onTrigger={onTrigger} />
      </div>
    </div>
  )
}

function RouteGraphView({ view, focus, actions, onTrigger }: ActionProps & { view: HeistView }) {
  const routeSet = new Set(view.routePath)
  const routeOrder = new Map(view.routePath.map((id, i) => [id, i]))
  const locked = view.routeLocked
  return (
    <div className="space-y-5">
      <div className="panel px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">DATA NETWORK — WEIGHTED ROUTE</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              ROUTE TO ARCHIVE · CURRENT{' '}
              <span className="text-amber">{PATHFINDING_NODES.find((n) => n.id === view.routeCurrent)?.name}</span>
            </p>
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted">DIJKSTRA · SHORTEST PATH</span>
        </div>
      </div>

      <div className="panel overflow-x-auto px-2 py-4">
        <svg viewBox="0 0 700 520" className="mx-auto min-w-[620px]" role="img" aria-label="Weighted network graph">
          {PATHFINDING_EDGES.map((e) => {
            const a = PATHFINDING_NODES.find((n) => n.id === e.from)!
            const b = PATHFINDING_NODES.find((n) => n.id === e.to)!
            const used = routeSet.has(e.from) && routeSet.has(e.to) && Math.abs((routeOrder.get(e.from) ?? 0) - (routeOrder.get(e.to) ?? 0)) === 1
            return (
              <g key={e.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={used ? 'stroke-amber' : 'stroke-white/25'}
                  strokeWidth={used ? 3 : 1.5}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 6}
                  textAnchor="middle"
                  className="fill-cream/70 font-mono"
                  fontSize="13"
                >
                  {e.cost}
                </text>
              </g>
            )
          })}

          {PATHFINDING_NODES.map((n) => {
            const isCurrent = n.id === view.routeCurrent
            const isStart = n.id === PATHFINDING_START
            const isTarget = n.id === PATHFINDING_TARGET
            const inRoute = routeSet.has(n.id)
            const selectable = !locked && !inRoute && !isCurrent
            return (
              <g
                key={n.id}
                onClick={() => selectable && onTrigger({ id: `route-${n.id}`, kind: 'route', label: n.name, target: n.id })}
                className={selectable ? 'cursor-pointer' : ''}
              >
                {isStart && <circle cx={n.x} cy={n.y} r={24} className="fill-success/10" />}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={16}
                  className={
                    isCurrent
                      ? 'fill-amber/20'
                      : inRoute
                        ? 'fill-success/20'
                        : selectable
                          ? 'fill-surface'
                          : 'fill-surface/60'
                  }
                  stroke="currentColor"
                  strokeWidth={isCurrent || inRoute || isTarget ? 2.5 : 1.5}
                />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10" className="fill-cream/80 font-mono">
                  {isStart ? '●' : isTarget ? '◎' : isCurrent ? '◆' : inRoute ? routeOrder.get(n.id)! + 1 : ''}
                </text>
                <text
                  x={n.x}
                  y={n.y + 32}
                  textAnchor="middle"
                  fontSize="10"
                  className={isTarget ? 'fill-amber font-mono' : 'fill-muted font-mono'}
                >
                  {n.name}
                </text>
                {isStart && (
                  <text x={n.x} y={n.y - 26} textAnchor="middle" fontSize="9" className="fill-success font-mono tracking-widest">
                    START
                  </text>
                )}
                {isTarget && (
                  <text x={n.x} y={n.y - 26} textAnchor="middle" fontSize="9" className="fill-amber font-mono tracking-widest">
                    TARGET
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="panel px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="label">CURRENT ROUTE</p>
            <span className="font-mono text-[10px] tracking-widest text-muted">COST {view.routeCost}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {view.routePath.map((id, i) => (
              <span key={id} className="font-mono text-[10px] tracking-widest text-cream">
                {PATHFINDING_NODES.find((n) => n.id === id)?.name}
                {i < view.routePath.length - 1 && <span className="text-amber"> → </span>}
              </span>
            ))}
            {view.routePath.length === 0 && <span className="font-mono text-[10px] text-muted">NO ROUTE SET</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onTrigger({ id: 'undo-route', kind: 'undo', label: 'UNDO LAST MOVE' })}
              disabled={locked || view.routePath.length <= 1}
              className="btn-secondary"
            >
              UNDO LAST MOVE
            </button>
            <button
              onClick={() => onTrigger({ id: 'reset-route', kind: 'reset', label: 'RESET ROUTE' })}
              disabled={locked || view.routePath.length <= 1}
              className="btn-secondary"
            >
              RESET ROUTE
            </button>
          </div>
        </div>
        <div className="panel px-6 py-4">
          <p className="label mb-3">{locked ? 'ROUTE LOCKED — READY' : 'CHOOSE NEXT NODE'}</p>
          <ActionGrid focus={focus} actions={actions} onTrigger={onTrigger} />
        </div>
      </div>
    </div>
  )
}

function MstPanel({ view, focus, actions, onTrigger }: ActionProps & { view: HeistView }) {
  const selectedCount = view.mstSelected.length
  const needed = MST_NODES.length - 1
  return (
    <div className="space-y-5">
      <div className="panel px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">DAMAGED POWER NETWORK — RESTORE</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              CONNECTED {selectedCount}/{needed} LINES · TOTAL COST{' '}
              <span className="text-amber">{view.mstTotal}</span>
              {view.mstConnected && <span className="text-success"> · NETWORK STABLE</span>}
            </p>
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted">MINIMUM SPANNING TREE</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={selectedCount} max={needed} color={view.mstConnected ? 'green' : 'amber'} label="mst progress" />
        </div>
      </div>
      <div className="panel px-6 py-4">
        <p className="label mb-3">SELECT LINES — CHEAPEST TOTAL, NO LOOPS</p>
        <ActionGrid focus={focus} actions={actions} onTrigger={onTrigger} />
      </div>
    </div>
  )
}

function DpPanel({ view, focus, actions, onTrigger }: ActionProps & { view: HeistView }) {
  return (
    <div className="space-y-5">
      <div className="panel px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">ARCHIVE RECOVERY — CAPACITY {view.dpBudget}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              SELECTED VALUE <span className="text-amber">{view.dpValue}</span> · WEIGHT{' '}
              <span className="text-cream">{view.dpUsed}/${view.dpBudget}</span>
            </p>
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted">DYNAMIC PROGRAMMING</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={view.dpUsed} max={view.dpBudget} color={view.dpUsed > view.dpBudget ? 'danger' : 'amber'} label="capacity" />
        </div>
      </div>
      <div className="panel px-6 py-4">
        <p className="label mb-3">CHOOSE WHAT TO CARRY OUT</p>
        <ActionGrid focus={focus} actions={actions} onTrigger={onTrigger} />
      </div>
    </div>
  )
}