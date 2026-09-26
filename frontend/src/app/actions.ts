'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(data: { display_name?: string, language?: string, theme?: string, aliases?: string[] }) {
  const supabase = await createClient()
  
  // Format data for user_metadata in Supabase
  const metaDataToUpdate: any = {}
  if (data.display_name !== undefined) metaDataToUpdate.display_name = data.display_name
  if (data.language !== undefined) metaDataToUpdate.language = data.language
  if (data.theme !== undefined) metaDataToUpdate.theme = data.theme
  if (data.aliases !== undefined) metaDataToUpdate.aliases = data.aliases

  const { error } = await supabase.auth.updateUser({
    data: metaDataToUpdate
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
