// @ts-nocheck
import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Timer, Zap } from 'lucide-react'
import type { AlgorithmType, Mission } from '@/types'
import { MISSIONS, useGameStore } from '@/store/gameStore'
import { Graph } from '@/data-structures/Graph'
import { runAlgorithm, ALGORITHM_META } from '@/algorithms'
import { computeScore, toMissionResult } from '@/game/scoring/scoring'
import { generateMission } from '@/game/missions/proceduralGenerator'
import { GraphCanvasMemo } from '@/components/graph/GraphCanvas'
import { usePlayback } from '@/hooks/usePlayback'
import { SidePanel } from '@/components/algorithm/SidePanel'
import { PlaybackControlsBar } from '@/components/algorithm/PlaybackControls'
import { MissionBriefing } from '@/components/mission/MissionBriefing'
import { MissionComplete } from '@/components/mission/MissionComplete'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useSound } from '@/hooks/useSound'
import { useSettingsStore } from '@/store/settingsStore'

type Phase = 'briefing' | 'playing' | 'complete'

export function MissionPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()
  const staticMission = MISSIONS.find((m) => m.id === missionId)
  const mission: Mission | undefined = useMemo(() => {
    if (staticMission) return staticMission
    if (missionId?.startsWith('proc-')) {
      const seed = Number(missionId.replace('proc-', '')) || 1
      return generateMission(seed)
    }
    return undefined
  }, [missionId, staticMission])
  const { play } = useSound()
  const graphSpeed = useSettingsStore((s) => s.graphSpeed)
  const completeMission = useGameStore((s) => s.completeMission)
  const recordProficiency = useGameStore((s) => s.recordProficiency)

  const [phase, setPhase] = useState<Phase>('briefing')
  const [elapsed, setElapsed] = useState(0)
  const [exposure, setExposure] = useState(0)
  const [completeData, setCompleteData] = useState<{ breakdown: ReturnType<typeof computeScore>; timeMs: number } | null>(null)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(mission?.algorithm ?? 'BFS')

  const startedAt = useRef(0)
  const timerRef = useRef<number | null>(null)

  const graph = useMemo(() => (mission ? new Graph(mission.graph) : null), [mission])

  const isMst = mission?.algorithm === 'PRIM' || mission?.algorithm === 'KRUSKAL'
  const availableAlgos: AlgorithmType[] = isMst
    ? ['PRIM', 'KRUSKAL']
    : ['BFS', 'DFS', 'DIJKSTRA', 'PRIORITY_QUEUE']

  // The algorithm the player chose — drives the visible replay.
  const runResult = useMemo(() => {
    if (!graph || !mission) return null
    if (isMst) return runAlgorithm(selectedAlgorithm, graph, mission.entryNode)
    return runAlgorithm(selectedAlgorithm, graph, mission.entryNode, mission.targetNode)
  }, [graph, mission, selectedAlgorithm, isMst])

  // The mission's prescribed algorithm — the optimal baseline for scoring.
  const optimalResult = useMemo(() => {
    if (!graph || !mission) return null
    if (isMst) return runAlgorithm(mission.algorithm, graph, mission.entryNode)
    return runAlgorithm(mission.algorithm, graph, mission.entryNode, mission.targetNode)
  }, [graph, mission, isMst])

  const playback = usePlayback(
    phase === 'playing' ? runResult : null,
    graph?.edges ?? [],
    graphSpeed,
  )

  useEffect(() => {
    if (!mission) {
      navigate('/operations', { replace: true })
    }
  }, [mission, navigate])

  useEffect(() => {
    if (phase === 'playing') {
      startedAt.current = Date.now()
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
      }, 1000)
      play('uiClick')
      // Auto-run the algorithm so execution is visible immediately.
      playback.controls.play()
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, play])

  if (!mission || !graph) return null

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleStart = () => setPhase('playing')

  const handleRun = () => {
    setPhase('complete')
    const timeMs = Date.now() - startedAt.current
    if (runResult && optimalResult) {
      const optimalCost = optimalResult.pathCost
      const optimalVisits = optimalResult.totalVisits
      const exposureVal = Math.round(
        Math.min(100, (runResult.totalVisits / Math.max(1, graph.nodeCount)) * 38 + 4),
      )
      const breakdown = computeScore(mission, {
        timeMs,
        pathCost: runResult.pathCost,
        nodesVisited: runResult.totalVisits,
        exposure: exposureVal,
        optimalCost,
        optimalVisits,
      })
      setExposure(exposureVal)
      setCompleteData({ breakdown, timeMs })
      const mr = toMissionResult(mission, breakdown, {
        timeMs,
        pathCost: runResult.pathCost,
        nodesVisited: runResult.totalVisits,
        exposure: exposureVal,
        algorithm: selectedAlgorithm,
      })
      completeMission(mr)
      recordProficiency(mission.algorithm, breakdown.efficiency)
      if (breakdown.score > 0) play('missionComplete')
    }
  }

  const handleRestart = () => {
    setPhase('briefing')
    setElapsed(0)
    playback.controls.restart()
  }

  const frame = playback.frame
  const currentNode = frame?.display.active ?? null
  const currentDistance = currentNode ? frame?.display.distances[currentNode] : undefined

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex h-full max-w-[1700px] gap-5 p-4 lg:p-6">
        {/* Left: graph + HUD */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* HUD */}
          <div className="panel corners flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-[220px]">
              <p className="label">MISSION OBJECTIVE</p>
              <p className="mt-1 font-mono text-xs text-cream sm:text-sm">{mission.objective}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="label">TIME</p>
                <p className="mt-1 flex items-center gap-1.5 font-display text-xl font-semibold text-cream">
                  <Timer size={16} className="text-amber" /> {fmtTime(elapsed)}
                </p>
              </div>
              <div className="w-28">
                <p className="label">THREAT</p>
                <div className="mt-2"><ProgressBar value={exposure || 20} color="danger" /></div>
              </div>
              <div>
                <p className="label">EXPOSURE</p>
                <p className="mt-1 font-display text-xl font-semibold text-dangerBright">{exposure || 0}%</p>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="panel corners relative min-h-[420px] flex-1 overflow-hidden">
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative h-full">
              <GraphCanvasMemo
                nodes={mission.graph.nodes}
                edges={mission.graph.edges}
                display={frame?.display ?? emptyDisplayFallback()}
                entryNode={mission.entryNode}
                targetNode={mission.targetNode}
                interactive={false}
                animateEdges={phase === 'playing'}
              />
            </div>

            {/* Run / status overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
              <PlaybackControlsBar
                controls={playback.controls}
                playing={playback.playing}
                isComplete={playback.isComplete}
                disabled={phase !== 'playing'}
              />
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-widest text-muted">
                  STEP {Math.min(playback.index + 1, playback.frames.length)} / {playback.frames.length}
                </span>
                <Button variant="primary" size="md" onClick={handleRun} disabled={phase !== 'playing'}>
                  <Zap size={15} /> RUN ALGORITHM
                </Button>
              </div>
            </div>
          </div>

          {/* Algorithm selector */}
          <div className="panel corners flex flex-wrap items-center gap-3 px-5 py-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted">DEPLOY ALGORITHM</span>
            <div className="flex flex-wrap gap-2">
              {availableAlgos.map((algo) => (
                <button
                  key={algo}
                  onClick={() => {
                    setSelectedAlgorithm(algo)
                    playback.controls.restart()
                  }}
                  className={`rounded-sm px-3 py-1.5 font-mono text-[10px] tracking-widest transition-colors ${
                    selectedAlgorithm === algo
                      ? 'border border-amber/50 bg-amber/10 text-amber'
                      : 'border border-white/10 text-muted hover:text-cream'
                  }`}
                  aria-pressed={selectedAlgorithm === algo}
                >
                  {algo}
                </button>
              ))}
            </div>
            <span className="ml-auto hidden font-mono text-[10px] tracking-widest text-muted md:block">
              RECOMMENDED: <span className="text-amber">{ALGORITHM_META[mission.algorithm].name}</span>
            </span>
          </div>
        </div>

        {/* Right: side panel */}
        <div className="hidden w-[340px] shrink-0 lg:block">
          <SidePanel
            algorithm={selectedAlgorithm}
            currentNode={currentNode}
            currentDistance={currentDistance}
            queueSnapshot={frame?.queueSnapshot ?? null}
            log={frame?.log ?? []}
          />
        </div>
      </div>

      <AnimatePresence>
        {phase === 'briefing' && (
          <MissionBriefing
            mission={mission}
            onStart={handleStart}
            onClose={() => navigate('/operations')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'complete' && completeData && (
          <MissionComplete
            mission={mission}
            algorithm={selectedAlgorithm}
            hasNext={mission.order < MISSIONS.length}
            path={runResult?.path ?? []}
            cost={runResult?.pathCost ?? 0}
            nodesVisited={runResult?.totalVisits ?? 0}
            timeMs={completeData.timeMs}
            exposure={exposure}
            breakdown={completeData.breakdown}
            onNext={
              mission.order < MISSIONS.length
                ? () => navigate(`/mission/${MISSIONS[mission.order].id}`)
                : () => navigate('/operations')
            }
            onReplay={handleRestart}
            onDashboard={() => navigate('/operations')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function emptyDisplayFallback() {
  return {
    visited: new Set<string>(),
    active: null,
    queued: [],
    pathNodes: [],
    pathEdges: new Set<string>(),
    selectedEdges: [],
    rejectedEdges: [],
    flashEdge: null,
    distances: {},
  }
}