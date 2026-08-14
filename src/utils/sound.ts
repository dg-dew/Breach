import { useSettingsStore } from '@/store/settingsStore'

/**
 * Sound architecture — a lightweight Web Audio synthesizer.
 * No audio files; subtle synthesized blips. Gated by the settings store.
 */
class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled = true

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  /** A tiny synthesized blip. */
  private blip(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
    delay = 0,
  ): void {
    const ctx = this.getContext()
    if (!ctx || !this.enabled) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t0 = ctx.currentTime + delay
    osc.type = type
    osc.frequency.setValueAtTime(frequency, t0)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
  }

  nodeActivate(): void {
    this.blip(660, 0.09, 0.05, 'triangle')
  }

  edgeTraverse(): void {
    this.blip(440, 0.05, 0.03, 'sine')
  }

  routeDiscovered(): void {
    this.blip(523.25, 0.12, 0.05, 'triangle')
    this.blip(659.25, 0.12, 0.05, 'triangle', 0.09)
  }

  warning(): void {
    this.blip(160, 0.16, 0.06, 'sawtooth')
  }

  missionComplete(): void {
    const notes = [392, 493.88, 587.33, 783.99]
    notes.forEach((f, i) => this.blip(f, 0.22, 0.06, 'triangle', i * 0.11))
  }

  uiClick(): void {
    this.blip(880, 0.04, 0.025, 'square')
  }

  fail(): void {
    this.blip(120, 0.3, 0.06, 'sawtooth')
    this.blip(90, 0.4, 0.05, 'sawtooth', 0.12)
  }
}

export const soundEngine = new SoundEngine()

/** Keep the engine in sync with the settings store. */
export function syncSoundEnabled(): void {
  soundEngine.setEnabled(useSettingsStore.getState().sound)
}
