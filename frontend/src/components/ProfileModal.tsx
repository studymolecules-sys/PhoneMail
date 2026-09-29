'use client'

import { useState, useEffect } from 'react'
import styles from './ProfileModal.module.css'
import {
  X, Copy, Check, LogOut, Plus, Trash2, Moon, Sun, Save,
  UserRound, Languages, Palette, MailPlus, SlidersHorizontal,
} from 'lucide-react'
import { showToast } from './Toast'
import { updateUserProfile } from '@/app/actions'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userEmailId: string
  userPhone: string
}

const languages = ['en', 'hi', 'ta', 'es', 'fr'] as const
type Language = (typeof languages)[number]
type Copy = {
  title: string; intro: string; account: string; name: string; nameHint: string
  language: string; languageHint: string; appearance: string; light: string; lightHint: string
  dark: string; darkHint: string; aliases: string; aliasHint: string; add: string
  save: string; saving: string; signout: string; copied: string; saved: string
}

const words: Record<Language, Copy> = {
  en: { title: 'Your settings', intro: 'Make PhoneMail feel like yours.', account: 'Account', name: 'Display name', nameHint: 'This name appears beside your messages.', language: 'Language', languageHint: 'Used across your inbox and menus.', appearance: 'Appearance', light: 'Light', lightHint: 'Soft paper tones', dark: 'Dark', darkHint: 'Low-glare surfaces', aliases: 'Email aliases', aliasHint: 'Extra addresses for this inbox', add: 'Add', save: 'Save changes', saving: 'Saving…', signout: 'Sign out', copied: 'Address copied', saved: 'Settings saved' },
  hi: { title: 'आपकी सेटिंग्स', intro: 'PhoneMail को अपने अनुसार बनाएँ।', account: 'खाता', name: 'दिखने वाला नाम', nameHint: 'यह नाम आपके संदेशों के साथ दिखेगा।', language: 'भाषा', languageHint: 'इनबॉक्स और मेनू में उपयोग होगी।', appearance: 'रूप', light: 'लाइट', lightHint: 'हल्के रंग', dark: 'डार्क', darkHint: 'आँखों पर आरामदायक', aliases: 'ईमेल उपनाम', aliasHint: 'इस इनबॉक्स के अतिरिक्त पते', add: 'जोड़ें', save: 'बदलाव सहेजें', saving: 'सहेज रहा है…', signout: 'साइन आउट', copied: 'पता कॉपी हुआ', saved: 'सेटिंग्स सहेजी गईं' },
  ta: { title: 'உங்கள் அமைப்புகள்', intro: 'PhoneMail-ஐ உங்கள் விருப்பப்படி மாற்றுங்கள்.', account: 'கணக்கு', name: 'காட்சிப் பெயர்', nameHint: 'இந்தப் பெயர் உங்கள் செய்திகளுடன் தோன்றும்.', language: 'மொழி', languageHint: 'இன்பாக்ஸ் மற்றும் மெனுக்களில் பயன்படுத்தப்படும்.', appearance: 'தோற்றம்', light: 'ஒளி', lightHint: 'மென்மையான நிறங்கள்', dark: 'இருள்', darkHint: 'கண்களுக்கு இதமானது', aliases: 'மின்னஞ்சல் மாற்றுப்பெயர்கள்', aliasHint: 'இந்த இன்பாக்ஸுக்கான கூடுதல் முகவரிகள்', add: 'சேர்', save: 'மாற்றங்களைச் சேமி', saving: 'சேமிக்கிறது…', signout: 'வெளியேறு', copied: 'முகவரி நகலெடுக்கப்பட்டது', saved: 'அமைப்புகள் சேமிக்கப்பட்டன' },
  es: { title: 'Tus ajustes', intro: 'Adapta PhoneMail a tu manera.', account: 'Cuenta', name: 'Nombre visible', nameHint: 'Aparece junto a tus mensajes.', language: 'Idioma', languageHint: 'Se usa en la bandeja y los menús.', appearance: 'Apariencia', light: 'Claro', lightHint: 'Tonos suaves', dark: 'Oscuro', darkHint: 'Menos brillo', aliases: 'Alias de correo', aliasHint: 'Direcciones adicionales para esta bandeja', add: 'Añadir', save: 'Guardar cambios', saving: 'Guardando…', signout: 'Cerrar sesión', copied: 'Dirección copiada', saved: 'Ajustes guardados' },
  fr: { title: 'Vos réglages', intro: 'Personnalisez PhoneMail.', account: 'Compte', name: 'Nom affiché', nameHint: 'Ce nom accompagne vos messages.', language: 'Langue', languageHint: 'Utilisée dans la boîte et les menus.', appearance: 'Apparence', light: 'Clair', lightHint: 'Tons doux', dark: 'Sombre', darkHint: 'Moins de lumière', aliases: 'Alias e-mail', aliasHint: 'Adresses supplémentaires pour cette boîte', add: 'Ajouter', save: 'Enregistrer', saving: 'Enregistrement…', signout: 'Déconnexion', copied: 'Adresse copiée', saved: 'Réglages enregistrés' },
}

