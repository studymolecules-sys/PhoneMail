import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import twilio from 'twilio'

export const runtime = 'nodejs'

const PHONE_MAIL_ADDRESS = /^91\d{10}@pmail\.vixiya\.com$/i
const EMAIL_ADDRESS = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.PHONEMAIL_INTERNAL_API_TOKEN
  const authorization = request.headers.get('authorization')
  const providedToken = authorization?.match(/^Bearer ([\x21-\x7e]{32,})$/)?.[1]
  if (!expectedToken || expectedToken.length < 32 || !providedToken) return false

  const expected = Buffer.from(expectedToken)
  const provided = Buffer.from(providedToken)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const senderNumber = process.env.TWILIO_PHONE_NUMBER
  if (!accountSid || !authToken || !senderNumber) {
    return NextResponse.json({ error: 'SMS notifications are not configured' }, { status: 503 })
  }

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid notification' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const to = typeof payload.to === 'string' ? payload.to.trim() : ''
    const sender = typeof payload.sender === 'string' ? payload.sender.trim().toLowerCase() : ''
    const subject = typeof payload.subject === 'string' ? payload.subject.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 100) : ''

    if (!PHONE_MAIL_ADDRESS.test(to) || to.length > 254 || !EMAIL_ADDRESS.test(sender)) {
      return NextResponse.json({ error: 'Invalid notification address' }, { status: 400 })
    }
    if (!/^\+[1-9]\d{7,14}$/.test(senderNumber)) {
      return NextResponse.json({ error: 'SMS sender number is not configured correctly' }, { status: 503 })
    }

    const recipientPhone = `+${to.split('@')[0]}`
    const senderName = sender.length > 60 ? sender.slice(0, 57) + '…' : sender
    const messageBody = `New email from ${senderName}${subject ? `. Subject: ${subject}` : ''}. Open PhoneMail to reply.`.slice(0, 300)

    const client = twilio(accountSid, authToken)
    await client.messages.create({ body: messageBody, from: senderNumber, to: recipientPhone })

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const status = (error as { status?: number }).status
    console.error('Twilio notification failed:', Number.isInteger(status) ? { status } : { kind: 'request_or_provider_error' })
    return NextResponse.json({ error: 'SMS notification failed' }, { status: 502 })
  }
}
