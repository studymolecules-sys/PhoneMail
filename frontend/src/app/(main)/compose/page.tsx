import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './compose.module.css'
import { sendMessage } from '../chat/[contact]/actions'
import { ArrowLeft } from 'lucide-react'
import ComposeClientForm from './ComposeClientForm'

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
  const userEmailId = `${cleanDigits}@pmail.vixiya.com`

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

      <ComposeClientForm
        userEmailId={userEmailId}
        sendMessage={sendMessage}
        initialTo={searchParams?.to}
        initialSubject={searchParams?.subject}
        initialBody={searchParams?.body}
      />
    </div>
  )
}
