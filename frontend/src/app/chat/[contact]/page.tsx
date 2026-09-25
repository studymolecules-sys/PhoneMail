import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './chat.module.css'
import { sendMessage } from './actions'
import ChatThread from './ChatThread'

export default async function ChatPage({ params }: { params: Promise<{ contact: string }> }) {
  const resolvedParams = await params
  const contact = decodeURIComponent(resolvedParams.contact)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmailId = `${user.phone}@phonemail.com`

  // Fetch emails between this user and the contact
  const { data: emails } = await supabase
    .from('emails')
    .select('*')
    .or(
      `and(sender_address.eq.${userEmailId},recipient_address.eq.${contact}),and(sender_address.eq.${contact},recipient_address.eq.${userEmailId})`
    )
    .order('created_at', { ascending: true })

  // Mark unread messages from this contact as read
  await supabase
    .from('emails')
    .update({ read_status: true })
    .eq('sender_address', contact)
    .eq('recipient_address', userEmailId)
    .eq('read_status', false)

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ←
        </Link>
        <div className={styles.headerTitle}>
          <h2>{contact.replace('@phonemail.com', '')}</h2>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>⋮</button>
        </div>
      </header>

      <main className={styles.messageArea}>
        <ChatThread messages={emails || []} currentUser={userEmailId} />
      </main>

      <form className={styles.inputArea} action={sendMessage}>
        <input type="hidden" name="to" value={contact} />
        <input type="hidden" name="from" value={userEmailId} />
        
        <input
          type="text"
          name="subject"
          className={styles.subjectInput}
          placeholder="Subject (Optional)"
        />
        
        <div className={styles.messageRow}>
          <input
            type="text"
            name="body"
            className={styles.messageInput}
            placeholder="Type a message..."
            required
            autoComplete="off"
          />
          <button type="submit" className={styles.sendButton}>
            ➤
          </button>
        </div>
      </form>
    </div>
  )
}
