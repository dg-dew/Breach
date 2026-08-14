import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  User, Shield, Zap, TrendingUp, TrendingDown, 
  ChevronRight, Clock, Award, BarChart3
} from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { usePerformanceStore } from '@/store/performanceStore'
import { useSound } from '@/hooks/useSound'

const archetypeDescriptions: Record<string, string> = {
  THE_EXPLORER: 'Master of network reconnaissance and discovery. Excels at BFS/DFS traversal and uncovering hidden nodes.',
  ROUTE_ARCHITECT: 'Expert pathfinder. Specializes in Dijkstra and weighted graph optimization for optimal routes.',
  NETWORK_ENGINEER: 'Infrastructure specialist. Masters Prim/Kruskal for minimum spanning tree and network optimization.',
  PRESSURE_HANDLER: 'Crisis management expert. excels with Stack/Queue operations under time pressure.',
  THE_OPTIMIZER: 'Strategic planner. Dynamic programming specialist for complex resource optimization.',
  HYBRID: 'Versatile operator with balanced skills across all domains.',
}

const conceptColors: Record<string, string> = {
  GRAPH_TRAVERSAL: 'bg-success',
  PATHFINDING: 'bg-amber',
  NETWORK_OPTIMIZATION: 'bg-muted',
  STACK_QUEUE: 'bg-danger',
  DYNAMIC_PROGRAMMING: 'bg-amber',
}

export function OperatorPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const profile = usePlayerStore((s) => s.profile)
  const conceptProfiles = usePerformanceStore((s) => s.conceptProfiles)
  const missionHistory = usePerformanceStore((s) => s.missionHistory)

  const successRate = profile?.completedOps && profile?.failedOps
    ? Math.round((profile.completedOps / (profile.completedOps + profile.failedOps)) * 100)
    : 0

  // Calculate strongest and weakest domains from concept profiles
  const sortedConcepts = Object.entries(conceptProfiles)
    .sort(([, a], [, b]) => b.proficiency - a.proficiency)
  const strongestDomain = sortedConcepts[0]?.[0] ?? null
  const weakestDomain = sortedConcepts[sortedConcepts.length - 1]?.[0] ?? null

  const getProficiencyColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-amber'
    return 'text-danger'
  }

  const getProficiencyLabel = (score: number) => {
    if (score >= 80) return 'EXCELLENT'
    if (score >= 60) return 'GOOD'
    if (score >= 40) return 'DEVELOPING'
    return 'BEGINNER'
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-12">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <User size={16} className="text-amber" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-amber">OPERATOR PROFILE</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-cream mb-2">OPERATOR</h1>
          <p className="font-mono text-sm text-muted tracking-[0.2em]">
            YOUR IDENTITY & PROFICIENCY
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="panel corners p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield size={14} className="text-amber" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-amber">IDENTITY</span>
            </div>

            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-sm bg-amber/10 border border-amber/30 flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-amber">
                  {profile?.callsign?.charAt(0) ?? '?'}
                </span>
              </div>
              <h2 className="font-display text-3xl font-bold text-cream mb-1">
                {profile?.callsign ?? 'UNDEFINED'}
              </h2>
              <p className="font-mono text-xs tracking-[0.3em] text-amber">
                {profile?.rank ?? 'INITIATE'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-sm bg-bg-deep">
                <span className="font-mono text-xs text-muted">CREDITS</span>
                <span className="font-display text-lg font-semibold text-amber">
                  ₹{profile?.credits?.toLocaleString() ?? '0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-sm bg-bg-deep">
                <span className="font-mono text-xs text-muted">REPUTATION</span>
                <span className="font-display text-lg font-semibold text-cream">
                  {profile?.reputation?.toLocaleString() ?? '0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-sm bg-bg-deep">
                <span className="font-mono text-xs text-muted">SUCCESS RATE</span>
                <span className={`font-display text-lg font-semibold ${getProficiencyColor(successRate)}`}>
                  {successRate}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-sm bg-bg-deep">
                <span className="font-mono text-xs text-muted">OPERATIONS</span>
                <span className="font-display text-lg font-semibold text-cream">
                  {profile?.completedOps ?? 0} / {(profile?.completedOps ?? 0) + (profile?.failedOps ?? 0)}
                </span>
              </div>
            </div>

            {/* Archetype */}
            <div className="mt-6 p-4 rounded-sm border border-amber/30 bg-amber/5">
              <div className="flex items-center gap-2 mb-2">
                <Award size={14} className="text-amber" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-amber">ARCHETYPE</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-cream mb-2">
                {profile?.archetype?.replace(/_/g, ' ') ?? 'UNCLASSIFIED'}
              </h3>
              <p className="font-mono text-xs text-muted/70 leading-relaxed">
                {profile?.archetype ? archetypeDescriptions[profile.archetype] : 'Complete more operations to determine your archetype.'}
              </p>
            </div>
          </motion.div>

          {/* DSA Proficiency */}
          <div className="space-y-6">
            {/* Overall Proficiency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={14} className="text-muted" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">ALGORITHMIC PROFICIENCY</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(conceptProfiles).map(([concept, data]) => (
                  <div key={concept} className="p-4 rounded-sm bg-bg-deep border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-muted tracking-[0.1em]">
                        {concept.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-mono text-xs font-semibold ${getProficiencyColor(data.proficiency)}`}>
                        {getProficiencyLabel(data.proficiency)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-sm overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.proficiency}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`absolute left-0 top-0 h-full ${conceptColors[concept] ?? 'bg-muted'}`}
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                      <span>{data.proficiency}%</span>
                      <span>{data.missionsPlayed} MISSIONS</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Strengths & Weaknesses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={14} className="text-success" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">ANALYSIS</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={12} className="text-success" />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-success">STRONGEST DOMAIN</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-cream mb-2">
                    {strongestDomain?.replace(/_/g, ' ') ?? 'UNDEFINED'}
                  </h3>
                  <p className="font-mono text-xs text-muted/70 leading-relaxed">
                    {strongestDomain 
                      ? 'Your most developed algorithmic skill based on mission performance.'
                      : 'Complete more operations to identify your strengths.'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={12} className="text-danger" />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-danger">DEVELOPMENT AREA</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-cream mb-2">
                    {weakestDomain?.replace(/_/g, ' ') ?? 'UNDEFINED'}
                  </h3>
                  <p className="font-mono text-xs text-muted/70 leading-relaxed">
                    {weakestDomain
                      ? 'Consider taking contracts that challenge this domain to improve.'
                      : 'Complete more operations to identify areas for growth.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mission History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock size={14} className="text-muted" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">RECENT OPERATIONS</span>
              </div>

              {missionHistory.length > 0 ? (
                <div className="space-y-3">
                  {missionHistory.slice(0, 5).map((mission, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-sm bg-bg-deep"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${mission.success ? 'bg-success' : 'bg-danger'}`} />
                        <span className="font-mono text-xs text-cream">{mission.missionId}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-[10px] text-muted">
                        <span>SCORE: {mission.score}</span>
                        <span>{mission.success ? 'SUCCESS' : 'FAILED'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-muted/50 text-center py-8">
                  NO OPERATIONS RECORDED YET
                </p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-amber" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-amber">ACTIONS</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => { play('uiClick'); navigate('/contracts') }}
                  className="flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">VIEW CONTRACTS</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => { play('uiClick'); navigate('/archive') }}
                  className="flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">ALGORITHM ARCHIVE</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => { play('uiClick'); navigate('/safehouse') }}
                  className="flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">RETURN TO SAFEHOUSE</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => { play('uiClick'); navigate('/settings') }}
                  className="flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">SETTINGS</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}