'use client'

import { useState, useEffect } from 'react'
import styles from './ProfileModal.module.css'
import { X, Copy, Check, LogOut, Plus, Trash2, Moon, Sun, Save } from 'lucide-react'
import { showToast } from './Toast'
import { updateUserProfile } from '@/app/actions'

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
  const [theme, setTheme] = useState('light')
  const [isSaving, setIsSaving] = useState(false)

  // Translations Map
  const translations: any = {
    en: { title: 'Account Settings', save: 'Save Changes', name: 'Display Name', lang: 'Language', theme: 'Theme', aliases: 'Manage Alias IDs', signout: 'Sign Out', add: 'Add', saving: 'Saving & Syncing...', themeDark: 'Switch to Dark Mode', themeLight: 'Switch to Light Mode' },
    es: { title: 'Configuración de la cuenta', save: 'Guardar cambios', name: 'Nombre para mostrar', lang: 'Idioma', theme: 'Tema', aliases: 'Gestionar Alias', signout: 'Cerrar sesión', add: 'Añadir', saving: 'Guardando...', themeDark: 'Cambiar a modo oscuro', themeLight: 'Cambiar a modo claro' },
    fr: { title: 'Paramètres du compte', save: 'Enregistrer les modifications', name: 'Nom d\'affichage', lang: 'Langue', theme: 'Thème', aliases: 'Gérer les Alias', signout: 'Déconnexion', add: 'Ajouter', saving: 'Enregistrement...', themeDark: 'Passer en mode sombre', themeLight: 'Passer en mode clair' },
    hi: { title: 'खाता सेटिंग्स', save: 'परिवर्तन सहेजें', name: 'प्रदर्शन नाम', lang: 'भाषा', theme: 'थीम', aliases: 'उपनाम प्रबंधित करें', signout: 'साइन आउट', add: 'जोड़ें', saving: 'सहेज रहा है...', themeDark: 'डार्क मोड पर स्विच करें', themeLight: 'लाइट मोड पर स्विच करें' },
    ta: { title: 'கணக்கு அமைப்புகள்', save: 'மாற்றங்களை சேமிக்கவும்', name: 'காட்சி பெயர்', lang: 'மொழி', theme: 'தீம்', aliases: 'மாற்றுப் பெயர்களை நிர்வகி', signout: 'வெளியேறு', add: 'சேர்', saving: 'சேமிக்கிறது...', themeDark: 'இருண்ட பயன்முறைக்கு மாறுக', themeLight: 'ஒளி பயன்முறைக்கு மாறுக' }
  }
  
  const t = translations[language] || translations.en

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const storedAliases = localStorage.getItem('pm_aliases')
      if (storedAliases) setAliases(JSON.parse(storedAliases))
      
      const storedLang = localStorage.getItem('pm_lang')
      if (storedLang) setLanguage(storedLang)
      
      const storedName = localStorage.getItem('pm_name')
      if (storedName) setDisplayName(storedName)
      
      const storedTheme = localStorage.getItem('pm_theme')
      if (storedTheme) setTheme(storedTheme)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(userEmailId)
    setCopied(true)
    showToast('Email address copied to clipboard', 'success')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlias.trim()) return
    const formattedAlias = `${newAlias.trim().toLowerCase()}@pmail.vixiya.com`
    if (!aliases.includes(formattedAlias)) {
      const updated = [...aliases, formattedAlias]
      setAliases(updated)
      localStorage.setItem('pm_aliases', JSON.stringify(updated))
      showToast(`Alias ${formattedAlias} created`, 'success')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    } else {
      showToast('Alias already exists', 'error')
    }
    setNewAlias('')
  }

  const handleDeleteAlias = (alias: string) => {
    const updated = aliases.filter(a => a !== alias)
    setAliases(updated)
    localStorage.setItem('pm_aliases', JSON.stringify(updated))
    showToast(`Alias deleted`, 'info')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value)
    localStorage.setItem('pm_name', e.target.value)
  }

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
    localStorage.setItem('pm_lang', e.target.value)
    window.dispatchEvent(new Event('pm_languageChange'))
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('pm_theme', newTheme)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save locally
      localStorage.setItem('pm_name', displayName)
      localStorage.setItem('pm_lang', language)
      localStorage.setItem('pm_theme', theme)
      localStorage.setItem('pm_aliases', JSON.stringify(aliases))
      window.dispatchEvent(new Event('pm_languageChange'))

      // Save to cloud
      const res = await updateUserProfile({
        display_name: displayName,
        language,
        theme,
        aliases
      })
      if (res.success) {
        showToast('Profile saved and synced successfully', 'success')
        setTimeout(() => onClose(), 500)
      } else {
        showToast('Failed to sync with cloud: ' + res.error, 'error')
      }
    } catch (e) {
      showToast('An error occurred while saving', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t.title}</h2>
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
              <h3 className={styles.phoneHeading}>{userPhone || 'PMail User'}</h3>
              <div className={styles.emailRow}>
                <span className={styles.emailBadge}>{userEmailId}</span>
                <button className={styles.copyBtn} onClick={handleCopy} aria-label="Copy Email Address">
                  {copied ? <Check size={14} color="var(--wa-accent)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className={`${styles.settingGroup} ${styles.settingRow}`}>
            <label className={styles.settingLabel}>{t.name}</label>
            <input 
              type="text" 
              className={styles.settingInput} 
              placeholder="Enter your name..." 
              value={displayName}
              onChange={handleNameChange}
            />
          </div>

          <div className={`${styles.settingGroup} ${styles.settingRow}`}>
            <label className={styles.settingLabel}>{t.lang}</label>
            <select className={styles.settingSelect} value={language} onChange={handleLangChange}>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          <div className={`${styles.settingGroup} ${styles.settingRow}`}>
            <label className={styles.settingLabel}>{t.theme}</label>
            <button 
              className={styles.themeToggleBtn} 
              onClick={toggleTheme}
              type="button"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'light' ? t.themeDark : t.themeLight}</span>
            </button>
          </div>

          {/* Alias IDs */}
          <div className={styles.settingGroup}>
            <div className={styles.settingHeaderRow}>
              <label className={styles.settingLabel}>{t.aliases}</label>
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
              <span className={styles.aliasDomain}>@pmail.vixiya.com</span>
              <button type="submit" className={styles.addAliasBtn} disabled={!newAlias.trim() || aliases.length >= 5}>
                <Plus size={16} /> {t.add}
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

          {/* Save Button */}
          <div className={styles.settingGroup}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? t.saving : <><Save size={16} /> <span>{t.save}</span></>}
            </button>
          </div>

          {/* Sign Out Button */}
          <form action="/auth/signout" method="POST" className={styles.signoutForm}>
            <button type="submit" className={styles.signoutBtn}>
              <LogOut size={16} />
              <span>{t.signout}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
