'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mails,
  SendHorizontal,
  Pencil,
  Trash,
  ShieldAlert,
  Settings,
  Bookmark,
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
          <span className={styles.appName}>PhoneMail</span>
          <span className={styles.appSub}>All messages</span>
        </div>
      </div>

      {/* Compose Pill Button Removed */}

      {/* Navigation Items */}
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${styles.active}`}>
          <div className={styles.navItemLeft}>
            <div className={styles.iconBox} data-color="blue">
              <Mails size={16} />
            </div>
            <span>{t.inbox}</span>
          </div>
        </Link>
        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <div className={styles.iconBox} data-color="yellow">
              <Bookmark size={16} />
            </div>
            <span>{t.starred}</span>
          </div>
        </Link>
        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <div className={styles.iconBox} data-color="green">
              <SendHorizontal size={16} />
            </div>
            <span>{t.sent}</span>
          </div>
        </Link>
        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <div className={styles.iconBox} data-color="gray">
              <Pencil size={16} />
            </div>
            <span>{t.drafts}</span>
          </div>
        </Link>
        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <div className={styles.iconBox} data-color="orange">
              <ShieldAlert size={16} />
            </div>
            <span>{t.spam}</span>
          </div>
        </Link>
        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <div className={styles.iconBox} data-color="red">
              <Trash size={16} />
            </div>
            <span>{t.trash}</span>
          </div>
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
