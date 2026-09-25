'use client'

import { useState } from 'react'
import styles from './ProfileModal.module.css'
import { X, Copy, Check, LogOut } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userEmailId: string
  userPhone: string
}

export default function ProfileModal({
  isOpen,
  onClose,
  userEmailId,
  userPhone,
}: ProfileModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(userEmailId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Account Settings</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close Settings">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Identity Card */}
          <div className={styles.identityCard}>
            <div className={styles.avatarLarge}>
              {userPhone ? userPhone.slice(-2) : 'PM'}
            </div>
            <div className={styles.identityDetails}>
              <h3 className={styles.phoneHeading}>{userPhone || 'PhoneMail User'}</h3>
              <div className={styles.emailRow}>
                <span className={styles.emailBadge}>{userEmailId}</span>
                <button className={styles.copyBtn} onClick={handleCopy} aria-label="Copy Email Address">
                  {copied ? <Check size={14} color="var(--wa-accent)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.infoText}>
            This is your universal PhoneMail inbox. All emails sent to this address are securely routed to your device.
          </div>

          {/* Sign Out Button */}
          <form action="/auth/signout" method="POST" className={styles.signoutForm}>
            <button type="submit" className={styles.signoutBtn}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
