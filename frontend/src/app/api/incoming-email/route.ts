import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { from, to, subject, text, html } = body

    if (!from || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Connect to Supabase using service role to bypass RLS since this is a server webhook
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert the parsed email into our database
    const { error } = await supabase.from('emails').insert({
      sender_address: from.toLowerCase(),
      recipient_address: to.toLowerCase(),
      subject: subject || '(No Subject)',
      body_text: text || '',
      body_html: html || `<p>${text?.replace(/\n/g, '<br/>')}</p>`,
      read_status: false
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Incoming Email Webhook Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
