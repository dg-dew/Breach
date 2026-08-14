import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

/**
 * One-time cinematic transition shown when the operator first enters BREACH
 * (clicks INITIALIZE BREACH). A brief terminal boot sequence.
 */
export function EnterTransition() {
  const hasEntered = useGameStore((s) => s.hasEntered)
  const [show, setShow] = useState(false)
  const [line, setLine] = useState(0)
  const prev = useRef(hasEntered)

  const lines = [
    '> establishing uplink …',
    '> negotiating cipher handshake …',
    '> authenticating operator …',
    '> loading network topology …',
    '> access granted — welcome, operator',
  ]

  // Trigger only when hasEntered flips false -> true.
  useEffect(() => {
    if (!prev.current && hasEntered) {
      setLine(0)
      setShow(true)
    }
    prev.current = hasEntered
  }, [hasEntered])

  useEffect(() => {
    if (!show) return
    if (line < lines.length - 1) {
      const t = setTimeout(() => setLine((l) => l + 1), 230)
      return () => clearTimeout(t)
    }
    const done = setTimeout(() => {
      setShow(false)
    }, 520)
    return () => clearTimeout(done)
  }, [show, line, lines.length])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base"
        >
          <div className="w-full max-w-md px-6 font-mono text-sm leading-loose">
            {lines.slice(0, line + 1).map((l, i) => (
              <motion.p
                key={l}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={i === line ? 'text-amber' : 'text-muted'}
              >
                {l}
              </motion.p>
            ))}
            <span className="inline-block animate-flicker text-amber">▌</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}