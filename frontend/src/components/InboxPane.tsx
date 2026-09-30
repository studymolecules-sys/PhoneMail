import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InboxClient, { type ChatItemData } from './InboxClient'
import type { EmailMessage } from '@/app/(main)/chat/[contact]/SpikeChatView'
import { getDemoEmails } from '@/lib/demo-emails'

export default async function InboxPane() {
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

  const demoMode = process.env.PHONEMAIL_DEMO_MODE === 'true'
  const { data: emailRows, error } = demoMode ? { data: null, error: null } : await supabase
    .from('emails')
    .select('*')
    .or(`sender_address.eq.${userEmailId},recipient_address.eq.${userEmailId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching emails from Supabase:', error)
  }

  const emails: EmailMessage[] = demoMode ? getDemoEmails(userEmailId) : (emailRows || []).map((email) => ({
    id: String(email.id),
    sender_address: email.sender_address || '',
    recipient_address: email.recipient_address || '',
    subject: email.subject || '',
    body_text: email.body_text || '',
    body_html: email.body_html || '',
    created_at: email.created_at,
    read_status: email.read_status ?? false,
  }))
  const chatsMap = new Map<string, EmailMessage[]>()

  ;(emails || []).forEach((email) => {
    const otherParty =
      email.sender_address === userEmailId ? email.recipient_address : email.sender_address

    if (!chatsMap.has(otherParty)) {
      chatsMap.set(otherParty, [])
    }
    chatsMap.get(otherParty)!.push(email)
  })

  const chatList: ChatItemData[] = Array.from(chatsMap.entries()).map(([contact, messages]) => {
    return {
      contact,
      latestMessage: messages[0],
      unreadCount: messages.filter(
        (m) => !m.read_status && m.recipient_address === userEmailId
      ).length,
    }
  })

  return (
    <InboxClient
      initialChats={chatList}
      rawEmails={emails}
      userEmailId={userEmailId}
      userPhone={rawPhone}
    />
  )
}
