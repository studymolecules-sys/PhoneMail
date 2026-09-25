'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  
  const from = formData.get('from') as string
  const to = formData.get('to') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  // In a real app, this is where we'd also trigger Resend/Nodemailer to actually email
  // the recipient if they aren't a phonemail user, but since this is a closed ecosystem
  // for the demo, we just insert into the database.

  const { error } = await supabase.from('emails').insert([
    {
      sender_address: from,
      recipient_address: to,
      subject: subject || '',
      body_text: body,
      body_html: `<p>${body}</p>`,
      read_status: false,
    }
  ])

  if (error) {
    console.error('Failed to send message:', error)
  }

  revalidatePath(`/chat/${to}`)
  revalidatePath('/')
}
