import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './compose.module.css'
import { sendMessage } from '../chat/[contact]/actions'
import { Send, ArrowLeft, Users, Info } from 'lucide-react'

export default async function ComposePage({
  searchParams,
}: {
  searchParams: { to?: string; subject?: string; body?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawPhone = user.phone || user.user_metadata?.phone || user.email?.split('@')[0] || '1234567890'
  const cleanDigits = rawPhone.replace(/[^\d]/g, '')
  const userEmailId = `${cleanDigits}@phonemail.com`

  return (
    <div className={styles.composeContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={22} />
          </Link>
          <div className={styles.headerTitle}>
            <h2>Compose Email</h2>
            <span className={styles.headerSubtitle}>From: {userEmailId}</span>
          </div>
        </div>
      </header>

      <form className={styles.form} action={sendMessage}>
        <input type="hidden" name="from" value={userEmailId} />

        <div className={styles.noticeBanner}>
          <Info size={16} className={styles.noticeIcon} />
          <span>
            Enter any phone number or email ID. To create a <strong>Group Chat</strong>, enter 2 or more phone numbers separated by commas.
          </span>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="to">To:</label>
          <input
            type="text"
            id="to"
            name="to"
            placeholder="e.g. 9876543210, 5550192834 or user@domain.com"
            defaultValue={searchParams?.to || ''}
            required
            className={styles.input}
            autoFocus
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="Email subject..."
            defaultValue={searchParams?.subject || ''}
            className={styles.input}
          />
        </div>

        <div className={styles.editorArea}>
          <textarea
            name="body"
            placeholder="Write your email here..."
            className={styles.textarea}
            defaultValue={searchParams?.body || ''}
            required
          />
        </div>

        <button type="submit" className={styles.sendFab} aria-label="Send Email">
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}
