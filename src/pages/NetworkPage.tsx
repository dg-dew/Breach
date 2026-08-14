import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Network, Search, Eye, EyeOff, Lock, Unlock, AlertTriangle,
  ChevronRight, Radio, Shield, Zap
} from 'lucide-react'
import { useCampaignStore } from '@/store/campaignStore'
import { useSound } from '@/hooks/useSound'
import { useState } from 'react'

interface NetworkNode {
  id: string
  type: 'terminal' | 'router' | 'database' | 'server' | 'vault' | 'target' | 'exit'
  label: string
  discovered: boolean
  compromised: boolean
  locked: boolean
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface NetworkEdge {
  id: string
  from: string
  to: string
  weight: number
  compromised: boolean
  hidden: boolean
}

// Sample network data - in real implementation this would come from mission state
const sampleNodes: NetworkNode[] = [
  { id: 'n1', type: 'terminal', label: 'ENTRY POINT', discovered: true, compromised: false, locked: false, risk: 'LOW' },
  { id: 'n2', type: 'router', label: 'ROUTER-01', discovered: true, compromised: false, locked: false, risk: 'LOW' },
  { id: 'n3', type: 'server', label: 'SERVER-03', discovered: false, compromised: false, locked: false, risk: 'MEDIUM' },
  { id: 'n4', type: 'database', label: 'DATABASE-02', discovered: false, compromised: false, locked: true, risk: 'HIGH' },
  { id: 'n5', type: 'vault', label: 'VAULT', discovered: false, compromised: false, locked: false, risk: 'HIGH' },
  { id: 'n6', type: 'target', label: 'TARGET', discovered: false, compromised: false, locked: false, risk: 'HIGH' },
  { id: 'n7', type: 'exit', label: 'EXIT', discovered: true, compromised: false, locked: false, risk: 'LOW' },
]

const sampleEdges: NetworkEdge[] = [
  { id: 'e1', from: 'n1', to: 'n2', weight: 2, compromised: false, hidden: false },
  { id: 'e2', from: 'n2', to: 'n3', weight: 3, compromised: false, hidden: false },
  { id: 'e3', from: 'n2', to: 'n4', weight: 5, compromised: false, hidden: true },
  { id: 'e4', from: 'n3', to: 'n5', weight: 4, compromised: false, hidden: false },
  { id: 'e5', from: 'n4', to: 'n5', weight: 2, compromised: false, hidden: false },
  { id: 'e6', from: 'n5', to: 'n6', weight: 6, compromised: false, hidden: false },
  { id: 'e7', from: 'n6', to: 'n7', weight: 3, compromised: false, hidden: false },
]

const nodeColors: Record<string, string> = {
  terminal: 'bg-success',
  router: 'bg-amber',
  database: 'bg-muted',
  server: 'bg-muted',
  vault: 'bg-danger',
  target: 'bg-amber',
  exit: 'bg-success',
}

const riskColors: Record<string, string> = {
  LOW: 'text-success',
  MEDIUM: 'text-amber',
  HIGH: 'text-danger',
  EXTREME: 'text-danger',
}

export function NetworkPage() {
  const navigate = useNavigate()
  const { play } = useSound()
  const contractStatuses = useCampaignStore((s) => s.contractStatuses)
  const [nodes, setNodes] = useState<NetworkNode[]>(sampleNodes)
  const [edges] = useState<NetworkEdge[]>(sampleEdges)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [scanMode, setScanMode] = useState(false)

  const discoveredCount = nodes.filter(n => n.discovered).length
  const totalCount = nodes.length

  const handleNodeClick = (node: NetworkNode) => {
    play('uiClick')
    setSelectedNode(node)
    
    // Simulate discovery
    if (!node.discovered) {
      setNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, discovered: true } : n
      ))
    }
  }

  const handleScan = () => {
    play('uiClick')
    setScanMode(true)
    
    // Simulate scanning - discover nearby nodes
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (!n.discovered && Math.random() > 0.5) {
          return { ...n, discovered: true }
        }
        return n
      }))
      setScanMode(false)
    }, 1500)
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
            <Network size={16} className="text-amber" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-amber">NETWORK OPERATIONS</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-cream mb-2">NETWORK</h1>
          <p className="font-mono text-sm text-muted tracking-[0.2em]">
            RECONNAISSANCE & INTELLIGENCE
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Network View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="panel corners p-6"
          >
            {/* Network Stats */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-success" />
                  <span className="font-mono text-xs text-muted">
                    DISCOVERED: {discoveredCount}/{totalCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-amber" />
                  <span className="font-mono text-xs text-muted">
                    CONTRACTS: {Object.keys(contractStatuses).length}
                  </span>
                </div>
              </div>
              <button
                onClick={handleScan}
                disabled={scanMode}
                className="flex items-center gap-2 bg-amber/10 border border-amber/30 text-amber px-4 py-2 font-mono text-xs tracking-[0.1em] rounded-sm hover:bg-amber/20 transition-colors disabled:opacity-50"
              >
                {scanMode ? (
                  <>
                    <span className="animate-spin">⟳</span> SCANNING...
                  </>
                ) : (
                  <>
                    <Search size={14} /> SCAN NETWORK
                  </>
                )}
              </button>
            </div>

            {/* Network Visualization */}
            <div className="relative bg-bg-deep rounded-sm border border-white/5 p-8 min-h-[400px]">
              {/* Simplified network grid visualization */}
              <div className="absolute inset-0 grid grid-cols-7 gap-4 p-8 opacity-20">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className="border border-white/5 rounded-sm" />
                ))}
              </div>

              {/* Nodes */}
              <div className="relative flex flex-wrap justify-center gap-8 items-center min-h-[300px]">
                {nodes.map((node, i) => (
                  <motion.button
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    onClick={() => handleNodeClick(node)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-sm border transition-all ${
                      selectedNode?.id === node.id
                        ? 'border-amber/50 bg-amber/10'
                        : node.discovered
                        ? 'border-white/20 bg-white/5 hover:border-amber/30'
                        : 'border-white/10 bg-white/5 opacity-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${
                      node.discovered ? nodeColors[node.type] : 'bg-muted/20'
                    }`}>
                      {node.discovered ? (
                        <span className="font-mono text-xs font-bold text-bg-deep">
                          {node.type.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-muted">?</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.1em] text-muted">
                      {node.discovered ? node.label : 'UNKNOWN'}
                    </span>
                    {node.locked && (
                      <Lock size={10} className="absolute top-2 right-2 text-danger" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Edges (simplified as lines) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {edges.filter(e => !e.hidden).map((edge) => {
                  const fromNode = nodes.find(n => n.id === edge.from)
                  const toNode = nodes.find(n => n.id === edge.to)
                  if (!fromNode || !toNode) return null
                  // Simplified positioning
                  return (
                    <line
                      key={edge.id}
                      x1={`${20 + parseInt(edge.from.slice(1)) * 12}%`}
                      y1={`${50 + (parseInt(edge.from.slice(1)) % 2) * 20}%`}
                      x2={`${20 + parseInt(edge.to.slice(1)) * 12}%`}
                      y2={`${50 + (parseInt(edge.to.slice(1)) % 2) * 20}%`}
                      stroke={edge.compromised ? '#D6A84F' : 'rgba(255,255,255,0.1)'}
                      strokeWidth="2"
                      strokeDasharray={edge.compromised ? "5,5" : "none"}
                    />
                  )
                })}
              </svg>
            </div>
          </motion.div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Selected Node Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={14} className="text-muted" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">NODE INSPECTOR</span>
              </div>
              
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-1">TYPE</p>
                    <p className="font-display text-lg font-semibold text-cream uppercase">
                      {selectedNode.type}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-1">LABEL</p>
                    <p className="font-mono text-sm text-cream">
                      {selectedNode.discovered ? selectedNode.label : 'CLASSIFIED'}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-muted mb-1">RISK LEVEL</p>
                    <p className={`font-mono text-sm font-semibold ${riskColors[selectedNode.risk]}`}>
                      {selectedNode.risk}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {selectedNode.discovered ? (
                        <Eye size={12} className="text-success" />
                      ) : (
                        <EyeOff size={12} className="text-muted" />
                      )}
                      <span className="font-mono text-xs text-muted">
                        {selectedNode.discovered ? 'DISCOVERED' : 'UNDISCOVERED'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedNode.locked ? (
                        <Lock size={12} className="text-danger" />
                      ) : (
                        <Unlock size={12} className="text-success" />
                      )}
                      <span className="font-mono text-xs text-muted">
                        {selectedNode.locked ? 'LOCKED' : 'ACCESSIBLE'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-xs text-muted/50 text-center py-8">
                  SELECT A NODE TO INSPECT
                </p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-amber" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-amber">ACTIONS</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/contracts')}
                  className="w-full flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">VIEW CONTRACTS</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => navigate('/operator')}
                  className="w-full flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">OPERATOR PROFILE</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => navigate('/archive')}
                  className="w-full flex items-center justify-between p-3 rounded-sm border border-white/10 hover:border-amber/30 transition-colors"
                >
                  <span className="font-mono text-xs text-cream">ALGORITHM ARCHIVE</span>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </motion.div>

            {/* Network Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="panel corners p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className="text-muted" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">STATUS</span>
              </div>
              <div className="space-y-3 font-mono text-xs text-muted">
                <div className="flex items-center justify-between">
                  <span>NETWORK STATUS</span>
                  <span className="text-success">OPERATIONAL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SECURITY LEVEL</span>
                  <span className="text-amber">STANDARD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ACTIVE CONNECTIONS</span>
                  <span className="text-cream">{edges.filter(e => !e.compromised).length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}