import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env.local
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, sender, subject } = body

    if (!to || !sender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Extract the raw phone number from the email address
    // e.g., '9876543210@phonemail.com' -> '+19876543210' or similar
    const phoneNumberStr = to.split('@')[0]
    
    // Simple validation/formatting (Assuming US numbers or E.164 format)
    const formattedPhone = phoneNumberStr.startsWith('+') 
      ? phoneNumberStr 
      : `+1${phoneNumberStr}`

    const message = `📧 PhoneMail: You have a new message from ${sender.replace('@phonemail.com', '')}. Subject: ${subject || 'No Subject'}`

    // Send SMS via Twilio
    if (accountSid && authToken && twilioNumber) {
      await client.messages.create({
        body: message,
        from: twilioNumber,
        to: formattedPhone,
      })
      return NextResponse.json({ success: true, message: 'SMS sent successfully' })
    } else {
      console.warn('Twilio credentials missing. SMS simulated:', message)
      return NextResponse.json({ success: true, message: 'Simulated SMS (Missing Twilio Config)' })
    }
  } catch (error) {
    console.error('Error sending Twilio SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
