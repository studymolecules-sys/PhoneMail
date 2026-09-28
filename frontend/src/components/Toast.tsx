'use client'

import { useState, useEffect } from 'react'
import styles from './Toast.module.css'

export type ToastType = 'success' | 'error' | 'info'

interface ToastEventDetail {
  message: string
  type: ToastType
}

export const showToast = (message: string, type: ToastType = 'info') => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent<ToastEventDetail>('show-toast', { detail: { message, type } })
    window.dispatchEvent(event)
  }
}

export default function Toast() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasFired, setHasFired] = useState(false)
  const [toastData, setToastData] = useState<ToastEventDetail>({ message: '', type: 'info' })

  useEffect(() => {
    const handleToast = (e: CustomEvent<ToastEventDetail>) => {
      setToastData(e.detail)
      setHasFired(true)
      setIsVisible(true)
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    }

    window.addEventListener('show-toast', handleToast as EventListener)
    return () => window.removeEventListener('show-toast', handleToast as EventListener)
  }, [])

  if (!hasFired) return null

  return (
    <div 
      className={`${styles.toastContainer} ${isVisible ? styles.slideIn : styles.slideOut}`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div className={`${styles.toastPill} ${styles[toastData.type]}`}>
        <span>{toastData.message}</span>
      </div>
    </div>
  )
}
