import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, Clock, Shield, ChevronRight, Lock, CheckCircle, 
  XCircle, Star, Zap, Target
} from 'lucide-react'
import { useCampaignStore } from '@/store/campaignStore'
import { useSound } from '@/hooks/useSound'
import { CONTRACTS } from '@/gameplay/contracts/contracts'
import type { Contract } from '@/types'

const riskColors: Record<string, string> = {
  LOW: 'text-success border-success/30 bg-success/5',
  MEDIUM: 'text-amber border-amber/30 bg-amber/5',
  HIGH: 'text-danger border-danger/30 bg-danger/5',
  EXTREME: 'text-danger border-danger/50 bg-danger/10',
}

const statusIcons: Record<string, typeof CheckCircle> = {
  available: Shield,
  locked: Lock,
  completed: CheckCircle,
  failed: XCircle,
  active: AlertTriangle,
}

export function ContractsPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const acceptContract = useCampaignStore((s) => s.acceptContract)
  const contractStatuses = useCampaignStore((s) => s.contractStatuses)
  const featuredContractId = useCampaignStore((s) => s.featuredContractId)
  const currentActId = useCampaignStore((s) => s.currentActId)

  const getContractStatus = (contract: Contract): string => {
    return contractStatuses?.[contract.id] ?? 'locked'
  }

  const handleAcceptContract = (contract: Contract) => {
    play('uiClick')
    acceptContract(contract.id)
    navigate(`/mission/${contract.id}`)
  }

  const handleViewContract = (contract: Contract) => {
    play('uiClick')
    if (getContractStatus(contract) === 'completed') {
      // Could show debrief/archive
      navigate('/archive')
    }
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
            <Target size={16} className="text-amber" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-amber">MISSION BOARD</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-cream mb-2">CONTRACTS</h1>
          <p className="font-mono text-sm text-muted tracking-[0.2em]">
            SELECT YOUR NEXT OPERATION
          </p>
        </motion.div>

        {/* Featured Contract */}
        {featuredContractId && (() => {
          const featured = CONTRACTS.find(c => c.id === featuredContractId)
          if (!featured) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="panel corners p-8 mb-8 border-amber/30 bg-gradient-to-br from-amber/5 to-transparent"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} className="text-amber" />
                <span className="font-mono text-[10px] tracking-[0.3em] text-amber">FEATURED CONTRACT</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-display text-3xl font-bold text-cream mb-2">
                    {featured.title}
                  </h2>
                  <p className="font-mono text-xs text-muted mb-4">
                    CLIENT: {featured.client} • TARGET: {featured.target}
                  </p>
                  <p className="font-display text-sm text-muted/80 leading-relaxed max-w-2xl">
                    {featured.briefing}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted mb-1">PAYOUT</p>
                    <p className="font-display text-2xl font-bold text-amber">
                      ₹{featured.payout.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptContract(featured)}
                    className="flex items-center gap-2 bg-amber text-bg-deep px-6 py-3 font-mono text-xs tracking-[0.1em] rounded-sm hover:bg-amber/90 transition-colors"
                  >
                    ACCEPT CONTRACT <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })()}

        {/* Contract Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTRACTS.map((contract, i) => {
            const status = getContractStatus(contract)
            const StatusIcon = statusIcons[status]
            const isLocked = status === 'locked'
            const isCompleted = status === 'completed'
            const isActive = status === 'active'

            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className={`panel corners p-6 transition-all ${
                  isActive ? 'border-amber/50 bg-amber/5' :
                  isCompleted ? 'border-success/30 bg-success/5' :
                  isLocked ? 'opacity-60' : 'hover:border-amber/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon size={14} className={
                      isActive ? 'text-amber' :
                      isCompleted ? 'text-success' :
                      isLocked ? 'text-muted' : 'text-muted'
                    } />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
                      {contract.actId}
                    </span>
                  </div>
                  <span className={`font-mono text-[10px] tracking-[0.2em] px-2 py-1 rounded-sm border ${
                    riskColors[contract.risk]
                  }`}>
                    {contract.risk}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-semibold text-cream mb-2">
                  {contract.title}
                </h3>
                <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-4">
                  {contract.client} • {contract.target}
                </p>

                {/* Briefing */}
                <p className="font-mono text-xs text-muted/70 leading-relaxed mb-6 line-clamp-3">
                  {contract.briefing}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-1">PAYOUT</p>
                    <p className="font-display text-sm font-semibold text-amber">
                      ₹{contract.payout.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-1">TIME</p>
                    <p className="font-display text-sm font-semibold text-cream flex items-center gap-1">
                      <Clock size={12} className="text-muted" />
                      {contract.estimatedTime}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-1">RANK</p>
                    <p className="font-display text-sm font-semibold text-cream">
                      {contract.requiredRank}
                    </p>
                  </div>
                </div>

                {/* Action */}
                {isLocked ? (
                  <div className="flex items-center gap-2 font-mono text-xs text-muted">
                    <Lock size={12} />
                    REQUIRES {contract.requiredRank}
                  </div>
                ) : isActive ? (
                  <button
                    onClick={() => navigate(`/mission/${contract.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-amber text-bg-deep py-2 font-mono text-xs tracking-[0.1em] rounded-sm hover:bg-amber/90 transition-colors"
                  >
                    RESUME MISSION <ChevronRight size={14} />
                  </button>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleViewContract(contract)}
                    className="w-full flex items-center justify-center gap-2 border border-success/30 text-success py-2 font-mono text-xs tracking-[0.1em] rounded-sm hover:bg-success/5 transition-colors"
                  >
                    VIEW DEBRIEF <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAcceptContract(contract)}
                    className="w-full flex items-center justify-center gap-2 border border-amber/30 text-amber py-2 font-mono text-xs tracking-[0.1em] rounded-sm hover:bg-amber/5 transition-colors"
                  >
                    ACCEPT CONTRACT <ChevronRight size={14} />
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 panel corners p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-muted" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted">CONTRACT INTEL</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-muted">
            <div>
              <span className="text-muted/50">TOTAL CONTRACTS: </span>
              <span className="text-cream">{CONTRACTS.length}</span>
            </div>
            <div>
              <span className="text-muted/50">COMPLETED: </span>
              <span className="text-success">{Object.values(contractStatuses).filter(s => s === 'completed').length}</span>
            </div>
            <div>
              <span className="text-muted/50">FAILED: </span>
              <span className="text-danger">{Object.values(contractStatuses).filter(s => s === 'failed').length}</span>
            </div>
            <div>
              <span className="text-muted/50">CURRENT ACT: </span>
              <span className="text-amber">{currentActId}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}