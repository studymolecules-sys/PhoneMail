'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function normalizeEmail(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  const digits = trimmed.replace(/[^\d+]/g, '')
  return `${digits}@phonemail.com`
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()

  const from = formData.get('from') as string
  const rawTo = formData.get('to') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  // Handle multiple recipients (Group Email / Group Chat creation per Task.docx)
  const recipientList = rawTo
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean)

  if (recipientList.length === 0) {
    return
  }

  // Insert an email record for each recipient
  const records = recipientList.map((recipient) => ({
    sender_address: from,
    recipient_address: recipient,
    subject: subject || '',
    body_text: body,
    body_html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
    read_status: false,
  }))

  const { error } = await supabase.from('emails').insert(records)

  if (error) {
    console.error('Failed to send message:', error)
  }

  for (const recipient of recipientList) {
    revalidatePath(`/chat/${encodeURIComponent(recipient)}`)
  }
  revalidatePath('/')

  // If single recipient, redirect to that chat thread
  if (recipientList.length === 1) {
    redirect(`/chat/${encodeURIComponent(recipientList[0])}`)
  } else {
    redirect('/')
  }
}
