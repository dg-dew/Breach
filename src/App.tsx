import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { PageLoader } from '@/components/ui/PageLoader'
import { useSettingsStore } from '@/store/settingsStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const SafehousePage = lazy(() => import('@/pages/SafehousePage').then((m) => ({ default: m.SafehousePage })))
const ContractsPage = lazy(() => import('@/pages/ContractsPage').then((m) => ({ default: m.ContractsPage })))
const MissionPage = lazy(() => import('@/pages/MissionPage').then((m) => ({ default: m.MissionPage })))
const NetworkPage = lazy(() => import('@/pages/NetworkPage').then((m) => ({ default: m.NetworkPage })))
const OperatorPage = lazy(() => import('@/pages/OperatorPage').then((m) => ({ default: m.OperatorPage })))
const ArchivePage = lazy(() => import('@/pages/ArchivePage').then((m) => ({ default: m.ArchivePage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

export default function App() {
  const osReduced = usePrefersReducedMotion()
  const settingReduced = useSettingsStore((s) => s.reducedMotion)
  const reduce = osReduced || settingReduced

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
            <Route path="/safehouse" element={<Suspense fallback={<PageLoader />}><SafehousePage /></Suspense>} />
            <Route path="/contracts" element={<Suspense fallback={<PageLoader />}><ContractsPage /></Suspense>} />
            <Route path="/mission/:missionId" element={<Suspense fallback={<PageLoader />}><MissionPage /></Suspense>} />
            <Route path="/network" element={<Suspense fallback={<PageLoader />}><NetworkPage /></Suspense>} />
            <Route path="/operator" element={<Suspense fallback={<PageLoader />}><OperatorPage /></Suspense>} />
            <Route path="/archive" element={<Suspense fallback={<PageLoader />}><ArchivePage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
          </Route>
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}