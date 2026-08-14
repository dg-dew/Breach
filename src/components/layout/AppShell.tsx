import { Suspense, lazy } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Atmosphere } from '@/components/ambient/Atmosphere'
import { EnterTransition } from '@/components/ambient/EnterTransition'

const AmbientBackground = lazy(() =>
  import('@/components/ambient/AmbientBackground').then((m) => ({ default: m.AmbientBackground })),
)

export function AppShell() {
  return (
    <div className="relative min-h-screen">
      <Suspense fallback={null}>
        <AmbientBackground />
      </Suspense>
      <Atmosphere />
      <Navbar />
      <EnterTransition />
      <main className="relative z-10 pt-16">
        <Outlet />
      </main>
    </div>
  )
}