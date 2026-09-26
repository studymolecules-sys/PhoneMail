'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function ChatTemplate({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Slide in from right (like native iOS navigation)
    gsap.fromTo(
      containerRef.current,
      { x: '100%', opacity: 0.8 },
      { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
    )
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 100, backgroundColor: 'var(--wa-app-bg)' }}>
      {children}
    </div>
  )
}
