import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Monitor, Shield, Zap } from 'lucide-react'
import { HeroNetwork } from '@/components/graph/HeroNetwork'
import { Button } from '@/components/ui/Button'
import { usePlayerStore } from '@/store/playerStore'
import { useSound } from '@/hooks/useSound'

export function LandingPage() {
  const navigate = useNavigate()
  const isInitialized = usePlayerStore((s) => s.isInitialized)
  const { play } = useSound()

  const startMission = () => {
    play('uiClick')
    if (!isInitialized) {
      navigate('/safehouse')
    } else {
      navigate('/contracts')
    }
  }

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-deep/20 blur-[140px]" aria-hidden="true" />

        <div className="relative mx-auto grid w-full max-w-[1600px] items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
          <div className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-amber/25 bg-amber/5 px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] text-amber"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber" />
              BREACH v1.0 — OPERATIONAL
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-6xl font-bold leading-none tracking-tight text-cream sm:text-7xl lg:text-8xl"
            >
              BREACH
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22 }}
              className="mt-3 font-mono text-sm tracking-[0.4em] text-amber text-shadow-amber"
            >
              THE ALGORITHMIC INFILTRATION
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.34 }}
              className="mt-8 max-w-md font-display text-lg leading-relaxed text-muted"
            >
              Every system has a path. Find it before the system finds you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.46 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button variant="primary" size="lg" onClick={startMission} className="group">
                <span>{isInitialized ? 'ENTER SAFEHOUSE' : 'INITIALIZE BREACH'}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/archive')}>
                <Monitor size={18} />
                ENTER ARCHIVE
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex items-center gap-6 font-mono text-[10px] tracking-[0.2em] text-muted"
            >
              <span className="flex items-center gap-2">
                <Zap size={10} className="text-amber" /> SYSTEM READY
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span>6 ACTS · 19 CONTRACTS · ENDLESS REPLAYABILITY</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="panel corners relative hidden aspect-square w-full max-w-[640px] justify-self-end overflow-hidden p-0 sm:block"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-bg-deep/40" />
            <HeroNetwork />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-between px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-muted">
              <span>LIVE NETWORK FEED</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" /> STABLE
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES - Game-focused, not DSA modules */}
      <section className="relative border-t border-white/5 py-24">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="label mb-2">OPERATIONAL CAPABILITIES</p>
              <h2 className="font-display text-3xl font-semibold text-cream">
                Your toolkit. Your tradecraft.
              </h2>
            </div>
            <p className="hidden max-w-sm font-mono text-xs leading-relaxed text-muted md:block">
              Six acts. Nineteen contracts. One operator.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="panel group cursor-default p-6 transition-colors hover:border-amber/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-amber">01</span>
                <Shield size={16} className="text-success" />
              </div>
              <h3 className="font-display text-lg font-medium text-cream">CAMPAIGN-DRIVEN HEISTS</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
                Six acts from INITIATE to ARCHITECT. Each contract is a hand-crafted operation with narrative, risk, and reward.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="panel group cursor-default p-6 transition-colors hover:border-amber/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-amber">02</span>
                <Zap size={16} className="text-amber" />
              </div>
              <h3 className="font-display text-lg font-medium text-cream">DSA-POWERED GAMEPLAY</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
                BFS/DFS for recon. Dijkstra for routes. Prim/Kruskal for rebuild. Queue/Stack for pressure. DP for optimization. The algorithms are the engine — you're the driver.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="panel group cursor-default p-6 transition-colors hover:border-amber/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-amber">03</span>
                <Monitor size={16} className="text-muted" />
              </div>
              <h3 className="font-display text-lg font-medium text-cream">PERSISTENT OPERATOR</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
                Your callsign, rank, reputation, credits, and archetype persist. Every operation builds your legend. DSA proficiency tracked across five domains.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TERMINAL STRIP */}
      <section className="border-t border-white/5 bg-bg-deep/50 py-14">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="panel corners overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 font-mono text-[10px] tracking-[0.2em] text-muted">breach://session.log</span>
            </div>
            <div className="space-y-2 p-6 font-mono text-xs leading-relaxed">
              <p className="text-muted">
                <span className="text-amber">$</span> breach init — loading operator profile...
              </p>
              <p className="text-muted">
                <span className="text-amber">$</span> campaign load — 6 acts available
              </p>
              <p className="text-success">→ ACT I: THE NETWORK — 3 contracts ready</p>
              <p className="text-muted">
                <span className="text-amber">$</span> contracts sync — FIRST CONTACT featured
              </p>
              <p className="text-success">→ Standing by for initialization</p>
              <p className="animate-flicker text-amber">▌</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-semibold text-cream sm:text-5xl"
          >
            The network is listening.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-4 max-w-md font-mono text-sm leading-relaxed text-muted"
          >
            Your first contract awaits. Initialize breach and enter the safehouse.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Button variant="primary" size="lg" onClick={startMission}>
              {isInitialized ? 'ENTER SAFEHOUSE' : 'INITIALIZE BREACH'}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/archive')}>
              ENTER ARCHIVE
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-6 font-mono text-[10px] tracking-[0.2em] text-muted sm:flex-row lg:px-12">
          <span>BREACH — THE ALGORITHMIC INFILTRATION</span>
          <span className="flex items-center gap-2">
            POWERED BY <span className="text-amber">GRAPHS · HEAPS · TREES · QUEUES · DP</span>
          </span>
        </div>
      </footer>
    </div>
  )
}