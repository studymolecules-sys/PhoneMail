import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InboxClient, { ChatItemData } from './InboxClient'

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

  const { data: emails, error } = await supabase
    .from('emails')
    .select('*')
    .or(`sender_address.eq.${userEmailId},recipient_address.eq.${userEmailId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching emails from Supabase:', error)
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

  let chatList: ChatItemData[] = Array.from(chatsMap.entries()).map(([contact, messages]) => {
    return {
      contact,
      latestMessage: messages[0],
      unreadCount: messages.filter(
        (m) => !m.read_status && m.recipient_address === userEmailId
      ).length,
    }
  })

  // If inbox is brand new, provide a welcome email thread so the demo looks active and polished
  if (chatList.length === 0) {
    const welcomeContact = '18005550199@pmail.vixiya.com'
    chatList = [
      {
        contact: welcomeContact,
        latestMessage: {
          id: 'welcome-01',
          sender_address: welcomeContact,
          recipient_address: userEmailId,
          subject: 'Welcome to PhoneMail!',
          body_text: 'Your phone number is now your universal email ID. Anyone in the world can email you at this address.',
          body_html: '<p>Your phone number is now your universal email ID. Anyone in the world can email you at this address.</p>',
          created_at: new Date().toISOString(),
          read_status: false,
        },
        unreadCount: 1,
      }
    ]
  }

  return (
    <InboxClient
      initialChats={chatList}
      userEmailId={userEmailId}
      userPhone={rawPhone}
    />
  )
}
