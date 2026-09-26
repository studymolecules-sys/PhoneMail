'use client'

import { useState, useRef, TouchEvent } from 'react'
import Link from 'next/link'
import { Star, Trash2, Archive } from 'lucide-react'
import styles from './SwipeableChatRow.module.css'

interface SwipeableChatRowProps {
  href: string
  contact: string
  isStarred: boolean
  onToggleStar: (contact: string, e: React.MouseEvent | React.TouchEvent) => void
  children: React.ReactNode
}

export default function SwipeableChatRow({
  href,
  contact,
  isStarred,
  onToggleStar,
  children
}: SwipeableChatRowProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const startX = useRef(0)
  const currentX = useRef(0)
  const SWIPE_THRESHOLD = 80 // Pixels to reveal action

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current

    // Allow swipe right (Star) and left (Archive/Trash)
    // Dampen the movement
    if (diff > 0) {
      setTranslateX(Math.min(diff * 0.5, SWIPE_THRESHOLD + 20))
    } else {
      setTranslateX(Math.max(diff * 0.5, -(SWIPE_THRESHOLD + 20)))
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (translateX > SWIPE_THRESHOLD * 0.8) {
      // Trigger Star on full swipe right
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
      onToggleStar(contact, {} as any)
    } else if (translateX < -SWIPE_THRESHOLD * 0.8) {
      // Trigger Archive/Delete (mock) on full swipe left
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30])
      // onArchive(contact)
    }
    
    // Snap back
    setTranslateX(0)
  }

  return (
    <div className={styles.swipeContainer}>
      {/* Background Actions */}
      <div className={styles.backgroundActions}>
        <div className={`${styles.actionLeft} ${translateX > SWIPE_THRESHOLD * 0.8 ? styles.actionActive : ''}`}>
          <Star size={24} fill={isStarred ? '#fff' : 'none'} />
        </div>
        <div className={`${styles.actionRight} ${translateX < -SWIPE_THRESHOLD * 0.8 ? styles.actionActive : ''}`}>
          <Archive size={24} />
        </div>
      </div>

      {/* Foreground Chat Item */}
      <div
        className={styles.foregroundContent}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link href={href} className={styles.chatLinkWrapper} draggable={false}>
          {children}
        </Link>
      </div>
    </div>
  )
}
