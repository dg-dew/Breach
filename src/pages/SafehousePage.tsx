import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, Terminal, Search, Shield, User, Archive, Settings,
  ChevronRight, AlertTriangle, Clock, Cpu, Zap, Radio
} from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useSound } from '@/hooks/useSound'
import { CONTRACTS } from '@/gameplay/contracts/contracts'
import { useEffect, useState } from 'react'

interface HubArea {
  id: string
  title: string
  subtitle: string
  icon: typeof FileText
  route: string
  color: string
  description: string
}

const hubAreas: HubArea[] = [
  {
    id: 'contracts',
    title: 'CONTRACTS',
    subtitle: 'MISSION BOARD',
    icon: FileText,
    route: '/contracts',
    color: 'text-amber',
    description: 'View available operations and accept new contracts'
  },
  {
    id: 'terminal',
    title: 'TERMINAL',
    subtitle: 'SYSTEM ACCESS',
    icon: Terminal,
    route: '/network',
    color: 'text-success',
    description: 'Access network tools and system diagnostics'
  },
  {
    id: 'intel',
    title: 'INTEL',
    subtitle: 'NETWORK MAP',
    icon: Search,
    route: '/network',
    color: 'text-muted',
    description: 'Review network intelligence and mission data'
  },
  {
    id: 'equipment',
    title: 'EQUIPMENT',
    subtitle: 'GEAR UP',
    icon: Shield,
    route: '/operator',
    color: 'text-amber',
    description: 'Upgrade your tools and operational gear'
  },
  {
    id: 'operator',
    title: 'OPERATOR',
    subtitle: 'PROFILE',
    icon: User,
    route: '/operator',
    color: 'text-muted',
    description: 'View your operator profile and DSA proficiency'
  },
  {
    id: 'archive',
    title: 'ARCHIVE',
    subtitle: 'KNOWLEDGE BASE',
    icon: Archive,
    route: '/archive',
    color: 'text-muted',
    description: 'Access algorithm archives and performance data'
  },
  {
    id: 'settings',
    title: 'SETTINGS',
    subtitle: 'CONFIGURATION',
    icon: Settings,
    route: '/settings',
    color: 'text-muted',
    description: 'Adjust system settings and preferences'
  }
]

export function SafehousePage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const profile = usePlayerStore((s) => s.profile)
  const isInitialized = usePlayerStore((s) => s.isInitialized)
  const initialize = usePlayerStore((s) => s.initialize)
  const currentActId = useCampaignStore((s) => s.currentActId)
  const featuredContractId = useCampaignStore((s) => s.featuredContractId)
  const [showInit, setShowInit] = useState(false)
  const [callsign, setCallsign] = useState('')

  useEffect(() => {
    if (!isInitialized) {
      setShowInit(true)
    }
  }, [isInitialized])

  const handleInitialize = () => {
    if (callsign.trim()) {
      initialize(callsign.trim().toUpperCase())
      play('uiClick')
      setShowInit(false)
    }
  }

  const handleAreaClick = (area: HubArea) => {
    play('uiClick')
    navigate(area.route)
  }

  if (showInit) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel corners max-w-md w-full p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-sm border border-amber/25 bg-amber/5 px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] text-amber mb-4">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber" />
              BREACH INITIALIZATION
            </div>
            <h1 className="font-display text-4xl font-bold text-cream mb-2">OPERATOR SETUP</h1>
            <p className="font-mono text-sm text-muted">
              Enter your callsign to initialize the breach protocol
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] text-muted mb-2">
                CALLSIGN
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                placeholder="ENTER CALLSIGN"
                className="w-full bg-bg-deep border border-white/10 rounded-sm px-4 py-3 font-mono text-cream placeholder:text-muted/50 focus:outline-none focus:border-amber/50 transition-colors"
                maxLength={16}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleInitialize()}
              />
            </div>

            <button
              onClick={handleInitialize}
              disabled={!callsign.trim()}
              className="w-full bg-amber text-bg-deep font-mono text-sm tracking-[0.2em] py-3 rounded-sm hover:bg-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              INITIALIZE BREACH
            </button>

            <p className="text-center font-mono text-[10px] text-muted/50 tracking-[0.2em]">
              THIS ACTION CANNOT BE UNDONE
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-12">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-success">SYSTEM ONLINE</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-cream mb-2">SAFEHOUSE</h1>
          <p className="font-mono text-sm text-muted tracking-[0.2em]">
            WELCOME BACK, {profile?.callsign ?? 'OPERATOR'}
          </p>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel corners p-6 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted mb-1">RANK</p>
              <p className="font-display text-xl font-semibold text-amber">{profile?.rank ?? 'INITIATE'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted mb-1">CREDITS</p>
              <p className="font-display text-xl font-semibold text-cream">₹{profile?.credits?.toLocaleString() ?? '0'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted mb-1">REPUTATION</p>
              <p className="font-display text-xl font-semibold text-cream">{profile?.reputation?.toLocaleString() ?? '0'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted mb-1">SUCCESS RATE</p>
              <p className="font-display text-xl font-semibold text-success">
                {profile?.completedOps && profile?.failedOps
                  ? Math.round((profile.completedOps / (profile.completedOps + profile.failedOps)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Featured Contract Alert */}
        {featuredContractId && (() => {
          const featured = CONTRACTS.find(c => c.id === featuredContractId)
          if (!featured) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="panel corners p-6 mb-8 border-amber/30 bg-amber/5"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={16} className="text-amber" />
                <span className="font-mono text-xs tracking-[0.2em] text-amber">FEATURED CONTRACT</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-cream">
                    {featured.title}
                  </h3>
                  <p className="font-mono text-xs text-muted">
                    {featured.target} • {featured.risk} RISK
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/contracts`)}
                  className="flex items-center gap-2 bg-amber text-bg-deep px-4 py-2 font-mono text-xs tracking-[0.1em] rounded-sm hover:bg-amber/90 transition-colors"
                >
                  VIEW <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )
        })()}

        {/* Hub Areas Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hubAreas.map((area, i) => (
            <motion.button
              key={area.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => handleAreaClick(area)}
              className="panel group cursor-default p-6 text-left transition-colors hover:border-amber/20"
            >
              <div className="flex items-center justify-between mb-4">
                <area.icon size={20} className={area.color} />
                <ChevronRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-display text-lg font-semibold text-cream mb-1">{area.title}</h3>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted mb-3">{area.subtitle}</p>
              <p className="font-mono text-xs text-muted/70 leading-relaxed">{area.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 panel corners p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={14} className="text-muted" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted">SESSION INFO</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-muted">
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-muted/50" />
              <span>OPS COMPLETED: {profile?.completedOps ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-muted/50" />
              <span>OPS FAILED: {profile?.failedOps ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-muted/50" />
              <span>ARCHETYPE: {profile?.archetype ?? 'UNCLASSIFIED'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio size={12} className="text-muted/50" />
              <span>ACT: {currentActId ?? 'I'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}