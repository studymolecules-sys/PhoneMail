'use client'

import { usePathname } from 'next/navigation'
import styles from './ClientShell.module.css'
import { ReactNode } from 'react'

export default function ClientShell({ 
  sidebar, 
  inbox, 
  children 
}: { 
  sidebar: ReactNode, 
  inbox: ReactNode, 
  children: ReactNode 
}) {
  const pathname = usePathname()
  
  // On mobile, if we are on the home page, we show the inbox list.
  // Otherwise, we show the children (chat, compose, etc.)
  const isHomePage = pathname === '/'
  
  return (
    <div className={styles.shell}>
      <div className={`${styles.sidebar} ${!isHomePage ? styles.hiddenOnMobile : ''}`}>
        {sidebar}
      </div>
      <div className={`${styles.inboxPane} ${!isHomePage ? styles.hiddenOnMobile : ''}`}>
        {inbox}
      </div>
      <div className={`${styles.contentPane} ${isHomePage ? styles.hiddenOnMobile : ''}`}>
        {children}
      </div>
    </div>
  )
}
