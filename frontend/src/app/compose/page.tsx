import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './compose.module.css'
import { sendMessage } from '../chat/[contact]/actions'

export default async function ComposePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmailId = `${user.phone}@phonemail.com`

  return (
    <div className={styles.composeContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.cancelButton}>
          Cancel
        </Link>
        <div className={styles.headerTitle}>
          <h2>New Message</h2>
        </div>
        <div className={styles.headerSpacer}></div>
      </header>

      <form className={styles.form} action={sendMessage}>
        <input type="hidden" name="from" value={userEmailId} />
        
        <div className={styles.inputGroup}>
          <label htmlFor="to">To:</label>
          <input 
            type="text" 
            id="to" 
            name="to" 
            placeholder="e.g. 9876543210@phonemail.com" 
            required 
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="subject">Subject:</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            placeholder="Optional" 
            className={styles.input}
          />
        </div>

        <div className={styles.editorArea}>
          <textarea 
            name="body" 
            placeholder="Write your email here..." 
            className={styles.textarea}
            required
          ></textarea>
        </div>

        <button type="submit" className={styles.sendFab}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
}
