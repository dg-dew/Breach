import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  sfxVolume: 0.7,
  ambienceVolume: 0.5,
  animationIntensity: 'medium',
  reducedMotion: false,
  brightness: 1,
  graphSpeed: 1,
}

interface SettingsState extends Settings {
  setSound: (v: boolean) => void
  setAnimationIntensity: (v: Settings['animationIntensity']) => void
  setReducedMotion: (v: boolean) => void
  setBrightness: (v: number) => void
  setGraphSpeed: (v: number) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSound: (sound) => set({ sound }),
      setAnimationIntensity: (animationIntensity) => set({ animationIntensity }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setBrightness: (brightness) => set({ brightness }),
      setGraphSpeed: (graphSpeed) => set({ graphSpeed }),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    { name: 'breach-settings' },
  ),
)