const languageNames: Record<Language, string> = {
  en: 'English', hi: 'हिन्दी', ta: 'தமிழ்', es: 'Español', fr: 'Français',
}

function readAliases(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem('pm_aliases') || '[]')
    return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string').slice(0, 5) : []
  } catch {
    return []
  }
}

export default function ProfileModal({ isOpen, onClose, userEmailId, userPhone }: ProfileModalProps) {
  const [copied, setCopied] = useState(false)
  const [aliases, setAliases] = useState<string[]>([])
  const [newAlias, setNewAlias] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [displayName, setDisplayName] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isSaving, setIsSaving] = useState(false)
  const t = words[language]

  useEffect(() => {
    if (!isOpen) return
    setAliases(readAliases())
    setDisplayName(localStorage.getItem('pm_name') || '')
    const storedLanguage = localStorage.getItem('pm_lang') as Language | null
    setLanguage(storedLanguage && languages.includes(storedLanguage) ? storedLanguage : 'en')
    const storedTheme = localStorage.getItem('pm_theme')
    const activeTheme = storedTheme === 'dark' ? 'dark' : 'light'
    setTheme(activeTheme)
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userEmailId)
      setCopied(true)
      showToast(t.copied, 'success')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      showToast('Could not copy the address', 'error')
    }
  }

  const addAlias = (event: React.FormEvent) => {
    event.preventDefault()
    const localPart = newAlias.trim().toLowerCase()
    if (!localPart || aliases.length >= 5) return
    const address = `${localPart}@pmail.vixiya.com`
    if (aliases.includes(address)) {
      showToast('This alias already exists', 'error')
      return
    }
    const updated = [...aliases, address]
    setAliases(updated)
    localStorage.setItem('pm_aliases', JSON.stringify(updated))
    setNewAlias('')
    showToast('Alias added', 'success')
  }

  const removeAlias = (address: string) => {
    const updated = aliases.filter((alias) => alias !== address)
    setAliases(updated)
    localStorage.setItem('pm_aliases', JSON.stringify(updated))
  }

  const chooseLanguage = (next: Language) => {
    setLanguage(next)
    localStorage.setItem('pm_lang', next)
    window.dispatchEvent(new Event('pm_languageChange'))
  }

  const chooseTheme = (next: 'light' | 'dark') => {
    setTheme(next)
    localStorage.setItem('pm_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleSave = async () => {
    setIsSaving(true)
    localStorage.setItem('pm_name', displayName.trim())
    localStorage.setItem('pm_lang', language)
    localStorage.setItem('pm_theme', theme)
    localStorage.setItem('pm_aliases', JSON.stringify(aliases))
    window.dispatchEvent(new Event('pm_languageChange'))
    try {
      const result = await updateUserProfile({ display_name: displayName.trim(), language, theme, aliases })
      if (result.success) {
        showToast(t.saved, 'success')
        onClose()
      } else {
        showToast(`Could not sync settings: ${result.error}`, 'error')
      }
    } catch {
      showToast('Could not save settings. Your choices are kept on this device.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const initial = displayName.trim().charAt(0).toUpperCase() || 'P'

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headingCopy}>
            <span className={styles.eyebrow}><SlidersHorizontal size={13} /> ACCOUNT PREFERENCES</span>
            <h2 id="settings-title">{t.title}</h2>
            <p>{t.intro}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close settings"><X size={19} /></button>
        </header>

        <div className={styles.body}>
          <section className={styles.identityCard} aria-label={t.account}>
            <div className={styles.avatarLarge}>{initial}</div>
            <div className={styles.identityDetails}>
              <span className={styles.sectionKicker}>{t.account}</span>
              <h3 className={styles.phoneHeading}>{displayName.trim() || userPhone || 'PhoneMail user'}</h3>
              <div className={styles.emailRow}>
                <span className={styles.emailBadge}>{userEmailId}</span>
                <button type="button" className={styles.copyBtn} onClick={copyAddress} aria-label="Copy email address">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}><UserRound size={16} /> {t.account}</h3>
            <label className={styles.fieldLabel} htmlFor="display-name">{t.name}</label>
            <input id="display-name" type="text" className={styles.settingInput} placeholder="e.g. Aditi Sharma" value={displayName} maxLength={60} onChange={(event) => setDisplayName(event.target.value)} />
            <p className={styles.fieldHint}>{t.nameHint}</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}><Languages size={16} /> {t.language}</h3>
            <p className={styles.fieldHint}>{t.languageHint}</p>
            <div className={styles.languageGrid} role="group" aria-label={t.language}>
              {languages.map((code) => (
                <button key={code} type="button" className={`${styles.languageOption} ${language === code ? styles.languageSelected : ''}`} aria-pressed={language === code} onClick={() => chooseLanguage(code)}>
                  <span>{languageNames[code]}</span>{language === code && <Check size={15} />}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}><Palette size={16} /> {t.appearance}</h3>
            <div className={styles.themeGrid} role="group" aria-label={t.appearance}>
              <button type="button" className={`${styles.themeOption} ${theme === 'light' ? styles.themeSelected : ''}`} aria-pressed={theme === 'light'} onClick={() => chooseTheme('light')}>
                <span className={`${styles.themePreview} ${styles.lightPreview}`}><Sun size={19} /></span>
                <span className={styles.themeCopy}><strong>{t.light}</strong><small>{t.lightHint}</small></span>
                {theme === 'light' && <Check size={16} />}
              </button>
              <button type="button" className={`${styles.themeOption} ${styles.themeSelectedDark} ${theme === 'dark' ? styles.themeSelected : ''}`} aria-pressed={theme === 'dark'} onClick={() => chooseTheme('dark')}>
                <span className={`${styles.themePreview} ${styles.darkPreview}`}><Moon size={18} /></span>
                <span className={styles.themeCopy}><strong>{t.dark}</strong><small>{t.darkHint}</small></span>
                {theme === 'dark' && <Check size={16} />}
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.sectionTitle}><MailPlus size={16} /> {t.aliases}</h3>
              <span className={styles.aliasCount}>{aliases.length}/5</span>
            </div>
            <p className={styles.fieldHint}>{t.aliasHint}</p>
            <form onSubmit={addAlias} className={styles.aliasForm}>
              <input type="text" className={styles.settingInput} aria-label="Alias name" placeholder="e.g. work" value={newAlias} onChange={(event) => setNewAlias(event.target.value.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 24))} maxLength={24} />
              <span className={styles.aliasDomain}>@pmail.vixiya.com</span>
              <button type="submit" className={styles.addAliasBtn} disabled={!newAlias.trim() || aliases.length >= 5} aria-label={t.add}><Plus size={17} /></button>
            </form>
            {aliases.length > 0 && <div className={styles.aliasList}>{aliases.map((alias) => (
              <div key={alias} className={styles.aliasItem}><span>{alias}</span><button type="button" onClick={() => removeAlias(alias)} className={styles.deleteAliasBtn} aria-label={`Remove ${alias}`}><Trash2 size={15} /></button></div>
            ))}</div>}
          </section>
        </div>

        <footer className={styles.footer}>
          <form action="/auth/signout" method="POST"><button type="submit" className={styles.signoutBtn}><LogOut size={16} /> {t.signout}</button></form>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>{isSaving ? t.saving : <><Save size={16} /> {t.save}</>}</button>
        </footer>
      </section>
    </div>
  )
}
