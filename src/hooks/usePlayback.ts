import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AlgorithmResult, GraphEdge } from '@/types'
import { buildReplayFrames } from '@/game/replay'
import type { ReplayFrame } from '@/game/replay'
import type { GraphDisplayState } from '@/components/graph/types'

export interface PlaybackControls {
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  restart: () => void
  jumpTo: (index: number) => void
  setSpeed: (speed: number) => void
}

export function usePlayback(result: AlgorithmResult | null, edges: GraphEdge[], speed = 1) {
  const frames = useMemo<ReplayFrame[]>(() => {
    if (!result) return []
    return buildReplayFrames(result, edges)
  }, [result, edges])

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(speed)
  const timerRef = useRef<number | null>(null)

  const frame = frames[Math.min(index, frames.length - 1)] ?? null

  useEffect(() => {
    if (!playing || frames.length === 0) return
    if (index >= frames.length - 1) {
      setPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setIndex((i) => {
        if (i >= frames.length - 2) {
          setPlaying(false)
          return frames.length - 1
        }
        return i + 1
      })
    }, 900 / playSpeed)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [playing, index, frames.length, playSpeed])

  // Reset index when a new result arrives.
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [result])

  const play = useCallback(() => {
    if (frames.length === 0) return
    if (index >= frames.length - 1) setIndex(0)
    setPlaying(true)
  }, [frames.length, index])

  const pause = useCallback(() => setPlaying(false), [])

  const stepForward = useCallback(() => {
    setPlaying(false)
    setIndex((i) => Math.min(i + 1, frames.length - 1))
  }, [frames.length])

  const stepBackward = useCallback(() => {
    setPlaying(false)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const restart = useCallback(() => {
    setPlaying(false)
    setIndex(0)
  }, [])

  const jumpTo = useCallback((i: number) => {
    setPlaying(false)
    setIndex(Math.max(0, Math.min(i, frames.length - 1)))
  }, [frames.length])

  const setSpeed = useCallback((s: number) => {
    setPlaySpeed(Math.max(0.25, Math.min(4, s)))
  }, [])

  return {
    frames,
    index,
    playing,
    frame,
    playSpeed,
    isComplete: frames.length > 0 && index >= frames.length - 1,
    controls: { play, pause, stepForward, stepBackward, restart, jumpTo, setSpeed } as PlaybackControls,
  }
}

export function emptyDisplay(): GraphDisplayState {
  return {
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
}