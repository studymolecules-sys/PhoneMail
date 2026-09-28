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
  useEffect(() => {
    setLang(localStorage.getItem('pm_lang') || 'en')
    const handleLangChange = () => setLang(localStorage.getItem('pm_lang') || 'en')
    window.addEventListener('pm_languageChange', handleLangChange)
    return () => window.removeEventListener('pm_languageChange', handleLangChange)
  }, [])
  const t = getTranslations(lang)

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

  // Simple folder logic based on sender/recipient
  const filteredEmails = rawEmails.filter(email => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!email.subject?.toLowerCase().includes(q) && !email.sender_address.toLowerCase().includes(q)) return false
    }

    if (activeFolder === 'inbox') return email.recipient_address === userEmailId
    if (activeFolder === 'sent') return email.sender_address === userEmailId
    if (activeFolder === 'starred') return false // Mock for demo
    
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
          <h1 className={styles.brandTitle}>PMail</h1>
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
          <Link href="/compose" className={styles.composeBtn}>
            <span className={styles.composeIcon}>+</span>
            <span className={styles.navText}>{t.compose}</span>
          </Link>

          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${activeFolder === 'inbox' ? styles.active : ''}`} onClick={() => { setActiveFolder('inbox'); setSelectedEmail(null); }}>
              <Inbox size={18} /> <span className={styles.navText}>{t.inbox}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'starred' ? styles.active : ''}`} onClick={() => { setActiveFolder('starred'); setSelectedEmail(null); }}>
              <Star size={18} /> <span className={styles.navText}>{t.starred}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'sent' ? styles.active : ''}`} onClick={() => { setActiveFolder('sent'); setSelectedEmail(null); }}>
              <Send size={18} /> <span className={styles.navText}>{t.sent}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'drafts' ? styles.active : ''}`} onClick={() => { setActiveFolder('drafts'); setSelectedEmail(null); }}>
              <FileText size={18} /> <span className={styles.navText}>{t.drafts}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'spam' ? styles.active : ''}`} onClick={() => { setActiveFolder('spam'); setSelectedEmail(null); }}>
              <AlertOctagon size={18} /> <span className={styles.navText}>{t.spam}</span>
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'trash' ? styles.active : ''}`} onClick={() => { setActiveFolder('trash'); setSelectedEmail(null); }}>
              <Trash2 size={18} /> <span className={styles.navText}>{t.trash}</span>
            </button>
          </nav>
        </aside>

        <main className={styles.contentPane}>
          {selectedEmail ? (
            <div className={styles.readView}>
              <div className={styles.readHeader}>
                <button className={styles.backToListBtn} onClick={() => setSelectedEmail(null)}>
                  &larr; Back to list
                </button>
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
            <div className={styles.emailList}>
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
                filteredEmails.map(email => (
                  <div key={email.id} className={`${styles.emailRow} ${!email.read_status && activeFolder === 'inbox' ? styles.unread : ''}`} onClick={() => setSelectedEmail(email)}>
                    <div className={styles.emailSender}>{email.sender_address.replace('@pmail.vixiya.com', '')}</div>
                    <div className={styles.emailSubjectSnippet}>
                      <strong>{email.subject || '(No Subject)'}</strong>
                      <span className={styles.snippetDash}> - </span>
                      <span className={styles.snippetText}>{email.body_text?.slice(0, 100)}</span>
                    </div>
                    <div className={styles.emailDate}>
                      {new Date(email.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
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
