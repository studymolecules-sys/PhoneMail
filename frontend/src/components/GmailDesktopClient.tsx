'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './GmailDesktopClient.module.css'
import { Search, Inbox, Star, Send, FileText, AlertOctagon, Trash2, Settings, UserCircle, RefreshCcw } from 'lucide-react'
import ProfileModal from './ProfileModal'
import { EmailMessage } from '@/app/(main)/chat/[contact]/SpikeChatView'
import { showToast } from './Toast'
import { getTranslations } from '@/app/i18n'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

interface GmailDesktopClientProps {
  rawEmails: EmailMessage[]
  userEmailId: string
  userPhone: string
}

export default function GmailDesktopClient({ rawEmails, userEmailId, userPhone }: GmailDesktopClientProps) {
  const [activeFolder, setActiveFolder] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const [lang, setLang] = useState('en')
  
  // Folder state stored in localStorage for completeness
  const [starredEmails, setStarredEmails] = useState<string[]>([])
  const [trashEmails, setTrashEmails] = useState<string[]>([])
  const [spamEmails, setSpamEmails] = useState<string[]>([])

  const listRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLang(localStorage.getItem('pm_lang') || 'en')
    const handleLangChange = () => setLang(localStorage.getItem('pm_lang') || 'en')
    window.addEventListener('pm_languageChange', handleLangChange)

    // Load folders
    try {
      const s = localStorage.getItem('pm_starred_emails')
      if (s) setStarredEmails(JSON.parse(s))
      const t = localStorage.getItem('pm_trash_emails')
      if (t) setTrashEmails(JSON.parse(t))
      const sp = localStorage.getItem('pm_spam_emails')
      if (sp) setSpamEmails(JSON.parse(sp))
    } catch (e) {}

    return () => window.removeEventListener('pm_languageChange', handleLangChange)
  }, [])
  const t = getTranslations(lang)

  // GSAP Animations
  useGSAP(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.email-row-anim')
      if (items.length > 0) {
        gsap.fromTo(items, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' })
      }
    }
  }, [activeFolder, searchQuery, rawEmails.length])

  useGSAP(() => {
    if (selectedEmail && readRef.current) {
      gsap.fromTo(readRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' })
    }
  }, [selectedEmail])

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const isStarred = starredEmails.includes(id)
    const updated = isStarred ? starredEmails.filter(i => i !== id) : [...starredEmails, id]
    setStarredEmails(updated)
    localStorage.setItem('pm_starred_emails', JSON.stringify(updated))
  }

  const moveToTrash = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = [...trashEmails, id]
    setTrashEmails(updated)
    localStorage.setItem('pm_trash_emails', JSON.stringify(updated))
    if (selectedEmail?.id === id) setSelectedEmail(null)
    showToast('Moved to Trash')
  }

  // Superhuman-style Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'c':
          e.preventDefault()
          router.push('/compose')
          break
        case 'Escape':
          e.preventDefault()
          if (isProfileOpen) setIsProfileOpen(false)
          else if (selectedEmail) setSelectedEmail(null)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, isProfileOpen, selectedEmail])

  // Simple folder logic based on sender/recipient and localStorage states
  const filteredEmails = rawEmails.filter(email => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!email.subject?.toLowerCase().includes(q) && !email.sender_address.toLowerCase().includes(q) && !email.body_text?.toLowerCase().includes(q)) return false
    }

    const isTrash = trashEmails.includes(email.id)
    const isSpam = spamEmails.includes(email.id)
    const isStarred = starredEmails.includes(email.id)

    if (activeFolder === 'trash') return isTrash
    if (activeFolder === 'spam') return isSpam
    
    // If it's in trash or spam, it shouldn't show up in other folders unless explicitly in them
    if (isTrash || isSpam) return false

    if (activeFolder === 'starred') return isStarred
    if (activeFolder === 'inbox') return email.recipient_address === userEmailId
    if (activeFolder === 'sent') return email.sender_address === userEmailId
    if (activeFolder === 'drafts') return false // Drafts are not stored in emails table for now
    
    return false
  })

  return (
    <div className={styles.desktopContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.hamburger} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <div className={styles.line} />
            <div className={styles.line} />
            <div className={styles.line} />
          </div>
          <h1 className={styles.brandTitle}>PhoneMail</h1>
        </div>

        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.headerRight}>
          <button className={styles.profileBtn} aria-label="Account" onClick={() => setIsProfileOpen(true)}>
            <div className={styles.avatar}>{userPhone ? userPhone.slice(-2) : 'PM'}</div>
          </button>
        </div>
      </header>

      <div className={styles.mainArea}>
        <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${activeFolder === 'inbox' ? styles.active : ''}`} onClick={() => { setActiveFolder('inbox'); setSelectedEmail(null); }}>
              <div className={styles.iconBox} data-color="blue"><Inbox size={16} /></div> <span className={styles.navText}>{t.inbox}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'starred' ? styles.active : ''}`} onClick={() => { setActiveFolder('starred'); setSelectedEmail(null); }}>
              <div className={styles.iconBox} data-color="yellow"><Star size={16} /></div> <span className={styles.navText}>{t.starred}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'sent' ? styles.active : ''}`} onClick={() => { setActiveFolder('sent'); setSelectedEmail(null); }}>
              <div className={styles.iconBox} data-color="green"><Send size={16} /></div> <span className={styles.navText}>{t.sent}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'drafts' ? styles.active : ''}`} onClick={() => { setActiveFolder('drafts'); setSelectedEmail(null); }}>
              <div className={styles.iconBox} data-color="gray"><FileText size={16} /></div> <span className={styles.navText}>{t.drafts}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'spam' ? styles.active : ''}`} onClick={() => { setActiveFolder('spam'); setSelectedEmail(null); }}>
              <div className={styles.iconBox} data-color="orange"><AlertOctagon size={16} /></div> <span className={styles.navText}>{t.spam}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'trash' ? styles.active : ''}`} onClick={() => { setActiveFolder('trash'); setSelectedEmail(null); }}>
              <div className={styles.iconBox} data-color="red"><Trash2 size={16} /></div> <span className={styles.navText}>{t.trash}</span>
            </button>
          </nav>
        </aside>

        <main className={styles.contentPane}>
          {selectedEmail ? (
            <div ref={readRef} className={styles.readView}>
              <div className={styles.readHeader}>
                <button className={styles.backToListBtn} onClick={() => setSelectedEmail(null)}>
                  &larr; Back to list
                </button>
                <div className={styles.readActions}>
                  <button className={styles.toolbarIcon} onClick={(e) => moveToTrash(e, selectedEmail.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h2 className={styles.readSubject}>{selectedEmail.subject || '(No Subject)'}</h2>
              <div className={styles.readMeta}>
                <div className={styles.senderAvatar}>{selectedEmail.sender_address.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{selectedEmail.sender_address}</strong>
                  <div className={styles.readDate}>{new Date(selectedEmail.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className={styles.readBody}>
                {selectedEmail.body_html ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                ) : (
                  <p>{selectedEmail.body_text}</p>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.listToolbar}>
               <button 
                 className={styles.toolbarIcon}
                 onClick={() => {
                   setIsRefreshing(true)
                   showToast('Refreshing inbox...')
                   setTimeout(() => setIsRefreshing(false), 1000)
                 }}
               >
                 <RefreshCcw size={16} className={isRefreshing ? styles.spin : ''} />
               </button>
            </div>
          )}

          {!selectedEmail && (
            <div ref={listRef} className={styles.emailList}>
              {filteredEmails.length === 0 ? (
                <div className={styles.emptyState}>
                  {activeFolder === 'inbox' && t.emptyInbox}
                  {activeFolder === 'sent' && t.emptySent}
                  {activeFolder === 'starred' && t.emptyStarred}
                  {activeFolder === 'drafts' && t.emptyDrafts}
                  {activeFolder === 'spam' && t.emptySpam}
                  {activeFolder === 'trash' && t.emptyTrash}
                </div>
              ) : (
                filteredEmails.map(email => {
                  const isStarred = starredEmails.includes(email.id)
                  return (
                  <div key={email.id} className={`email-row-anim ${styles.emailRow} ${!email.read_status && activeFolder === 'inbox' ? styles.unread : ''}`} onClick={() => setSelectedEmail(email)}>
                    <div className={styles.emailRowActions}>
                      <button className={styles.starIconBtn} onClick={(e) => toggleStar(e, email.id)}>
                        <Star size={18} fill={isStarred ? '#f9ab00' : 'none'} color={isStarred ? '#f9ab00' : '#a1a1aa'} />
                      </button>
                    </div>
                    <div className={styles.emailSender}>{email.sender_address === userEmailId ? 'Me' : email.sender_address.replace('@pmail.vixiya.com', '')}</div>
                    <div className={styles.emailSubjectSnippet}>
                      <strong>{email.subject || '(No Subject)'}</strong>
                      <span className={styles.snippetDash}> - </span>
                      <span className={styles.snippetText}>{email.body_text?.slice(0, 100)}</span>
                    </div>
                    <div className={styles.emailDate}>
                      {new Date(email.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )})
              )}
              <Link href="/compose" className={styles.fabComposeBtn}>
                <span className={styles.fabIcon}>+</span> {t.compose}
              </Link>
            </div>
          )}
        </main>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userEmailId={userEmailId}
        userPhone={userPhone}
      />
    </div>
  )
}
