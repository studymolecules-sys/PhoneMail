'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import styles from './ResponsiveSplit.module.css'

interface ResponsiveMainLayoutProps {
  desktop: ReactNode
  mobile: ReactNode
  children: ReactNode
}

export default function ResponsiveMainLayout({
  desktop,
  mobile,
  children,
}: ResponsiveMainLayoutProps) {
  const pathname = usePathname()

  // Compose is a full-page flow on desktop too. The previous layout hid route
  // children above 860px and kept rendering the inbox, making /compose appear dead.
  if (pathname === '/compose') return children

  return (
    <>
      <div className={styles.desktopOnly}>{desktop}</div>
      <div className={styles.mobileOnly}>{mobile}</div>
    </>
  )
}
