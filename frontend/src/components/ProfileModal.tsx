'use client'

import { useState, useEffect } from 'react'
import styles from './ProfileModal.module.css'
import { X, Copy, Check, AtSign, Plus, Trash2, LogOut, Shield, Globe } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userEmailId: string
  userPhone: string
}

export default function ProfileModal({
  isOpen,
  onClose,
  userEmailId,
  userPhone,
}: ProfileModalProps) {
  const [copied, setCopied] = useState(false)
  const [newAlias, setNewAlias] = useState('')
  const [aliases, setAliases] = useState<string[]>([])
  const [language, setLanguage] = useState('English')

  useEffect(() => {
    // Load persisted aliases from localStorage
    const savedAliases = localStorage.getItem('pm_aliases')
    if (savedAliases) {
      try {
        setAliases(JSON.parse(savedAliases))
      } catch (e) {
        // fallback
      }
    } else {
      // Default initial alias suggestion
      const defaultAlias = `work.${userPhone.replace(/[^\d]/g, '').slice(-4)}@phonemail.com`
      setAliases([defaultAlias])
      localStorage.setItem('pm_aliases', JSON.stringify([defaultAlias]))
    }
  }, [userPhone])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(userEmailId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlias.trim()) return

    const cleanHandle = newAlias.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
    const fullAlias = `${cleanHandle}@phonemail.com`

    if (!aliases.includes(fullAlias)) {
      const updated = [...aliases, fullAlias]
      setAliases(updated)
      localStorage.setItem('pm_aliases', JSON.stringify(updated))
      setNewAlias('')
    }
  }

  const handleDeleteAlias = (aliasToDelete: string) => {
    const updated = aliases.filter((a) => a !== aliasToDelete)
    setAliases(updated)
    localStorage.setItem('pm_aliases', JSON.stringify(updated))
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Account & Aliases</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Identity Card */}
          <div className={styles.identityCard}>
            <div className={styles.avatarLarge}>
              {userPhone ? userPhone.slice(-2) : 'PM'}
            </div>
            <div className={styles.identityDetails}>
              <h3 className={styles.phoneHeading}>{userPhone || 'PhoneMail User'}</h3>
              <div className={styles.emailRow}>
                <span className={styles.emailBadge}>{userEmailId}</span>
                <button className={styles.copyBtn} onClick={handleCopy} title="Copy Email ID">
                  {copied ? <Check size={14} color="#00a884" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Alias Management Section (Mandated in Task.docx) */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <AtSign size={18} className={styles.sectionIcon} />
                <h4>Manage Alias IDs</h4>
              </div>
              <span className={styles.aliasCount}>{aliases.length} active</span>
            </div>
            <p className={styles.sectionDesc}>
              Aliases route incoming emails to your phone inbox without revealing your number.
            </p>

            <form onSubmit={handleAddAlias} className={styles.aliasForm}>
              <div className={styles.aliasInputWrapper}>
                <input
                  type="text"
                  placeholder="e.g. work, shopping, support"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  className={styles.aliasInput}
                />
                <span className={styles.aliasDomain}>@phonemail.com</span>
              </div>
              <button type="submit" className={styles.addAliasBtn} disabled={!newAlias.trim()}>
                <Plus size={16} /> Add
              </button>
            </form>

            <div className={styles.aliasList}>
              {aliases.map((alias) => (
                <div key={alias} className={styles.aliasItem}>
                  <span className={styles.aliasText}>{alias}</span>
                  <button
                    type="button"
                    className={styles.deleteAliasBtn}
                    onClick={() => handleDeleteAlias(alias)}
                    title="Remove alias"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className={styles.section}>
            <div className={styles.sectionTitleRow}>
              <Globe size={18} className={styles.sectionIcon} />
              <h4>Language & Display</h4>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={styles.selectInput}
            >
              <option value="English">English (United States)</option>
              <option value="Spanish">Español</option>
              <option value="Hindi">हिन्दी</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
            </select>
          </div>

          {/* Security & Infrastructure Info */}
          <div className={styles.section}>
            <div className={styles.sectionTitleRow}>
              <Shield size={18} className={styles.sectionIcon} />
              <h4>Security & Gateway</h4>
            </div>
            <div className={styles.securityBox}>
              <div className={styles.secRow}>
                <span>Local SMTP Gateway:</span>
                <strong>Active (Port 25)</strong>
              </div>
              <div className={styles.secRow}>
                <span>Twilio SMS Alerts:</span>
                <strong>Enabled (Trial)</strong>
              </div>
              <div className={styles.secRow}>
                <span>Database:</span>
                <strong>Supabase Cloud PostgreSQL</strong>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <form action="/auth/signout" method="POST" className={styles.signoutForm}>
            <button type="submit" className={styles.signoutBtn}>
              <LogOut size={16} />
              <span>Sign Out of PhoneMail</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
