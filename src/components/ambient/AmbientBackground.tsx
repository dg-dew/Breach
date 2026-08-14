import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSettingsStore } from '@/store/settingsStore'

function ParticleField({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const reduced = usePrefersReducedMotion()
  const intensity = useSettingsStore((s) => s.animationIntensity)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 14 + Math.random() * 22
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.6
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4
    }
    return arr
  }, [count])

  const speed = intensity === 'high' ? 1 : intensity === 'medium' ? 0.5 : 0.2

  useFrame((state) => {
    if (!points.current || reduced) return
    const t = state.clock.getElapsedTime()
    points.current.rotation.y = t * 0.01 * speed
    points.current.position.y = Math.sin(t * 0.05) * 0.4 * speed
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#d6a84f"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function AmbientGlow() {
  return (
    <>
      <ambientLight intensity={0.25} color="#275d40" />
      <pointLight position={[0, 2, 6]} intensity={18} color="#e7b85c" decay={2} />
      <mesh position={[0, -3.2, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#07110d" />
      </mesh>
    </>
  )
}

function webglAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Subtle ambient particle field rendered behind the whole app.
 * Lightweight by design — a few hundred points, no complex geometry.
 */
export function AmbientBackground() {
  const reduced = usePrefersReducedMotion()
  const [supported] = useState(() => webglAvailable())
  if (!supported) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <AmbientGlow />
        <ParticleField count={260} />
      </Canvas>
    </div>
  )
}