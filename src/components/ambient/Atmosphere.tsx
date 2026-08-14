import { useSettingsStore } from '@/store/settingsStore'

/** Adds film grain + CRT scanline atmosphere on top of the viewport. */
export function Atmosphere() {
  const brightness = useSettingsStore((s) => s.brightness)
  return (
    <>
      <div className="grain pointer-events-none fixed inset-0 z-[80]" aria-hidden="true" />
      <div className="crt-lines pointer-events-none fixed inset-0 z-[79]" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0 z-[78]"
        aria-hidden="true"
        style={{
          background:
            brightness === 1 ? 'none' : `rgba(0,0,0,${(1 - brightness) * 0.4})`,
        }}
      />
    </>
  )
}