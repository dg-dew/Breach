import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Contract, ContractStatus } from '@/types'
import { ACTS } from '@/gameplay/acts/acts'
import { CONTRACTS, getContract, contractsForAct } from '@/gameplay/contracts/contracts'

interface CampaignState {
  currentActId: string
  completedActs: string[]
  contractStatuses: Record<string, ContractStatus>
  availableContracts: string[]
  featuredContractId: string | null
  setCurrentAct: (actId: string) => void
  completeAct: (actId: string) => void
  acceptContract: (contractId: string) => void
  completeContract: (contractId: string) => void
  failContract: (contractId: string) => void
  unlockContractsForAct: (actId: string) => void
  getContractStatus: (contractId: string) => ContractStatus
  getAvailableContracts: () => Contract[]
  getActProgress: (actId: string) => { completed: number; total: number }
  resetCampaign: () => void
}

const initialContractStatuses: Record<string, ContractStatus> = {}
CONTRACTS.forEach((c) => {
  initialContractStatuses[c.id] = c.featured ? 'available' : 'locked'
})

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      currentActId: 'act-1',
      completedActs: [],
      contractStatuses: initialContractStatuses,
      availableContracts: CONTRACTS.filter((c) => c.featured).map((c) => c.id),
      featuredContractId: CONTRACTS.find((c) => c.featured)?.id ?? null,

      setCurrentAct: (actId) => set({ currentActId: actId }),

      completeAct: (actId) =>
        set((state) => {
          const nextAct = ACTS.find((a) => a.index === ACTS.find((x) => x.id === actId)?.index! + 1)
          return {
            completedActs: state.completedActs.includes(actId)
              ? state.completedActs
              : [...state.completedActs, actId],
            currentActId: nextAct?.id ?? actId,
          }
        }),

      acceptContract: (contractId) =>
        set((state) => ({
          contractStatuses: {
            ...state.contractStatuses,
            [contractId]: 'available',
          },
        })),

      completeContract: (contractId) =>
        set((state) => {
          const contract = getContract(contractId)
          if (!contract) return state
          const actContracts = contractsForAct(contract.actId)
          const allCompleted = actContracts.every(
            (c) => state.contractStatuses[c.id] === 'completed' || c.id === contractId
          )
          return {
            contractStatuses: {
              ...state.contractStatuses,
              [contractId]: 'completed',
            },
            ...(allCompleted && { completedActs: [...state.completedActs, contract.actId] }),
          }
        }),

      failContract: (contractId) =>
        set((state) => ({
          contractStatuses: {
            ...state.contractStatuses,
            [contractId]: 'failed',
          },
        })),

      unlockContractsForAct: (actId) =>
        set((state) => {
          const contracts = contractsForAct(actId)
          const newStatuses = { ...state.contractStatuses }
          contracts.forEach((c) => {
            if (newStatuses[c.id] === 'locked') {
              newStatuses[c.id] = 'available'
            }
          })
          return {
            contractStatuses: newStatuses,
            availableContracts: [
              ...new Set([
                ...state.availableContracts,
                ...contracts.filter((c) => newStatuses[c.id] === 'available').map((c) => c.id),
              ]),
            ],
          }
        }),

      getContractStatus: (contractId) => get().contractStatuses[contractId] ?? 'locked',

      getAvailableContracts: () => {
        const state = get()
        return CONTRACTS.filter((c) => state.contractStatuses[c.id] === 'available')
      },

      getActProgress: (actId) => {
        const state = get()
        const contracts = contractsForAct(actId)
        const completed = contracts.filter((c) => state.contractStatuses[c.id] === 'completed').length
        return { completed, total: contracts.length }
      },

      resetCampaign: () =>
        set({
          currentActId: 'act-1',
          completedActs: [],
          contractStatuses: initialContractStatuses,
          availableContracts: CONTRACTS.filter((c) => c.featured).map((c) => c.id),
          featuredContractId: CONTRACTS.find((c) => c.featured)?.id ?? null,
        }),
    }),
    { name: 'breach-campaign' }
  )
)