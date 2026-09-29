'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import styles from './chatlist.module.css'
import Link from 'next/link'

export default function ChatList({ chats }: { chats: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return
    
    gsap.from(containerRef.current.children, {
      y: 30,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    })
  }, { scope: containerRef })

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div ref={containerRef} className={styles.listContainer}>
      {chats.map((chat) => (
        <Link href={`/chat/${chat.contact}`} key={chat.contact} style={{ textDecoration: 'none' }}>
          <div className={styles.chatItem}>
            <div className={styles.avatar}>
              {chat.contact.charAt(0).toUpperCase()}
            </div>
            
            <div className={styles.chatContent}>
              <div className={styles.chatHeader}>
                <h3 className={styles.contactName}>{chat.contact.replace('@pmail.vixiya.com', '')}</h3>
                <span className={styles.time}>{formatTime(chat.latestMessage.created_at)}</span>
              </div>
              
              <div className={styles.chatPreview}>
                <p className={styles.subject}>{chat.latestMessage.subject || 'No Subject'}</p>
                {chat.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
