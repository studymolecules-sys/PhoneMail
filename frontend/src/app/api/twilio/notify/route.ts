import { NextResponse } from 'next/server'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, sender, subject } = body

    if (!to || !sender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract the actual phone number from the recipient address (e.g. 9279581387@phonemail.com -> 9279581387)
    const phoneNumber = to.split('@')[0]
    
    // We append the + to ensure it is in E.164 format for Twilio (assuming the user registered without the +)
    // In a real app we'd validate the country code strictly.
    const twilioFormattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`

    // Format a clean subject
    const safeSubject = subject ? `Subject: ${subject}` : '(No Subject)'
    const senderDisplay = sender.replace('@phonemail.com', '')

    const messageBody = `New email from ${senderDisplay}. ${safeSubject}. Open PhoneMail to reply.`

    await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: twilioFormattedNumber,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Twilio notification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
