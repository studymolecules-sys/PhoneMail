import { createClient } from '@/lib/supabase/server'
import styles from './inbox.module.css'
import ChatList from './ChatList' 
import Link from 'next/link'
import { Menu, PenSquare } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function InboxPane() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmailId = `${user.phone}@phonemail.com`

  const { data: emails, error } = await supabase
    .from('emails')
    .select('*')
    .or(`sender_address.eq.${userEmailId},recipient_address.eq.${userEmailId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching emails:', error)
  }

  const chatsMap = new Map<string, any[]>()

  ;(emails || []).forEach((email) => {
    const otherParty =
      email.sender_address === userEmailId ? email.recipient_address : email.sender_address

    if (!chatsMap.has(otherParty)) {
      chatsMap.set(otherParty, [])
    }
    chatsMap.get(otherParty)!.push(email)
  })

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
          <button className={styles.iconButton}>
            <Menu size={20} />
          </button>
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

      <Link href="/compose">
        <button className={styles.fab}>
          <PenSquare size={24} />
        </button>
      </Link>
    </div>
  )
}
