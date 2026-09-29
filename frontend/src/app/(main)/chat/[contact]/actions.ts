'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function normalizeEmail(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  const digits = trimmed.replace(/[^\d+]/g, '')
  return `${digits}@pmail.vixiya.com`
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()

  const from = formData.get('from') as string
  const rawTo = formData.get('to') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string
  const bodyHtml = String(formData.get('body_html') || '')

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
    body_html: bodyHtml || `<p>${body.replace(/\n/g, '<br/>')}</p>`,
    read_status: false,
  }))

  const { error } = await supabase.from('emails').insert(records)

  if (error) {
    console.error('Failed to send message internally:', error)
  }

  // Handle external outbound emails via Brevo (Sendinblue)
  const brevoApiKey = process.env.BREVO_API_KEY
  if (brevoApiKey) {
    for (const recipient of recipientList) {
      if (!recipient.endsWith('@pmail.vixiya.com')) {
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': brevoApiKey,
              'content-type': 'application/json',
              'accept': 'application/json'
            },
            body: JSON.stringify({
              sender: { email: from, name: from.split('@')[0] },
              to: [{ email: recipient }],
              subject: subject || 'No Subject',
              htmlContent: bodyHtml || `<p>${body.replace(/\n/g, '<br/>')}</p>`,
              textContent: body
            })
          })
        } catch (err) {
          console.error('Brevo API Error:', err)
        }
      }
    }
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
