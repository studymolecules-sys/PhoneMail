import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import styles from './home.module.css'
import ChatList from './ChatList' // Client component for animations and interactivity

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // The user's phone number acts as their email ID identity
  const userEmailId = `${user.phone}@phonemail.com`

  // Fetch all emails where the user is either the sender or recipient
  const { data: emails, error } = await supabase
    .from('emails')
    .select('*')
    .or(`sender_address.eq.${userEmailId},recipient_address.eq.${userEmailId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching emails:', error)
  }

  // Group emails into "Chats" based on the other party
  const chatsMap = new Map<string, any[]>()

  ;(emails || []).forEach((email) => {
    // Determine who the other person is in this conversation
    const otherParty =
      email.sender_address === userEmailId ? email.recipient_address : email.sender_address

    if (!chatsMap.has(otherParty)) {
      chatsMap.set(otherParty, [])
    }
    chatsMap.get(otherParty)!.push(email)
  })

  // Convert map to array of chats, sorting by the latest message
  const chatList = Array.from(chatsMap.entries()).map(([contact, messages]) => {
    return {
      contact,
      latestMessage: messages[0],
      unreadCount: messages.filter(
        (m) => !m.read_status && m.recipient_address === userEmailId
      ).length,
    }
  })

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <button className={styles.iconButton}>☰</button>
          <div className={styles.searchContainer}>
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>
          <button className={styles.iconButton}>
            <div className={styles.profileAvatar}>
              {user.phone?.slice(-2)}
            </div>
          </button>
        </div>
        
        <div className={styles.filterChips}>
          <button className={`${styles.chip} ${styles.chipActive}`}>All</button>
          <button className={styles.chip}>Unread</button>
          <button className={styles.chip}>Attachments</button>
          <button className={styles.chip}>Favorites</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {chatList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No messages yet. Give out your number!</p>
            <p className={styles.identityText}>Your ID: {userEmailId}</p>
          </div>
        ) : (
          <ChatList chats={chatList} />
        )}
      </main>

      <button className={styles.fab}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  )
}
