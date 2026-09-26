'use client'

import { useState, useEffect } from 'react'
import styles from './ProfileModal.module.css'
import { X, Copy, Check, LogOut, Plus, Trash2 } from 'lucide-react'

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
  const [aliases, setAliases] = useState<string[]>([])
  const [newAlias, setNewAlias] = useState('')
  const [language, setLanguage] = useState('en')
  const [displayName, setDisplayName] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const storedAliases = localStorage.getItem('pm_aliases')
      if (storedAliases) setAliases(JSON.parse(storedAliases))
      
      const storedLang = localStorage.getItem('pm_lang')
      if (storedLang) setLanguage(storedLang)
      
      const storedName = localStorage.getItem('pm_name')
      if (storedName) setDisplayName(storedName)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(userEmailId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlias.trim()) return
    const formattedAlias = `${newAlias.trim().toLowerCase()}@phonemail.com`
    if (!aliases.includes(formattedAlias)) {
      const updated = [...aliases, formattedAlias]
      setAliases(updated)
      localStorage.setItem('pm_aliases', JSON.stringify(updated))
    }
    setNewAlias('')
  }

  const handleDeleteAlias = (alias: string) => {
    const updated = aliases.filter(a => a !== alias)
    setAliases(updated)
    localStorage.setItem('pm_aliases', JSON.stringify(updated))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value)
    localStorage.setItem('pm_name', e.target.value)
  }

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
    localStorage.setItem('pm_lang', e.target.value)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Account Settings</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close Settings">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Identity Card */}
          <div className={styles.identityCard}>
            <div className={styles.avatarLarge}>
              {displayName ? displayName.slice(0, 2).toUpperCase() : (userPhone ? userPhone.slice(-2) : 'PM')}
            </div>
            <div className={styles.identityDetails}>
              <h3 className={styles.phoneHeading}>{userPhone || 'PhoneMail User'}</h3>
              <div className={styles.emailRow}>
                <span className={styles.emailBadge}>{userEmailId}</span>
                <button className={styles.copyBtn} onClick={handleCopy} aria-label="Copy Email Address">
                  {copied ? <Check size={14} color="var(--wa-accent)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Display Name</label>
            <input 
              type="text" 
              className={styles.settingInput} 
              placeholder="Enter your name..." 
              value={displayName}
              onChange={handleNameChange}
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Language</label>
            <select className={styles.settingSelect} value={language} onChange={handleLangChange}>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Alias IDs */}
          <div className={styles.settingGroup}>
            <div className={styles.settingHeaderRow}>
              <label className={styles.settingLabel}>Manage Alias IDs</label>
              <span className={styles.aliasCount}>{aliases.length}/5</span>
            </div>
            
            <form onSubmit={handleAddAlias} className={styles.aliasForm}>
              <input 
                type="text" 
                className={styles.settingInput} 
                placeholder="e.g. work, personal" 
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                maxLength={20}
              />
              <span className={styles.aliasDomain}>@phonemail.com</span>
              <button type="submit" className={styles.addAliasBtn} disabled={!newAlias.trim() || aliases.length >= 5}>
                <Plus size={16} /> Add
              </button>
            </form>

            {aliases.length > 0 && (
              <div className={styles.aliasList}>
                {aliases.map(alias => (
                  <div key={alias} className={styles.aliasItem}>
                    <span>{alias}</span>
                    <button type="button" onClick={() => handleDeleteAlias(alias)} className={styles.deleteAliasBtn}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <form action="/auth/signout" method="POST" className={styles.signoutForm}>
            <button type="submit" className={styles.signoutBtn}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
