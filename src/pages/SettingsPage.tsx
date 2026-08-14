import type { ReactNode } from 'react'
import { Volume2, VolumeX, Sun, Eye } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { Button } from '@/components/ui/Button'

export function SettingsPage() {
  const s = useSettingsStore()

  const Slider = ({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
  }: {
    label: string
    value: number
    min: number
    max: number
    step?: number
    onChange: (v: number) => void
  }) => (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs tracking-widest text-cream">{label}</span>
        <span className="font-mono text-xs text-amber">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#E7B85C]"
      />
    </div>
  )

  const Toggle = ({
    label,
    icon,
    checked,
    onChange,
  }: {
    label: string
    icon: ReactNode
    checked: boolean
    onChange: (v: boolean) => void
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-sm border border-white/10 px-4 py-3 text-left transition-colors hover:border-amber/25"
      role="switch"
      aria-checked={checked}
    >
      <span className="flex items-center gap-3 font-mono text-xs tracking-widest text-cream">
        {icon} {label}
      </span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-amber/70' : 'bg-white/10'}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg-base transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  )

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-12">
      <div className="mb-10">
        <p className="label mb-2">SYSTEM CONFIGURATION</p>
        <h1 className="font-display text-4xl font-semibold text-cream">Settings</h1>
      </div>

      <div className="space-y-4">
        <div className="panel corners p-6">
          <p className="label mb-4">AUDIO</p>
          <Toggle
            label="SOUND EFFECTS"
            icon={s.sound ? <Volume2 size={15} className="text-amber" /> : <VolumeX size={15} className="text-muted" />}
            checked={s.sound}
            onChange={s.setSound}
          />
        </div>

        <div className="panel corners p-6">
          <p className="label mb-4">MOTION</p>
          <div className="space-y-2">
            <Toggle
              label="REDUCED MOTION"
              icon={<Eye size={15} className="text-amber" />}
              checked={s.reducedMotion}
              onChange={s.setReducedMotion}
            />
          </div>
          <div className="mt-5">
            <Slider
              label="ANIMATION INTENSITY"
              value={s.animationIntensity === 'low' ? 1 : s.animationIntensity === 'medium' ? 2 : 3}
              min={1}
              max={3}
              onChange={(v) => s.setAnimationIntensity(v === 1 ? 'low' : v === 2 ? 'medium' : 'high')}
            />
          </div>
        </div>

        <div className="panel corners p-6">
          <p className="label mb-4">INTERFACE</p>
          <div className="space-y-5">
            <Slider
              label="BRIGHTNESS"
              value={s.brightness}
              min={0.6}
              max={1.4}
              step={0.1}
              onChange={s.setBrightness}
            />
            <Slider
              label="GRAPH ANIMATION SPEED"
              value={s.graphSpeed}
              min={0.5}
              max={3}
              step={0.25}
              onChange={s.setGraphSpeed}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-5">
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted">
            <Sun size={12} /> ALL SETTINGS PERSIST LOCALLY
          </span>
          <Button variant="outline" size="sm" onClick={s.reset}>
            RESET TO DEFAULTS
          </Button>
        </div>
      </div>
    </div>
  )
}