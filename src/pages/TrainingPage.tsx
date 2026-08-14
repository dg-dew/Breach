import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ALGORITHM_META } from '@/algorithms'
import { TRAINING } from '@/game/training/trainingData'

const ORDER: Array<keyof typeof TRAINING> = ['BFS', 'DFS', 'DIJKSTRA', 'PRIM', 'KRUSKAL', 'PRIORITY_QUEUE']

export function TrainingPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
      <div className="mb-10">
        <p className="label mb-2">TRAINING MODE</p>
        <h1 className="font-display text-4xl font-semibold text-cream">Algorithm Doctrine</h1>
        <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted">
          Every algorithm here is a live, interactive system — not a textbook page.
          Watch it run, read the pseudocode, then apply it in a real breach.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORDER.map((key, i) => {
          const content = TRAINING[key]
          const meta = ALGORITHM_META[key]
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              onClick={() => navigate(`/training/${key.toLowerCase()}`)}
              className="panel corners group p-6 text-left transition-colors hover:border-amber/25"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-amber">{key}</span>
                <span className="font-mono text-[10px] text-muted">{meta.time}</span>
              </div>
              <h3 className="font-display text-xl font-medium text-cream">{content.title}</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted">{content.tagline}</p>
              <div className="mt-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-amber opacity-0 transition-opacity group-hover:opacity-100">
                OPEN DOCTRINE <ArrowRight size={12} />
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}