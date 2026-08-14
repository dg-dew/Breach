import { Play, Pause, StepForward, StepBack, RotateCcw } from 'lucide-react'
import type { PlaybackControls } from '@/hooks/usePlayback'

interface PlaybackControlsProps {
  controls: PlaybackControls
  playing: boolean
  isComplete: boolean
  disabled?: boolean
}

export function PlaybackControlsBar({ controls, playing, isComplete, disabled = false }: PlaybackControlsProps) {
  const btn =
    'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 text-muted transition-all hover:border-amber/40 hover:text-amber disabled:cursor-not-allowed disabled:opacity-30'

  return (
    <div className="flex items-center gap-2">
      <button className={btn} onClick={controls.stepBackward} disabled={disabled} aria-label="Step backward">
        <StepBack size={14} />
      </button>
      <button
        className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
          playing
            ? 'border-amber/50 bg-amber/10 text-amber'
            : 'border-amber/30 text-amber hover:bg-amber/10'
        }`}
        onClick={playing ? controls.pause : isComplete ? controls.restart : controls.play}
        disabled={disabled}
        aria-label={playing ? 'Pause' : isComplete ? 'Replay' : 'Play'}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <button className={btn} onClick={controls.stepForward} disabled={disabled} aria-label="Step forward">
        <StepForward size={14} />
      </button>
      <button className={btn} onClick={controls.restart} disabled={disabled} aria-label="Restart">
        <RotateCcw size={14} />
      </button>
    </div>
  )
}