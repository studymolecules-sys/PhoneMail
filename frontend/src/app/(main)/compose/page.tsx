import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './compose.module.css'
import { sendMessage } from '../chat/[contact]/actions'
import { Send } from 'lucide-react'

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
          <Send size={24} />
        </button>
      </form>
    </div>
  )
}
