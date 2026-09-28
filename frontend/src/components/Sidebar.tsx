'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  AlertOctagon,
  Settings,
  Star,
  PenSquare,
  ShieldCheck,
} from 'lucide-react'
import styles from './Sidebar.module.css'
import ProfileModal from './ProfileModal'
import { useEffect } from 'react'
import { getTranslations } from '@/app/i18n'

interface SidebarProps {
  userEmailId?: string
  userPhone?: string
}

export default function Sidebar({
  userEmailId = 'user@pmail.vixiya.com',
  userPhone = '+15550192834',
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const [lang, setLang] = useState('en')
  useEffect(() => {
    setLang(localStorage.getItem('pm_lang') || 'en')
    const handleLangChange = () => setLang(localStorage.getItem('pm_lang') || 'en')
    window.addEventListener('pm_languageChange', handleLangChange)
    return () => window.removeEventListener('pm_languageChange', handleLangChange)
  }, [])
  const t = getTranslations(lang)

  return (
    <div className={styles.sidebarContainer}>
      {/* Brand Header */}
      <div className={styles.brandRow}>
        <div className={styles.logoPill}>
          <span className={styles.logoLetter}>P</span>
        </div>
        <div className={styles.brandText}>
          <span className={styles.appName}>PMail</span>
          <span className={styles.appSub}>Inbox</span>
        </div>
      </div>

      {/* Compose Pill Button */}
      <div className={styles.composeWrapper}>
        <Link href="/compose" className={styles.composePill}>
          <PenSquare size={18} className={styles.composeIcon} />
          <span className={styles.composeLabel}>{t.compose}</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${styles.active}`}>
          <div className={styles.navItemLeft}>
            <Inbox size={18} />
            <span>{t.inbox}</span>
          </div>
          <span className={styles.counterBadge}>{t.new}</span>
        </Link>

      </nav>

      {/* Footer / Settings */}
      <div className={styles.footer}>

        <button
          type="button"
          className={styles.settingsBtn}
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings size={18} />
          <span>{t.settingsAccount}</span>
        </button>
      </div>

      {/* Settings Modal */}
      <ProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userEmailId={userEmailId}
        userPhone={userPhone}
      />
    </div>
  )
}
