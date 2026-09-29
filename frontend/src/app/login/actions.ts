'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function cleanPhoneNumber(raw: string): string {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  return digits ? '+' + digits : ''
}

function phoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length
}

function loginUrl(phone: string, step: 'phone' | 'verify', message?: string): string {
  const params = new URLSearchParams({ phone, step })
  if (message) params.set('message', message)
  return '/login?' + params.toString()
}

export async function sendOtp(formData: FormData) {
  const phone = cleanPhoneNumber(String(formData.get('phone') || ''))
  if (phoneDigits(phone) < 8 || phoneDigits(phone) > 15) {
    redirect(loginUrl(phone, 'phone', 'Enter a valid phone number with its country code.'))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ phone })

  if (error) {
    console.warn('PhoneMail could not send a sign-in code:', error.message)
    redirect(loginUrl(phone, 'phone', 'We could not send a code. Check the number and try again.'))
  }

  redirect(loginUrl(phone, 'verify'))
}

export async function verifyOtp(formData: FormData) {
  const phone = cleanPhoneNumber(String(formData.get('phone') || ''))
  const otp = String(formData.get('otp') || '').trim()

  if (phoneDigits(phone) < 10 || phoneDigits(phone) > 15) {
    redirect(loginUrl(phone, 'phone', 'Enter a valid phone number, including its country code.'))
  }
  if (!/^\d{6}$/.test(otp)) {
    redirect(loginUrl(phone, 'verify', 'Enter the six-digit code sent to your phone.'))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })

  if (error) {
    console.warn('PhoneMail sign-in code verification failed:', error.message)
    redirect(loginUrl(phone, 'verify', 'That code is invalid or expired. Request a new code and try again.'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
