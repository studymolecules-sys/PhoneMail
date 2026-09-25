'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // For this prototype, we're using email/password mapped to phone_number
  // In a real scenario with free OTP, we'd use signInWithOtp.
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const email = `${phone}@phonemail.com` // mapping phone to a dummy email for Supabase Auth if needed, or if phone auth is enabled, just use phone.
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const email = `${phone}@phonemail.com` 

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            phone_number: phone
        }
    }
  })

  if (error) {
    redirect('/login?message=Could not sign up')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
