'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PHONE_MAIL_DOMAIN = '@pmail.vixiya.com'
const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i
const MAX_RECIPIENTS = 10
const MAX_BODY_LENGTH = 100_000
const MAX_HTML_LENGTH = 250_000

export type SentMessage = {
  id: string
  sender_address: string
  recipient_address: string
  subject: string
  body_text: string
  body_html: string
  created_at: string
  read_status: boolean
}

export type SendMessageState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string; notice?: string; destination: string; messages: SentMessage[] }

function textField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function normalizeRecipient(raw: string): string | null {
  const value = raw.trim()
  if (!value || value.length > 254) return null

  if (value.includes('@')) {
    const normalized = value.toLowerCase()
    return EMAIL_PATTERN.test(normalized) ? normalized : null
  }

  if (!/^\+?[\d\s().-]+$/.test(value)) return null
  const digits = value.replace(/\D/g, '')
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}${PHONE_MAIL_DOMAIN}`
  if (/^91[6-9]\d{9}$/.test(digits)) return `${digits}${PHONE_MAIL_DOMAIN}`
  return null
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] as string)
}

function plainTextHtml(text: string): string {
  return `<p>${escapeHtml(text).replace(/\r?\n/g, '<br/>')}</p>`
}

export async function sendMessage(
  _previousState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  if (process.env.PHONEMAIL_DEMO_MODE === 'true') {
    return { status: 'error', message: 'Demo preview is read-only. Turn off demo mode to send messages.' }
  }
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user?.phone) {
    return { status: 'error', message: 'Your sign-in expired. Sign in again before sending.' }
  }

  const phoneDigits = user.phone.replace(/\D/g, '')
  if (!/^91[6-9]\d{9}$/.test(phoneDigits)) {
    return { status: 'error', message: 'PhoneMail could not confirm your account address. Sign in again.' }
  }
  const senderAddress = `${phoneDigits}${PHONE_MAIL_DOMAIN}`

  const rawTo = textField(formData, 'to')
  const rawRecipients = rawTo.split(',').map((recipient) => recipient.trim()).filter(Boolean)
  if (rawRecipients.length === 0 || rawRecipients.length > MAX_RECIPIENTS) {
    return { status: 'error', message: `Enter between 1 and ${MAX_RECIPIENTS} recipients.` }
  }

  const recipients = rawRecipients.map(normalizeRecipient)
  if (recipients.some((recipient) => recipient === null)) {
    return { status: 'error', message: 'Enter a valid Indian mobile number or email address for each recipient.' }
  }
  const recipientList = [...new Set(recipients as string[])]

  const subject = textField(formData, 'subject').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 998)
  const body = textField(formData, 'body').trim()
  const bodyHtml = textField(formData, 'body_html')
  if (!body) return { status: 'error', message: 'Write a message before sending.' }
  if (body.length > MAX_BODY_LENGTH || bodyHtml.length > MAX_HTML_LENGTH) {
    return { status: 'error', message: 'This message is too long to send. Shorten it and try again.' }
  }

  const records = recipientList.map((recipient) => ({
    sender_address: senderAddress,
    recipient_address: recipient,
    subject,
    body_text: body,
    body_html: bodyHtml || plainTextHtml(body),
    read_status: false,
  }))

  const { data: savedMessages, error: insertError } = await supabase
    .from('emails')
    .insert(records)
    .select('id, sender_address, recipient_address, subject, body_text, body_html, created_at, read_status')

  if (insertError || !savedMessages) {
    console.error('PhoneMail message save failed:', insertError?.code || 'empty_insert_result')
    return { status: 'error', message: 'PhoneMail could not save this message. Check your connection and try again.' }
  }

  const externalRecipients = recipientList.filter((recipient) => !recipient.endsWith(PHONE_MAIL_DOMAIN))
  const brevoApiKey = process.env.BREVO_API_KEY
  let notice: string | undefined

  if (externalRecipients.length > 0 && !brevoApiKey) {
    notice = 'Saved in PhoneMail. External delivery is not configured yet.'
  } else if (externalRecipients.length > 0 && brevoApiKey) {
    const deliveryResults = await Promise.all(externalRecipients.map(async (recipient) => {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            sender: { email: senderAddress, name: phoneDigits },
            to: [{ email: recipient }],
            subject: subject || 'No Subject',
            htmlContent: plainTextHtml(body),
            textContent: body,
          }),
          signal: AbortSignal.timeout(10_000),
        })
        return response.ok
      } catch {
        return false
      }
    }))

    if (deliveryResults.some((delivered) => !delivered)) {
      console.error('Brevo could not confirm delivery to one or more external recipients.')
      notice = 'Saved in PhoneMail, but external delivery could not be confirmed.'
    }
  }

  for (const recipient of recipientList) {
    revalidatePath(`/chat/${encodeURIComponent(recipient)}`)
  }
  revalidatePath('/')

  const destination = recipientList.length === 1
    ? `/chat/${encodeURIComponent(recipientList[0])}`
    : '/'

  return {
    status: 'success',
    message: 'Message saved.',
    notice,
    destination,
    messages: savedMessages as SentMessage[],
  }
}
