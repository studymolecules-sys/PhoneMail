'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './GmailDesktopClient.module.css'
import { Search, Inbox, Star, Send, FileText, AlertOctagon, Trash2, Settings, UserCircle, RefreshCcw } from 'lucide-react'
import ProfileModal from './ProfileModal'
import { EmailMessage } from '@/app/(main)/chat/[contact]/SpikeChatView'

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
  const router = useRouter()

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
          <div className={styles.hamburger}>
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
            placeholder="Search mail" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.headerRight}>
          <button className={styles.iconBtn} aria-label="Settings" onClick={() => setIsProfileOpen(true)}>
            <Settings size={22} />
          </button>
          <button className={styles.profileBtn} aria-label="Account" onClick={() => setIsProfileOpen(true)}>
            <div className={styles.avatar}>{userPhone ? userPhone.slice(-2) : 'PM'}</div>
          </button>
        </div>
      </header>

      <div className={styles.mainArea}>
        <aside className={styles.sidebar}>
          <Link href="/compose" className={styles.composeBtn}>
            <span className={styles.composeIcon}>+</span>
            Compose
          </Link>

          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${activeFolder === 'inbox' ? styles.active : ''}`} onClick={() => { setActiveFolder('inbox'); setSelectedEmail(null); }}>
              <Inbox size={18} /> Inbox
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'starred' ? styles.active : ''}`} onClick={() => { setActiveFolder('starred'); setSelectedEmail(null); }}>
              <Star size={18} /> Starred
            </button>
            <button className={`${styles.navItem} ${activeFolder === 'sent' ? styles.active : ''}`} onClick={() => { setActiveFolder('sent'); setSelectedEmail(null); }}>
              <Send size={18} /> Sent
            </button>
            <button className={styles.navItem} onClick={() => alert('Drafts coming soon')}>
              <FileText size={18} /> Drafts
            </button>
            <button className={styles.navItem} onClick={() => alert('Spam coming soon')}>
              <AlertOctagon size={18} /> Spam
            </button>
            <button className={styles.navItem} onClick={() => alert('Trash coming soon')}>
              <Trash2 size={18} /> Trash
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
               <button className={styles.toolbarIcon}><RefreshCcw size={16} /></button>
            </div>
          )}

          {!selectedEmail && (
            <div className={styles.emailList}>
              {filteredEmails.length === 0 ? (
                <div className={styles.emptyState}>No emails found.</div>
              ) : (
                filteredEmails.map(email => (
                  <div key={email.id} className={`${styles.emailRow} ${!email.read_status && activeFolder === 'inbox' ? styles.unread : ''}`} onClick={() => setSelectedEmail(email)}>
                    <div className={styles.emailSender}>{email.sender_address.replace('@phonemail.com', '')}</div>
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
