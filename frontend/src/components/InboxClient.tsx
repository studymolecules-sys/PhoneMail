'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './inbox.module.css'
import Drawer from './Drawer'
import ProfileModal from './ProfileModal'
import { Menu, Search, PenSquare, Star, CheckCheck, X, Sparkles, Trash2 } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import SwipeableChatRow from './SwipeableChatRow'
import { getTranslations } from '@/app/i18n'
import { EmailMessage } from '@/app/(main)/chat/[contact]/SpikeChatView'
import { showToast } from './Toast'

export interface ChatItemData {
  contact: string
  latestMessage: {
    id: string
    sender_address: string
    recipient_address: string
    subject: string
    body_text: string
    body_html: string
    created_at: string
    read_status: boolean
  }
  unreadCount: number
}

interface InboxClientProps {
  initialChats: ChatItemData[]
  rawEmails?: EmailMessage[]
  userEmailId: string
  userPhone: string
}

export default function InboxClient({
  initialChats,
  rawEmails = [],
  userEmailId,
  userPhone,
}: InboxClientProps) {
  const [chats] = useState<ChatItemData[]>(initialChats)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterChip, setFilterChip] = useState<'all' | 'unread' | 'attachments' | 'favorites'>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState('all')
  const [starredContacts, setStarredContacts] = useState<string[]>([])
  
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [starredEmails, setStarredEmails] = useState<string[]>([])
  const [trashEmails, setTrashEmails] = useState<string[]>([])
  const [spamEmails, setSpamEmails] = useState<string[]>([])

  const listRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLAnchorElement>(null)
  const router = useRouter()

  const [lang, setLang] = useState('en')
  useEffect(() => {
    setLang(localStorage.getItem('pm_lang') || 'en')
    const handleLangChange = () => setLang(localStorage.getItem('pm_lang') || 'en')
    window.addEventListener('pm_languageChange', handleLangChange)
    return () => window.removeEventListener('pm_languageChange', handleLangChange)
  }, [])
  const t = getTranslations(lang)

  // Persist starred contacts and folder states
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pm_starred')
      if (saved) setStarredContacts(JSON.parse(saved))
      const s = localStorage.getItem('pm_starred_emails')
      if (s) setStarredEmails(JSON.parse(s))
      const t = localStorage.getItem('pm_trash_emails')
      if (t) setTrashEmails(JSON.parse(t))
      const sp = localStorage.getItem('pm_spam_emails')
      if (sp) setSpamEmails(JSON.parse(sp))
    } catch (e) {}
  }, [])

  const toggleStar = (contact: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const updated = starredContacts.includes(contact)
      ? starredContacts.filter((c) => c !== contact)
      : [...starredContacts, contact]
    setStarredContacts(updated)
    localStorage.setItem('pm_starred', JSON.stringify(updated))
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  // Filter chats by search query, filter chip, and active folder
  const filteredChats = useMemo(() => {
    return chats.filter((item) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchContact = item.contact.toLowerCase().includes(q)
        const matchSubject = (item.latestMessage?.subject || '').toLowerCase().includes(q)
        const matchBody = (item.latestMessage?.body_text || '').toLowerCase().includes(q)
        if (!matchContact && !matchSubject && !matchBody) return false
      }

      // Filter chips
      if (filterChip === 'unread' && item.unreadCount === 0) return false
      if (filterChip === 'favorites' && !starredContacts.includes(item.contact)) return false
      if (filterChip === 'attachments') {
        const body = (item.latestMessage?.body_html || '') + (item.latestMessage?.body_text || '')
        if (!body.includes('http') && !body.includes('attach') && !body.includes('file')) return false
      }

      // Folder navigation
      if (activeFolder === 'favorites' && !starredContacts.includes(item.contact)) return false
      if (activeFolder === 'spam') {
        const isSpam = (item.latestMessage?.subject || '').toLowerCase().includes('spam')
        if (!isSpam) return false
      }
      if (activeFolder === 'drafts') {
        return false // Empty for demo
      }
      if (activeFolder === 'trash') {
        return false // Empty for demo
      }

      return true
    })
  }, [chats, searchQuery, filterChip, activeFolder, starredContacts])

  // Normal Gmail Mobile chronological list logic
  const filteredEmails = useMemo(() => {
    return rawEmails.filter(email => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (!email.subject?.toLowerCase().includes(q) && !email.sender_address.toLowerCase().includes(q) && !email.body_text?.toLowerCase().includes(q)) return false
      }

      const isTrash = trashEmails.includes(email.id)
      const isSpam = spamEmails.includes(email.id)
      const isStarred = starredEmails.includes(email.id)

      if (activeFolder === 'trash') return isTrash
      if (activeFolder === 'spam') return isSpam
      if (isTrash || isSpam) return false

      if (activeFolder === 'starred' || filterChip === 'favorites') return isStarred
      if (activeFolder === 'sent') return email.sender_address === userEmailId
      if (activeFolder === 'drafts') return false
      
      // Default Inbox
      if (activeFolder === 'all' || activeFolder === 'chat_interface') {
        if (filterChip === 'unread') return !email.read_status
        return email.recipient_address === userEmailId
      }
      return false
    })
  }, [rawEmails, searchQuery, filterChip, activeFolder, starredEmails, trashEmails, spamEmails])

  // GSAP animation for chat/email list elements
  useGSAP(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('.item-row-anim')
    if (items.length === 0) return

    gsap.fromTo(
      items,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' }
    )
  }, [filteredChats.length, filteredEmails.length, filterChip, activeFolder])

  useGSAP(() => {
    if (selectedEmail && readRef.current) {
      gsap.fromTo(readRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power3.out' })
    }
  }, [selectedEmail])

  const toggleEmailStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = starredEmails.includes(id) ? starredEmails.filter(i => i !== id) : [...starredEmails, id]
    setStarredEmails(updated)
    localStorage.setItem('pm_starred_emails', JSON.stringify(updated))
    if (navigator.vibrate) navigator.vibrate(50)
  }

  const moveEmailToTrash = (id: string) => {
    const updated = [...trashEmails, id]
    setTrashEmails(updated)
    localStorage.setItem('pm_trash_emails', JSON.stringify(updated))
    setSelectedEmail(null)
    showToast('Moved to Trash')
  }

  const formatWhatsAppTime = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diffHours < 48) {
      return 'Yesterday'
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const handleFabClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!fabRef.current) return
    
    // Morphing animation
    gsap.to(fabRef.current, {
      scale: 50,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        router.push('/compose')
      }
    })
  }

  return (
    <div className={styles.appContainer}>
      {/* Top Header - Authentic WhatsApp Design Language */}
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.leftBrand}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>
            <div className={styles.titleColumn}>
              <h1 className={styles.brandHeading}>PMail</h1>
            </div>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.profileBtn}
              onClick={() => setIsProfileOpen(true)}
              aria-label="Account & Settings"
            >
              <div className={styles.profileAvatar}>
                {userPhone ? userPhone.slice(-2) : 'PM'}
              </div>
            </button>
          </div>
        </div>

        {/* Full-width Search Bar */}
        <div className={styles.searchRow}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t.searchMobile}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips mandated by Task.docx: All, Unread, Attachments, Favorites */}
        <div className={styles.filterChipsContainer}>
          <div className={styles.filterChips}>
            <button
              type="button"
              className={`${styles.chip} ${filterChip === 'all' ? styles.chipActiveText : ''}`}
              onClick={() => setFilterChip('all')}
            >
              {t.all}
            </button>
            <button
              type="button"
              className={`${styles.chip} ${filterChip === 'unread' ? styles.chipActiveText : ''}`}
              onClick={() => setFilterChip('unread')}
            >
              {t.unread}
            </button>
            <button
              type="button"
              className={`${styles.chip} ${filterChip === 'favorites' ? styles.chipActiveText : ''}`}
              onClick={() => setFilterChip('favorites')}
            >
              {t.favorites}
            </button>
            <button
              type="button"
              className={`${styles.chip} ${filterChip === 'attachments' ? styles.chipActiveText : ''}`}
              onClick={() => setFilterChip('attachments')}
            >
              {t.attachments}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Feed */}
      <main className={styles.mainContent}>
        {selectedEmail ? (
          <div ref={readRef} className={styles.mobileReadView}>
            <div className={styles.readHeaderMobile}>
              <button className={styles.iconButton} onClick={() => setSelectedEmail(null)}>
                &larr; Back
              </button>
              <div className={styles.readActions}>
                <button className={styles.iconButton} onClick={() => moveEmailToTrash(selectedEmail.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h2 className={styles.readSubject}>{selectedEmail.subject || '(No Subject)'}</h2>
            <div className={styles.readMetaMobile}>
              <div className={styles.senderAvatar}>{selectedEmail.sender_address.charAt(0).toUpperCase()}</div>
              <div>
                <strong>{selectedEmail.sender_address === userEmailId ? 'Me' : selectedEmail.sender_address}</strong>
                <div className={styles.readDate}>{new Date(selectedEmail.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className={styles.readBodyMobile}>
              {selectedEmail.body_html ? (
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
              ) : (
                <p>{selectedEmail.body_text}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {(activeFolder === 'chat_interface' ? filteredChats : filteredEmails).length === 0 ? (
              <div className={styles.emptyState}>
                {searchQuery
                  ? 'No matching conversations'
                  : activeFolder === 'all' && filterChip === 'all' ? t.emptyInbox
                  : activeFolder === 'sent' ? t.emptySent
                  : activeFolder === 'spam' ? t.emptySpam
                  : activeFolder === 'drafts' ? t.emptyDrafts
                  : activeFolder === 'trash' ? t.emptyTrash
                  : activeFolder === 'favorites' || filterChip === 'favorites' ? t.emptyStarred
                  : filterChip !== 'all'
                  ? `No ${filterChip} conversations found`
                  : t.emptyInbox}
              </div>
            ) : (
              <div ref={listRef} className={styles.chatListContainer}>
                {activeFolder === 'chat_interface' ? (
                  filteredChats.map((chat) => {
                    const isStarred = starredContacts.includes(chat.contact)
                    const displayName = chat.contact.replace('@pmail.vixiya.com', '')
                    const initials = displayName.slice(0, 2).toUpperCase()

                    return (
                      <SwipeableChatRow
                        key={chat.contact}
                        href={`/chat/${encodeURIComponent(chat.contact)}`}
                        contact={chat.contact}
                        isStarred={isStarred}
                        onToggleStar={toggleStar}
                      >
                        <div className={`item-row-anim ${styles.chatItem}`}>
                          <div className={styles.avatar}>
                            <span>{initials}</span>
                          </div>

                        <div className={styles.chatContent}>
                          <div className={styles.chatHeader}>
                            <h4 className={styles.contactName}>{displayName}</h4>
                            <span className={styles.time} suppressHydrationWarning>
                              {formatWhatsAppTime(chat.latestMessage?.created_at)}
                            </span>
                          </div>

                          <div className={styles.chatPreview}>
                            <div className={styles.previewLeft}>
                              {chat.latestMessage?.sender_address === userEmailId && (
                                <CheckCheck size={16} className={styles.checkIcon} />
                              )}
                              <p className={styles.subject}>
                                <strong>{chat.latestMessage?.subject || '(No Subject)'}</strong>
                                {chat.latestMessage?.body_text ? ` — ${chat.latestMessage.body_text}` : ''}
                              </p>
                            </div>

                            <div className={styles.previewRight}>
                              <button
                                type="button"
                                className={`${styles.starBtn} ${isStarred ? styles.starBtnActive : ''}`}
                                onClick={(e) => toggleStar(chat.contact, e)}
                                aria-label={isStarred ? 'Unstar' : 'Star conversation'}
                              >
                                <Star size={16} fill={isStarred ? '#f9ab00' : 'none'} />
                              </button>

                              {chat.unreadCount > 0 && (
                                <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      </SwipeableChatRow>
                    )
                  })
                ) : (
                  filteredEmails.map((email) => {
                    const isStarred = starredEmails.includes(email.id)
                    return (
                      <div key={email.id} className={`item-row-anim ${styles.emailRowMobile} ${!email.read_status && activeFolder === 'all' ? styles.unread : ''}`} onClick={() => setSelectedEmail(email)}>
                        <div className={styles.avatar}>
                          {email.sender_address === userEmailId ? 'M' : email.sender_address.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.chatContent}>
                          <div className={styles.chatHeader}>
                            <h4 className={styles.contactName}>{email.sender_address === userEmailId ? 'Me' : email.sender_address.replace('@pmail.vixiya.com', '')}</h4>
                            <span className={styles.time}>{formatWhatsAppTime(email.created_at)}</span>
                          </div>
                          <div className={styles.chatPreview}>
                            <div className={styles.previewLeft}>
                              <p className={styles.subject}>
                                <strong>{email.subject || '(No Subject)'}</strong>
                                <span className={styles.snippetText}> — {email.body_text?.slice(0, 80)}</span>
                              </p>
                            </div>
                            <div className={styles.previewRight}>
                              <button className={styles.starIconBtnMobile} onClick={(e) => toggleEmailStar(e, email.id)}>
                                <Star size={18} fill={isStarred ? '#f9ab00' : 'none'} color={isStarred ? '#f9ab00' : '#888'} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {!selectedEmail && (
        <a 
          href="/compose" 
          ref={fabRef}
          className={styles.fab} 
          aria-label="Compose New Email"
          onClick={handleFabClick}
        >
          <PenSquare size={22} />
        </a>
      )}

      {/* Slide-out Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userEmailId={userEmailId}
        userPhone={userPhone}
        activeFolder={activeFolder}
        onSelectFolder={(f) => setActiveFolder(f)}
        onOpenSettings={() => setIsProfileOpen(true)}
      />

      {/* Profile & Alias Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userEmailId={userEmailId}
        userPhone={userPhone}
      />
    </div>
  )
}
