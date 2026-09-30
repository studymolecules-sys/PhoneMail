import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { sendMessage } from './actions'
import SpikeChatView, { EmailMessage } from './SpikeChatView'
import { getDemoEmails } from '@/lib/demo-emails'

export default async function ChatPage({ params }: { params: Promise<{ contact: string }> }) {
  const resolvedParams = await params
  let contact: string
  try {
    contact = decodeURIComponent(resolvedParams.contact).trim().toLowerCase()
  } catch {
    notFound()
  }
  if (contact.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(contact)) {
    notFound()
  }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rawPhone = user.phone || user.user_metadata?.phone || user.email?.split('@')[0] || ''
  const cleanDigits = rawPhone.replace(/[^\d]/g, '')
  const userEmailId = `${cleanDigits}@pmail.vixiya.com`

  const demoMode = process.env.PHONEMAIL_DEMO_MODE === 'true'
  // Use equality filters so a contact address cannot alter a PostgREST filter expression.
  const demoMessages = demoMode
    ? getDemoEmails(userEmailId).filter((email) =>
        email.sender_address === contact || email.recipient_address === contact,
      )
    : null
  // Demo fixtures are read-only and never touch Supabase message rows.
  if (demoMode && (!demoMessages || demoMessages.length === 0)) notFound()
  let emails: EmailMessage[]
  if (demoMode) {
    emails = demoMessages!
  } else {
    const [sentResult, receivedResult] = await Promise.all([
      supabase
        .from('emails')
        .select('*')
        .eq('sender_address', userEmailId)
        .eq('recipient_address', contact),
      supabase
        .from('emails')
        .select('*')
        .eq('sender_address', contact)
        .eq('recipient_address', userEmailId),
    ])
    emails = [...(sentResult.data || []), ...(receivedResult.data || [])]
      .sort((left, right) => Date.parse(left.created_at) - Date.parse(right.created_at))
  }

  // Mark unread messages from this contact as read
  if (!demoMode) await supabase
    .from('emails')
    .update({ read_status: true })
    .eq('sender_address', contact)
    .eq('recipient_address', userEmailId)
    .eq('read_status', false)

  const typedEmails: EmailMessage[] = (emails || []).map((e) => ({
    id: e.id,
    sender_address: e.sender_address,
    recipient_address: e.recipient_address,
    subject: e.subject || '',
    body_text: e.body_text || '',
    body_html: e.body_html || '',
    created_at: e.created_at,
    read_status: e.read_status,
  }))

  return (
    <SpikeChatView
      contact={contact}
      currentUser={userEmailId}
      initialMessages={typedEmails}
      onSendMessage={sendMessage}
    />
  )
}
