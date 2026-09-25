'use client'

import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import styles from './chat.module.css'

export default function ChatThread({ messages, currentUser }: { messages: any[], currentUser: string }) {
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on load
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length])

  // GSAP animation for new messages
  useGSAP(() => {
    if (!containerRef.current) return
    const bubbles = gsap.utils.toArray('.chat-bubble')
    if (bubbles.length === 0) return

    // Animate only the last few if there are many, or just stagger the initial load
    gsap.from(bubbles, {
      y: 20,
      opacity: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'all'
    })
  }, { scope: containerRef, dependencies: [messages.length] })

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div ref={containerRef} className={styles.threadContainer}>
      {messages.length === 0 ? (
        <div className={styles.emptyChat}>
          <p>No messages yet. Send a quick hello!</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isMe = msg.sender_address === currentUser
          
          return (
            <div 
              key={msg.id} 
              className={`chat-bubble ${styles.messageWrapper} ${isMe ? styles.sent : styles.received}`}
            >
              <div className={styles.bubble}>
                {msg.subject && msg.subject.trim() !== '' && (
                  <div className={styles.msgSubject}>{msg.subject}</div>
                )}
                <div className={styles.msgBody}>{msg.body_text}</div>
                <span className={styles.msgTime}>{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })
      )}
      <div ref={endRef} />
    </div>
  )
}
