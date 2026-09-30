import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidPhoneMailSignature, readRequestBodyWithLimit } from '@/lib/webhook-security'

export const runtime = 'nodejs'

const MAX_REQUEST_BYTES = 1_500_000
const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] as string)
}

export async function POST(req: Request) {
  try {
    const rawBody = await readRequestBodyWithLimit(req, MAX_REQUEST_BYTES)
    if (rawBody === null) {
      return NextResponse.json({ error: 'Request is too large' }, { status: 413 })
    }

    const secret = process.env.PHONEMAIL_WEBHOOK_SECRET
    if (!isValidPhoneMailSignature(
      rawBody,
      req.headers.get('x-phonemail-timestamp'),
      req.headers.get('x-phonemail-signature'),
      secret,
    )) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = JSON.parse(rawBody)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const from = typeof payload.from === 'string' ? payload.from.trim().toLowerCase() : ''
    const to = typeof payload.to === 'string' ? payload.to.trim().toLowerCase() : ''
    const subject = typeof payload.subject === 'string' ? payload.subject : ''
    const text = typeof payload.text === 'string' ? payload.text : ''
    const html = typeof payload.html === 'string' ? payload.html : ''

    if (!EMAIL_PATTERN.test(from) || from.length > 254 || !EMAIL_PATTERN.test(to) || to.length > 254 || !to.endsWith('@pmail.vixiya.com')) {
      return NextResponse.json({ error: 'Invalid sender or recipient address' }, { status: 400 })
    }
    if (subject.length > 998 || text.length > 750_000 || html.length > 750_000) {
      return NextResponse.json({ error: 'Message fields exceed the allowed size' }, { status: 413 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Mail ingestion is not configured' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase.from('emails').insert({
      sender_address: from,
      recipient_address: to,
      subject: subject || '(No Subject)',
      body_text: text,
      body_html: html || `<p>${escapeHtml(text).replace(/\r?\n/g, '<br/>')}</p>`,
      read_status: false
    })

    if (error) {
      console.error('Incoming mail database insert failed:', { code: error.code })
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Incoming mail request failed:', err instanceof Error ? err.name : 'UnknownError')
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
