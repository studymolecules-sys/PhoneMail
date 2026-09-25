'use client'

import { useState, useEffect } from 'react'
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
  AtSign,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import styles from './Sidebar.module.css'
import ProfileModal from './ProfileModal'

interface SidebarProps {
  userEmailId?: string
  userPhone?: string
}

export default function Sidebar({
  userEmailId = 'user@phonemail.com',
  userPhone = '+15550192834',
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [aliases, setAliases] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('pm_aliases')
    if (saved) {
      try {
        setAliases(JSON.parse(saved))
      } catch (e) {
        // fallback
      }
    }
  }, [])

  return (
    <div className={styles.sidebarContainer}>
      {/* Gmail-style Logo Header */}
      <div className={styles.brandRow}>
        <div className={styles.logoPill}>
          <span className={styles.logoLetter}>P</span>
        </div>
        <div className={styles.brandText}>
          <span className={styles.appName}>PhoneMail</span>
          <span className={styles.appSub}>Workspace</span>
        </div>
      </div>

      {/* Gmail-style Compose Pill Button */}
      <div className={styles.composeWrapper}>
        <Link href="/compose" className={styles.composePill}>
          <PenSquare size={20} className={styles.composeIcon} />
          <span className={styles.composeLabel}>Compose</span>
        </Link>
      </div>

      {/* Gmail Navigation Items */}
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${styles.active}`}>
          <div className={styles.navItemLeft}>
            <Inbox size={18} />
            <span>Inbox</span>
          </div>
          <span className={styles.counterBadge}>New</span>
        </Link>

        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <Star size={18} />
            <span>Starred</span>
          </div>
        </Link>

        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <Send size={18} />
            <span>Sent</span>
          </div>
        </Link>

        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <FileText size={18} />
            <span>Drafts</span>
          </div>
        </Link>

        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <AlertOctagon size={18} />
            <span>Spam</span>
          </div>
        </Link>

        <Link href="/" className={styles.navItem}>
          <div className={styles.navItemLeft}>
            <Trash2 size={18} />
            <span>Trash</span>
          </div>
        </Link>
      </nav>

      <div className={styles.divider} />

      {/* Labels & Aliases Section */}
      <div className={styles.labelsSection}>
        <div className={styles.labelsHeader}>
          <span className={styles.labelsTitle}>ALIASES & LABELS</span>
          <button
            type="button"
            className={styles.addLabelBtn}
            onClick={() => setIsSettingsOpen(true)}
            title="Manage Aliases"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className={styles.labelsList}>
          {aliases.length === 0 ? (
            <div className={styles.emptyAliasNotice}>
              <span>Primary: {userEmailId}</span>
            </div>
          ) : (
            aliases.map((alias, idx) => (
              <div
                key={alias}
                className={styles.aliasRow}
                onClick={() => setIsSettingsOpen(true)}
              >
                <div
                  className={styles.aliasDot}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#0b57d0' : '#00a884',
                  }}
                />
                <span className={styles.aliasName}>{alias.split('@')[0]}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Gateway Status */}
      <div className={styles.footer}>
        <div className={styles.gatewayStatus}>
          <ShieldCheck size={14} className={styles.statusShield} />
          <span>Connection Secure</span>
        </div>

        <button
          type="button"
          className={styles.settingsBtn}
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings size={18} />
          <span>Settings & Profile</span>
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
