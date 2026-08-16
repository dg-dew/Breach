import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'

export function IntroPage() {
  const navigate = useNavigate()
  const { play } = useSound()

  const [showSkip, setShowSkip] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const begin = () => {
    play('uiClick')
    navigate('/briefing')
  }

  return (
    <div className="grid-lines grain crt-lines relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="panel corners px-8 py-10 text-center"
        >
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <svg width="64" height="64" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="6" fill="#0D1B14" stroke="#1E4A35" strokeWidth="1" />
                <path d="M6 20 L11 13 L16 18 L21 9 L26 15" stroke="#E7B85C" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="20" r="2.5" fill="#E7B85C" />
                <circle cx="11" cy="13" r="2.5" fill="#6FA37B" />
                <circle cx="16" cy="18" r="2.5" fill="#6FA37B" />
                <circle cx="21" cy="9" r="2.5" fill="#6FA37B" />
                <circle cx="26" cy="15" r="2.5" fill="#E7B85C" />
              </svg>
            </div>
            <h1 className="font-display text-6xl font-bold tracking-[0.18em] text-amber text-shadow-amber">BREACH</h1>
            <p className="mt-2 font-mono text-[10px] tracking-[0.32em] text-muted">MISSION: BLACK VAULT</p>
          </div>

          <div>
            <p className="font-mono text-[12px] tracking-[0.3em] text-amber">GET IN.<br/>GET THE ARCHIVE.<br/>GET OUT.</p>
          </div>
        </motion.div>

        {showSkip && (
          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full"
            onClick={begin}
          >
            START OPERATION
          </Button>
        )}

        {!showSkip && (
          <Button
            variant="outline"
            size="md"
            className="mt-6 w-full"
            onClick={begin}
          >
            SKIP INTRO
          </Button>
        )}
      </div>
    </div>
  )
}