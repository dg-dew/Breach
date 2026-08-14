import { useCallback, useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { soundEngine } from '@/utils/sound'

type SoundName =
  | 'nodeActivate'
  | 'edgeTraverse'
  | 'routeDiscovered'
  | 'warning'
  | 'missionComplete'
  | 'uiClick'
  | 'fail'

export function useSound() {
  const sound = useSettingsStore((s) => s.sound)

  const play = useCallback(
    (name: SoundName) => {
      if (!sound) return
      soundEngine[name]()
    },
    [sound],
  )

  useEffect(() => {
    soundEngine.setEnabled(sound)
  }, [sound])

  return { play, sound }
}
