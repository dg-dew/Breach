// @ts-nocheck
import { motion } from 'framer-motion'
import { Lock, Play, Star } from 'lucide-react'
import type { Mission } from '@/types'
import { ALGORITHM_META } from '@/algorithms'
import { Button } from '@/components/ui/Button'

interface MissionCardProps {
  mission: Mission
  completed: boolean
  unlocked: boolean
  highScore?: number
  isNext?: boolean
  onLaunch: (id: string) => void
}

const difficultyColor = {
  EASY: 'text-success',
  MEDIUM: 'text-amber',
  HARD: 'text-dangerBright',
  EXPERT: 'text-dangerBright',
}

export function MissionCard({
  mission,
  completed,
  unlocked,
  highScore,
  isNext = false,
  onLaunch,
}: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`panel corners group relative p-6 transition-colors ${
        unlocked ? 'hover:border-amber/25' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted">
            OP-{String(mission.order).padStart(2, '0')}
          </span>
          <span className={`font-mono text-[10px] tracking-[0.2em] ${difficultyColor[mission.difficulty]}`}>
            {mission.difficulty}
          </span>
          {isNext && (
            <span className="rounded-sm border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-amber">
              NEXT
            </span>
          )}
        </div>
        {completed && (
          <span className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-success">
            <Star size={12} /> {highScore?.toLocaleString() ?? '—'}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold text-cream">{mission.title}</h3>
      <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-amber">{mission.codename}</p>
      <p className="mt-3 line-clamp-3 font-mono text-xs leading-relaxed text-muted">
        {mission.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
          {ALGORITHM_META[mission.algorithm].name}
        </span>
        {unlocked ? (
          <Button size="sm" variant="outline" onClick={() => onLaunch(mission.id)} className="group/btn">
            <Play size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
            LAUNCH
          </Button>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted">
            <Lock size={12} /> LOCKED
          </span>
        )}
      </div>
    </motion.div>
  )
}