import type { Contract, Difficulty, MissionType, OperatorRank, RiskLevel } from '@/types'

let order = 0

interface CContract {
  id: string
  actId: string
  title: string
  codename: string
  client: string
  target: string
  payout: number
  reputationReward: number
  risk: RiskLevel | string
  difficulty: Difficulty | string
  estimatedTime: string
  requiredRank: OperatorRank | string
  missionType: MissionType | string
  objective: string
  narrative: string
  briefing: string[]
  featured?: boolean
  seed?: number
}

function toContract(c: CContract): Contract {
  return { ...c, order: order++, status: 'locked' } as Contract
}

/**
 * The contract list. Contracts are the missions the player accepts; the
 * campaign unlocks them act by act. All targets are fictional.
 */
export const CONTRACTS = [
  // ------------------------------------------------------------------ ACT I
  {
    id: 'c1',
    actId: 'act-1',
    title: 'FIRST CONTACT',
    codename: 'FIRST LIGHT',
    client: 'REDACTED',
    target: 'TERMINAL-04 — Meridian Logistics uplink',
    payout: 1200,
    reputationReward: 400,
    risk: 'LOW',
    difficulty: 'EASY',
    estimatedTime: '08:00',
    requiredRank: 'INITIATE',
    missionType: 'recon',
    objective: 'Locate the hidden terminal inside a small, half-lit network.',
    narrative:
      'Your first real job. A contact has stitched together the skeleton of a small corporate network and wants to know what is hiding in it. Half the grid is dark. Find the terminal, take the data, and get out before the night shift clocks in.',
    briefing: [
      'The network is only partially mapped — most nodes are dark until you get close.',
      'Move between discovered nodes to scan forward. Each hop costs energy and raises exposure.',
      'Find the TERMINAL node to complete recon, then reach the extraction point.',
      'Keep alert below 100%. Lockdown will seal routes and bring every security gate online.',
    ],
    featured: true,
    seed: 101,
  },
  {
    id: 'c2',
    actId: 'act-1',
    title: 'SILENT CORRIDORS',
    codename: 'BLACK CORRIDOR',
    client: 'A PRIVATE COLLECTOR',
    target: 'ARCHIVE-07 — Cold-storage archive node',
    payout: 1600,
    reputationReward: 520,
    risk: 'MEDIUM',
    difficulty: 'EASY',
    estimatedTime: '10:00',
    requiredRank: 'INITIATE',
    missionType: 'recon',
    objective: 'Push deep through a dark corridor maze and breach the archive.',
    narrative:
      'The collector wants records that were supposed to be destroyed. The corridor is a maze of dead routers and false paths. You will need to commit to a direction and keep moving — hesitating here means patrolling watchers.',
    briefing: [
      'Deeper networks hide their true structure — expect dead ends and long dark runs.',
      'Decoy nodes raise alert when touched. Read the node type before you commit.',
      'Energy is limited. If you run dry you cannot move — plan the route you commit to.',
    ],
    seed: 102,
  },
  {
    id: 'c3',
    actId: 'act-1',
    title: 'ECHO CHAMBER',
    codename: 'FULL CIRCLE',
    client: 'MERIDIAN GROUP (PROXY)',
    target: 'VAULT-3 — Client vault',
    payout: 2400,
    reputationReward: 720,
    risk: 'HIGH',
    difficulty: 'MEDIUM',
    estimatedTime: '12:00',
    requiredRank: 'INITIATE',
    missionType: 'recon',
    objective: 'Traverse a large half-mapped network with decoys and gates to reach the vault.',
    narrative:
      'Meridian ran a quiet security audit and found something in their own basement. The map they gave you is wrong on purpose. Decoys are scattered like bait. Find the vault before the gates learn your footsteps.',
    briefing: [
      'Larger grid — several security gates are live. Gates add heavy alert when crossed.',
      'Decoys are seeded across the map and punish careless movement.',
      'A deep scan or decoy gadget can save your run. Equip before accepting.',
    ],
    seed: 103,
  },

  // ----------------------------------------------------------------- ACT II
  {
    id: 'c4',
    actId: 'act-2',
    title: 'BLACK VAULT',
    codename: 'NIGHT WINDOW',
    client: 'REDACTED',
    target: 'VAULT-X — Private financial vault',
    payout: 4000,
    reputationReward: 1100,
    risk: 'HIGH',
    difficulty: 'MEDIUM',
    estimatedTime: '15:00',
    requiredRank: 'SCOUT',
    missionType: 'route',
    objective: 'Reach the vault by the lowest-exposure route — not the shortest.',
    narrative:
      'A private vault sits behind three corridors of automated security. The direct path is a gauntlet. The clean path is long, quiet, and weighted with risk you can read if you look. The route analyzer is yours to use. Weigh every corridor.',
    briefing: [
      'Routes carry both distance and risk. The cheapest total exposure wins.',
      'Use the ROUTE ANALYZER to compute and follow the lowest-exposure route.',
      'Extraction activates the moment you breach — escape before alert caps.',
    ],
    featured: true,
    seed: 201,
  },
  {
    id: 'c5',
    actId: 'act-2',
    title: 'QUIET FOOTSTEPS',
    codename: 'LOW SIGNAL',
    client: 'GHOST FREIGHT',
    target: 'CORE-06 — Freight manifest core',
    payout: 5000,
    reputationReward: 1350,
    risk: 'HIGH',
    difficulty: 'MEDIUM',
    estimatedTime: '18:00',
    requiredRank: 'SCOUT',
    missionType: 'route',
    objective: 'Thread a weighted security grid to the core without lighting up the board.',
    narrative:
      'Ghost Freight moves things that never reach customs. Their manifest lives in a core node guarded by a grid of interlocking patrol zones. Every crossing writes a line in the security log. Keep the log boring.',
    briefing: [
      'Security checkpoints add heavy alert — route around them when the analyzer says so.',
      'Blocked routes can be reopened once with an OVERRIDE. Choose the lock wisely.',
    ],
    seed: 202,
  },
  {
    id: 'c6',
    actId: 'act-2',
    title: 'ZERO DAY CROSSING',
    codename: 'FAST ZERO',
    client: 'THE WEATHERMAN',
    target: 'CROSSROAD-09 — Protocol exchange',
    payout: 7600,
    reputationReward: 1900,
    risk: 'CRITICAL',
    difficulty: 'HARD',
    estimatedTime: '22:00',
    requiredRank: 'SCOUT',
    missionType: 'route',
    objective: 'Cross a dense weighted network with dynamic route changes in a single clean pass.',
    narrative:
      'The exchange processes a protocol handshake at dawn — your only clean window. The network is dense and several corridors will seal behind you as you move. One pass. No rewinds. Make it count.',
    briefing: [
      'Some corridors seal permanently after you pass through them — no backtracking.',
      'The route analyzer is your only friend. Use it before committing.',
      'Lockdown is fatal here. Keep alert low and energy in reserve.',
    ],
    seed: 203,
  },

  // ----------------------------------------------------------------- ACT III
  {
    id: 'c7',
    actId: 'act-3',
    title: 'WIRES AND WEAKNESS',
    codename: 'REGRID',
    client: 'MERIDIAN GROUP (PROXY)',
    target: 'Grid regeneration — 7 critical nodes',
    payout: 5200,
    reputationReward: 1300,
    risk: 'MEDIUM',
    difficulty: 'MEDIUM',
    estimatedTime: '16:00',
    requiredRank: 'RUNNER',
    missionType: 'rebuild',
    objective: 'Reconnect every critical node using the minimum total infrastructure cost.',
    narrative:
      'The audit you survived last act cost them a firewall. Now they want the grid rebuilt — but the accounting department wants it at minimum cost. Choose which links to restore. Every unit of cable is on the invoice.',
    briefing: [
      'Select links to reconnect. Every critical node must be connected.',
      'Your cost is compared against the mathematically minimum grid.',
      'The cheapest spanning grid always exists — find it and you are paid.',
    ],
    seed: 301,
  },
  {
    id: 'c8',
    actId: 'act-3',
    title: 'BRIDGE OF ASHES',
    codename: 'RESPATCH',
    client: 'CITY TRANSIT (LEAKED)',
    target: 'Transit backbone — 9 nodes',
    payout: 6800,
    reputationReward: 1650,
    risk: 'HIGH',
    difficulty: 'HARD',
    estimatedTime: '20:00',
    requiredRank: 'RUNNER',
    missionType: 'rebuild',
    objective: 'Restore a damaged city backbone at minimum cost with expensive long links.',
    narrative:
      'A city bus network burned a junction box that took a whole district offline. The fix must be cheap, because the fix is being paid for by people who do not know they are paying. Reconnect the backbone. Spend nothing extra.',
    briefing: [
      'Long-range links are expensive. Short local links are cheap.',
      'Every node must stay connected to the grid.',
      'Your rebuild cost is scored against the optimal spanning network.',
    ],
    seed: 302,
  },
  {
    id: 'c9',
    actId: 'act-3',
    title: 'MERIDIAN RELINK',
    codename: 'GRIDLOCK',
    client: 'MERIDIAN GROUP (PROXY)',
    target: 'Meridian campus — 11 nodes',
    payout: 9200,
    reputationReward: 2200,
    risk: 'CRITICAL',
    difficulty: 'HARD',
    estimatedTime: '24:00',
    requiredRank: 'RUNNER',
    missionType: 'rebuild',
    objective: 'Rebuild the campus grid at near-optimal cost under time pressure.',
    narrative:
      'Meridian finally trusts you — about as far as they throw you. The campus grid is fragmented and their security team is racing the same repair crews you are. Reconnect the campus before they do. Be fast. Be cheap.',
    briefing: [
      'Large node set. Study the weights before committing to links.',
      'Every wrong link raises your invoice — and your score drops with it.',
    ],
    seed: 303,
  },

  // ----------------------------------------------------------------- ACT IV
  {
    id: 'c10',
    actId: 'act-4',
    title: 'TICK OVER',
    codename: 'STACKED DECK',
    client: 'HANDLER "MOUSE"',
    target: 'Incoming ops queue — 8 tasks',
    payout: 5600,
    reputationReward: 1400,
    risk: 'MEDIUM',
    difficulty: 'MEDIUM',
    estimatedTime: '14:00',
    requiredRank: 'RUNNER',
    missionType: 'queue',
    objective: 'Process incoming tasks in urgency order before their windows close.',
    narrative:
      'Mouse runs a dispatch desk and her board is melting. A burst of jobs lands at once — decrypts, relays, trace-jams — each with a deadline and a penalty. You handle them one at a time. Pick the wrong order and the board bleeds.',
    briefing: [
      'Tasks arrive over time and sit in a queue.',
      'Handle the most urgent task first — the one closest to its deadline.',
      'Each completed task pays; each missed deadline adds alert.',
    ],
    seed: 401,
  },
  {
    id: 'c11',
    actId: 'act-4',
    title: 'PANIC ROOM',
    codename: 'RATIO',
    client: 'HANDLER "MOUSE"',
    target: 'Emergency queue — 10 tasks',
    payout: 7400,
    reputationReward: 1800,
    risk: 'HIGH',
    difficulty: 'HARD',
    estimatedTime: '18:00',
    requiredRank: 'RUNNER',
    missionType: 'queue',
    objective: 'Survive a task flood: prioritize, process, and hold the line.',
    narrative:
      'A ward-wide panic. Every handler in the district is routing to you. The queue grows faster than you clear it. Priorities shift. A stack of emergency traces stacks at the back while high-value decrypts scream at the front.',
    briefing: [
      'New tasks push in continuously — the queue is never empty.',
      'Low-value quick tasks can buy time, but high-value tasks pay.',
      'Letting the queue grow past capacity triggers a lockdown.',
    ],
    seed: 402,
  },
  {
    id: 'c12',
    actId: 'act-4',
    title: 'ALL HANDS',
    codename: 'OVERFLOW',
    client: 'HANDLER "MOUSE"',
    target: 'Total ops storm — 12 tasks',
    payout: 9800,
    reputationReward: 2350,
    risk: 'CRITICAL',
    difficulty: 'EXPERT',
    estimatedTime: '22:00',
    requiredRank: 'RUNNER',
    missionType: 'queue',
    objective: 'Clear the storm with near-perfect urgency discipline.',
    narrative:
      'This is what the district looks like when the whole grid is on fire. Mouse is barely audible over the alert feed. Every decision is a queue operation. The operator who sorts by urgency survives; everyone else becomes a log line.',
    briefing: [
      'Perfect order is the difference between a payout and a funeral.',
      'Deadlines are tight. Watch the queue like it is a heartbeat.',
    ],
    seed: 403,
  },

  // ------------------------------------------------------------------ ACT V
  {
    id: 'c13',
    actId: 'act-5',
    title: 'ONE CELL',
    codename: 'SINGLE CHARGE',
    client: 'THE WEATHERMAN',
    target: 'Energy cell — 5 objectives',
    payout: 6400,
    reputationReward: 1600,
    risk: 'MEDIUM',
    difficulty: 'MEDIUM',
    estimatedTime: '16:00',
    requiredRank: 'GHOST',
    missionType: 'optimize',
    objective: 'Choose objectives that fit one energy cell and maximize total payout.',
    narrative:
      'One charge. A vault of options. The Weatherman wants a specific combination of locks popped in a single drain — and the combination that pays the most is never the obvious one. Budget every unit. Choose like it is a proof.',
    briefing: [
      'Each objective costs energy and pays a reward.',
      'Some objectives unlock others. Build the chain that pays best.',
      'You cannot afford everything — choose the optimal set.',
    ],
    seed: 501,
  },
  {
    id: 'c14',
    actId: 'act-5',
    title: 'CARGO CALCULUS',
    codename: 'WEIGHT OF GOLD',
    client: 'GHOST FREIGHT',
    target: 'Manifest pick — 8 objectives',
    payout: 8200,
    reputationReward: 2000,
    risk: 'HIGH',
    difficulty: 'HARD',
    estimatedTime: '20:00',
    requiredRank: 'GHOST',
    missionType: 'optimize',
    objective: 'Pack the most valuable manifest under a strict energy budget.',
    narrative:
      'Ghost Freight runs cargo manifests past every checkpoint in the district. They need a pick list — which crates, in which combination — that clears customs inspection and pays the most. The manifest is a knapsack and the cell is your bag.',
    briefing: [
      'Energy budget is hard. Every crate has a cost and a value.',
      'Prerequisite crates gate the best scores.',
      'The optimal combination is a state search — think in subproblems.',
    ],
    seed: 502,
  },
  {
    id: 'c15',
    actId: 'act-5',
    title: 'EVERYTHING OR NOTHING',
    codename: 'FULL LOCK',
    client: 'A PRIVATE COLLECTOR',
    target: 'Vault matrix — 10 objectives',
    payout: 10400,
    reputationReward: 2500,
    risk: 'CRITICAL',
    difficulty: 'EXPERT',
    estimatedTime: '24:00',
    requiredRank: 'GHOST',
    missionType: 'optimize',
    objective: 'Optimize a deep objective matrix with dependencies and a brutal budget.',
    narrative:
      'The collector wants the whole matrix — every vault in a chain, or none of it is worth anything. Deep prerequisites, punishing costs, one budget. This is a problem you solve on paper before you touch a single node.',
    briefing: [
      'Dependencies run deep. Wrong chains waste everything.',
      'Budget is unforgiving. There is exactly one optimal cut.',
    ],
    seed: 503,
  },

  // ----------------------------------------------------------------- ACT VI
  {
    id: 'c16',
    actId: 'act-6',
    title: 'FINAL BREACH',
    codename: 'ZERO HOUR',
    client: 'THE WEATHERMAN',
    target: 'ARCHIVE-13 — Final archive',
    payout: 14000,
    reputationReward: 3400,
    risk: 'CRITICAL',
    difficulty: 'EXPERT',
    estimatedTime: '30:00',
    requiredRank: 'OPERATIVE',
    missionType: 'hybrid',
    objective: 'No labels. Find the archive, breach it, and escape a grid that fights back.',
    narrative:
      'The Weatherman does not hand out maps anymore. The network is dense, half-dark, decoy-seeded, and it reacts — corridors seal, gates wake, and lockdown is one bad hop away. Choose your tools. Choose your path. This is the trade.',
    briefing: [
      'Recon is manual — find the archive yourself.',
      'Routes shift. Gates wake. Keep alert under control.',
      'You decide when to scan, when to route-plan, and when to run.',
    ],
    featured: true,
    seed: 601,
  },
  {
    id: 'c17',
    actId: 'act-6',
    title: 'THE DEEP VAULT',
    codename: 'BOTTOM FEEDER',
    client: 'A PRIVATE COLLECTOR',
    target: 'DEEP-VAULT-00 — Sub-level vault',
    payout: 16200,
    reputationReward: 3900,
    risk: 'CRITICAL',
    difficulty: 'EXPERT',
    estimatedTime: '34:00',
    requiredRank: 'OPERATIVE',
    missionType: 'hybrid',
    objective: 'Reach the deepest vault through a shifting, decoy-heavy network.',
    narrative:
      'Sub-level zero. The collector claims this vault has not been opened in a decade. The network above it has been left to rot — and rot grows decoys like mould. No floorplan. No floor.',
    briefing: [
      'Large map, heavy decoys, live gates.',
      'Lockdown here means the vault seals permanently. One shot.',
    ],
    seed: 602,
  },
  {
    id: 'c18',
    actId: 'act-6',
    title: 'LAST LIGHT',
    codename: 'FINAL WINDOW',
    client: 'REDACTED',
    target: 'CONTROL-01 — District control node',
    payout: 18400,
    reputationReward: 4400,
    risk: 'CRITICAL',
    difficulty: 'EXPERT',
    estimatedTime: '38:00',
    requiredRank: 'OPERATIVE',
    missionType: 'hybrid',
    objective: 'Take control of a district node under full lockdown pressure.',
    narrative:
      'Everything you have done has been leading to a district control node. The grid will throw everything at you — security wakes in waves, and the extraction window is a single sweep of the clock. This is the last light.',
    briefing: [
      'Pressure escalates over time. Extraction is late and far.',
      'Every system you know is on the table. Use all of it.',
    ],
    seed: 603,
  },
  {
    id: 'c19',
    actId: 'act-6',
    title: 'NO NAME',
    codename: 'SIGNAL OUT',
    client: 'YOURSELF',
    target: 'THE UNDERPASS — The last network',
    payout: 20000,
    reputationReward: 5000,
    risk: 'CRITICAL',
    difficulty: 'EXPERT',
    estimatedTime: '40:00',
    requiredRank: 'OPERATIVE',
    missionType: 'hybrid',
    objective: 'No client, no briefing, no map. Survive the underpass and walk out.',
    narrative:
      'No client is paying for this. This is the contract you write for yourself — the one that decides what kind of operator you are. The underpass is the deepest, densest, angriest grid ever assembled. The Architect walks out or does not.',
    briefing: [
      'The full hybrid gauntlet: recon, routes, shifting corridors, decoys, lockdown.',
      'Complete it and your rank stands. Fail it and your legend does not.',
    ],
    seed: 604,
  },
].map(toContract)

export function getContract(id: string): Contract | undefined {
  return CONTRACTS.find((c) => c.id === id)
}

export function contractsForAct(actId: string): Contract[] {
  return CONTRACTS.filter((c) => c.actId === actId)
}
