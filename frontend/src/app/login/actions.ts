'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendOtp(formData: FormData) {
  const supabase = await createClient()
  const phone = formData.get('phone') as string

  const { error } = await supabase.auth.signInWithOtp({
    phone,
  })

  if (error) {
    redirect(`/login?message=Could not send OTP: ${error.message}`)
  }

  // Redirect to the same page but with a query parameter indicating OTP was sent
  redirect(`/login?phone=${encodeURIComponent(phone)}&step=verify`)
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient()
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  })

  if (error) {
    redirect(`/login?phone=${encodeURIComponent(phone)}&step=verify&message=Invalid OTP. Please try again.`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
