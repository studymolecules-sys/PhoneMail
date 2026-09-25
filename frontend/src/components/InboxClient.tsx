'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './inbox.module.css'
import Drawer from './Drawer'
import ProfileModal from './ProfileModal'
import { Menu, Search, PenSquare, Star, CheckCheck, X, Sparkles } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

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
  userEmailId: string
  userPhone: string
}

export default function InboxClient({
  initialChats,
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

  const listRef = useRef<HTMLDivElement>(null)

  // Persist starred contacts in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pm_starred')
    if (saved) {
      try {
        setStarredContacts(JSON.parse(saved))
      } catch (e) {
        // fallback
      }
    }
  }, [])

  const toggleStar = (contact: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = starredContacts.includes(contact)
      ? starredContacts.filter((c) => c !== contact)
      : [...starredContacts, contact]
    setStarredContacts(updated)
    localStorage.setItem('pm_starred', JSON.stringify(updated))
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

  // GSAP animation for chat list elements
  useGSAP(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('.chat-item-row')
    if (items.length === 0) return

    gsap.fromTo(
      items,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' }
    )
  }, [filteredChats.length, filterChip])

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
              <h1 className={styles.brandHeading}>PhoneMail</h1>
              <span className={styles.onlineBadge}>
                <span className={styles.onlineDot} />
                Online
              </span>
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
              placeholder="Search by phone, email, or subject..."
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
        <div className={styles.filterChips}>
          <button
            type="button"
            className={`${styles.chip} ${filterChip === 'all' ? styles.chipActive : ''}`}
            onClick={() => setFilterChip('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filterChip === 'unread' ? styles.chipActive : ''}`}
            onClick={() => setFilterChip('unread')}
          >
            Unread
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filterChip === 'favorites' ? styles.chipActive : ''}`}
            onClick={() => setFilterChip('favorites')}
          >
            Favorites
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filterChip === 'attachments' ? styles.chipActive : ''}`}
            onClick={() => setFilterChip('attachments')}
          >
            Attachments
          </button>
        </div>
      </header>

      {/* Main Chat Feed */}
      <main className={styles.mainContent}>
        {filteredChats.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <Sparkles size={28} className={styles.emptySparkle} />
            </div>
            <h3>
              {searchQuery
                ? 'No matching conversations'
                : filterChip !== 'all'
                ? `No ${filterChip} conversations found`
                : 'No conversations yet'}
            </h3>
            <p>
              Your phone number is your universal email address. Share it with anyone to receive
              messages directly here.
            </p>
            <div className={styles.identityBadge}>
              <span>Your Email:</span>
              <strong>{userEmailId}</strong>
            </div>

            <Link href="/compose" className={styles.emptyActionBtn}>
              <PenSquare size={16} /> Compose New Email
            </Link>
          </div>
        ) : (
          <div ref={listRef} className={styles.chatListContainer}>
            {filteredChats.map((chat) => {
              const isStarred = starredContacts.includes(chat.contact)
              const displayName = chat.contact.replace('@phonemail.com', '')
              const initials = displayName.slice(0, 2).toUpperCase()

              return (
                <Link
                  href={`/chat/${encodeURIComponent(chat.contact)}`}
                  key={chat.contact}
                  className={`chat-item-row ${styles.chatItem}`}
                >
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
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for composing new email */}
      <Link href="/compose" className={styles.fab} aria-label="Compose New Email">
        <PenSquare size={22} />
      </Link>

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
