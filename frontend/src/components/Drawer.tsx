'use client'

import { useState, useEffect } from 'react'
import styles from './Drawer.module.css'
import { Mails, Settings, X, Shield, Pencil, ShieldAlert, Trash, Bookmark, SendHorizontal, MessageSquare } from 'lucide-react'
import { getTranslations } from '@/app/i18n'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  userEmailId: string
  userPhone: string
  activeFolder: string
  onSelectFolder: (folder: string) => void
  onOpenSettings: () => void
}

export default function Drawer({
  isOpen,
  onClose,
  userEmailId,
  userPhone,
  activeFolder,
  onSelectFolder,
  onOpenSettings,
}: DrawerProps) {
  const [lang, setLang] = useState('en')
  const [profileInitial, setProfileInitial] = useState('P')
  useEffect(() => {
    // Read client-only preferences after hydration to keep the first render aligned with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(localStorage.getItem('pm_lang') || 'en')
    const storedName = localStorage.getItem('pm_name')?.trim()
    if (storedName) setProfileInitial(storedName.charAt(0).toUpperCase())
    const handleLangChange = () => {
      setLang(localStorage.getItem('pm_lang') || 'en')
      const name = localStorage.getItem('pm_name')?.trim()
      setProfileInitial(name ? name.charAt(0).toUpperCase() : 'P')
    }
    window.addEventListener('pm_languageChange', handleLangChange)
    return () => window.removeEventListener('pm_languageChange', handleLangChange)
  }, [])
  const t = getTranslations(lang)

  if (!isOpen) return null

  const navItems = [
    { id: 'all', label: t.inbox, icon: Mails, color: 'blue' },
    { id: 'starred', label: t.starred || 'Starred', icon: Bookmark, color: 'yellow' },
    { id: 'sent', label: t.sent || 'Sent', icon: SendHorizontal, color: 'green' },
    { id: 'drafts', label: t.drafts || 'Drafts', icon: Pencil, color: 'gray' },
    { id: 'spam', label: t.spam || 'Spam', icon: ShieldAlert, color: 'orange' },
    { id: 'trash', label: t.trash || 'Trash', icon: Trash, color: 'red' },
    { id: 'chat_interface', label: 'Conversations', icon: MessageSquare, color: 'blue' },
  ]

  const handleItemClick = (id: string) => {
    onSelectFolder(id)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* User Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {profileInitial}
          </div>
          <div className={styles.userInfo}>
            <h3 className={styles.userName}>{userPhone || 'PhoneMail'}</h3>
            <p className={styles.userEmail}>{userEmailId}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close Drawer">
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Folders</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeFolder === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <div className={styles.iconBox} data-color={item.color}>
                  <Icon size={16} />
                </div>
                <span className={styles.itemLabel}>{item.label}</span>
                {isActive && <div className={styles.activeDot} />}
              </button>
            )
          })}
        </div>

        <div className={styles.divider} />

        {/* Settings Quick Action */}
        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Settings</div>
          <button
            type="button"
            className={styles.navItem}
            onClick={() => {
              onClose()
              onOpenSettings()
            }}
          >
            <Settings size={18} className={styles.itemIcon} />
            <span className={styles.itemLabel}>{t.settingsAccount}</span>
          </button>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.systemStatus}>
            <Shield size={14} className={styles.statusIcon} />
            <span>PhoneMail account</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
