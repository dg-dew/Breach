import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EconomyState {
  credits: number
  reputation: number
  totalEarnedCredits: number
  totalSpentCredits: number
  totalEarnedRep: number

  addCredits: (amount: number, source?: string) => void
  spendCredits: (amount: number, item?: string) => boolean
  addReputation: (amount: number, source?: string) => void
  canAfford: (amount: number) => boolean
  resetEconomy: () => void
}

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      credits: 0,
      reputation: 0,
      totalEarnedCredits: 0,
      totalSpentCredits: 0,
      totalEarnedRep: 0,

      addCredits: (amount, _source) =>
        set((state) => ({
          credits: state.credits + amount,
          totalEarnedCredits: state.totalEarnedCredits + amount,
        })),

      spendCredits: (amount, _item) => {
        const { credits } = get()
        if (credits < amount) return false
        set((state) => ({
          credits: state.credits - amount,
          totalSpentCredits: state.totalSpentCredits + amount,
        }))
        return true
      },

      addReputation: (amount, _source) =>
        set((state) => ({
          reputation: state.reputation + amount,
          totalEarnedRep: state.totalEarnedRep + amount,
        })),

      canAfford: (amount) => get().credits >= amount,

      resetEconomy: () =>
        set({
          credits: 0,
          reputation: 0,
          totalEarnedCredits: 0,
          totalSpentCredits: 0,
          totalEarnedRep: 0,
        }),
    }),
    { name: 'breach-economy' }
  )
)