'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const SUPPORTED_LANGUAGES = new Set(['en', 'hi', 'ta', 'es', 'fr'])
const ALIAS_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?@pmail\.vixiya\.com$/

export async function updateUserProfile(input: unknown) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Sign in again before saving settings.' }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { success: false, error: 'The settings could not be validated.' }
  }

  const data = input as Record<string, unknown>
  const metaDataToUpdate: Record<string, string | string[]> = {}

  if ('display_name' in data) {
    if (typeof data.display_name !== 'string') return { success: false, error: 'Enter a valid display name.' }
    const displayName = data.display_name.trim()
    if (displayName.length > 60 || /[\u0000-\u001f\u007f]/.test(displayName)) {
      return { success: false, error: 'Display names must be 60 characters or fewer.' }
    }
    metaDataToUpdate.display_name = displayName
  }

  if ('language' in data) {
    if (typeof data.language !== 'string' || !SUPPORTED_LANGUAGES.has(data.language)) {
      return { success: false, error: 'Choose a supported language.' }
    }
    metaDataToUpdate.language = data.language
  }

  if ('theme' in data) {
    if (data.theme !== 'light' && data.theme !== 'dark') {
      return { success: false, error: 'Choose a supported appearance.' }
    }
    metaDataToUpdate.theme = data.theme
  }

  if ('aliases' in data) {
    if (!Array.isArray(data.aliases) || data.aliases.length > 5 || data.aliases.some(
      (alias) => typeof alias !== 'string' || alias.length > 80 || !ALIAS_PATTERN.test(alias)
    )) {
      return { success: false, error: 'Aliases must be valid PhoneMail addresses (up to five).' }
    }
    metaDataToUpdate.aliases = [...new Set(data.aliases as string[])]
  }

  if (Object.keys(metaDataToUpdate).length === 0) {
    return { success: false, error: 'There are no valid settings to save.' }
  }

  const { error } = await supabase.auth.updateUser({
    data: metaDataToUpdate
  })

  if (error) {
    console.error('PhoneMail settings update failed:', error.code || 'unknown_error')
    return { success: false, error: 'PhoneMail could not sync these settings right now.' }
  }

  revalidatePath('/')
  return { success: true }
}
