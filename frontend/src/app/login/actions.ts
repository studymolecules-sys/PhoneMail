'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const PENDING_PHONE_COOKIE = 'pm_pending_phone'
const PENDING_PHONE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/login',
  maxAge: 10 * 60,
}

function cleanPhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return ''
}

function phoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length
}

function loginUrl(step: 'phone' | 'verify', message?: string): string {
  const params = new URLSearchParams({ step })
  if (message) params.set('message', message)
  return '/login?' + params.toString()
}

function sendErrorMessage(error: { message: string; status?: number; code?: string }): string {
  if (error.status === 429) return 'Too many code requests. Wait a minute, then try again.'
  if (!error.status || error.status === 0 || /fetch failed|network/i.test(error.message)) {
    return 'PhoneMail could not reach sign-in. Check your connection and try again.'
  }
  if (/phone|sms|provider/i.test(error.message)) {
    return 'The number could not receive a code right now. Check it and try again shortly.'
  }
  return 'We could not send a code. Check the number and try again.'
}

function verifyErrorMessage(error: { message: string; status?: number }): string {
  if (error.status === 429) return 'Too many attempts. Wait a minute before trying again.'
  if (!error.status || error.status === 0 || /fetch failed|network/i.test(error.message)) {
    return 'PhoneMail could not reach sign-in. Check your connection and try again.'
  }
  return 'That code is invalid or expired. Request a new code and try again.'
}

export async function sendOtp(formData: FormData) {
  const cookieStore = await cookies()
  const isResend = formData.get('intent') === 'resend'
  const phone = isResend
    ? cleanPhoneNumber(cookieStore.get(PENDING_PHONE_COOKIE)?.value || '')
    : cleanPhoneNumber(String(formData.get('phone') || ''))
  if (phoneDigits(phone) !== 12 || !phone.startsWith('+91')) {
    redirect(loginUrl('phone', 'Enter a valid 10-digit Indian mobile number.'))
  }

  cookieStore.set(PENDING_PHONE_COOKIE, phone, PENDING_PHONE_COOKIE_OPTIONS)
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ phone })

  if (error) {
    console.error('PhoneMail OTP request failed:', { name: error.name, status: error.status, code: error.code, message: error.message })
    redirect(loginUrl('phone', sendErrorMessage(error)))
  }

  redirect(loginUrl('verify'))
}

export async function verifyOtp(formData: FormData) {
  const cookieStore = await cookies()
  const phone = cleanPhoneNumber(cookieStore.get(PENDING_PHONE_COOKIE)?.value || '')
  const otp = String(formData.get('otp') || '').trim()

  if (phoneDigits(phone) !== 12 || !phone.startsWith('+91')) {
    cookieStore.delete(PENDING_PHONE_COOKIE)
    redirect(loginUrl('phone', 'Your sign-in step expired. Enter your number to request a new code.'))
  }
  if (!/^\d{6}$/.test(otp)) {
    redirect(loginUrl('verify', 'Enter the six-digit code sent to your phone.'))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })

  if (error) {
    console.error('PhoneMail OTP verification failed:', { name: error.name, status: error.status, code: error.code, message: error.message })
    redirect(loginUrl('verify', verifyErrorMessage(error)))
  }

  cookieStore.delete(PENDING_PHONE_COOKIE)
  revalidatePath('/', 'layout')
  redirect('/')
}
