import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { PageLoader } from '@/components/ui/PageLoader'
import { useSettingsStore } from '@/store/settingsStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const OperatorEntryPage = lazy(() => import('@/pages/OperatorEntryPage').then((m) => ({ default: m.OperatorEntryPage })))
const BriefingPage = lazy(() => import('@/pages/BriefingPage').then((m) => ({ default: m.BriefingPage })))
const IntroPage = lazy(() => import('@/pages/IntroPage').then((m) => ({ default: m.IntroPage })))
const HeistPage = lazy(() => import('@/pages/HeistPage').then((m) => ({ default: m.HeistPage })))
const ResultsPage = lazy(() => import('@/pages/ResultsPage').then((m) => ({ default: m.ResultsPage })))
const AnalysisPage = lazy(() => import('@/pages/AnalysisPage').then((m) => ({ default: m.AnalysisPage })))

export default function App() {
  const osReduced = usePrefersReducedMotion()
  const settingReduced = useSettingsStore((s) => s.reducedMotion)
  const reduce = osReduced || settingReduced

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><OperatorEntryPage /></Suspense>} />
          <Route path="/intro" element={<Suspense fallback={<PageLoader />}><IntroPage /></Suspense>} />
          <Route path="/briefing" element={<Suspense fallback={<PageLoader />}><BriefingPage /></Suspense>} />
          <Route path="/heist" element={<Suspense fallback={<PageLoader />}><HeistPage /></Suspense>} />
          <Route path="/results" element={<Suspense fallback={<PageLoader />}><ResultsPage /></Suspense>} />
          <Route path="/analysis" element={<Suspense fallback={<PageLoader />}><AnalysisPage /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<PageLoader />}><OperatorEntryPage /></Suspense>} />
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}