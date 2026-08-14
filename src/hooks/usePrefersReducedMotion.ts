import { useSyncExternalStore } from 'react'

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null
  if (typeof window.matchMedia !== 'function') return null
  return window.matchMedia('(prefers-reduced-motion: reduce)')
}

const subscribe = (cb: () => void) => {
  const mq = getMediaQuery()
  if (!mq) return () => {}
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

const getSnapshot = () => getMediaQuery()?.matches ?? false

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}