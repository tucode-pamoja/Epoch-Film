'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function togglePin(bucketId: string, currentStatus: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // Optional: Check limit of 10 items if pinning
  if (!currentStatus) {
    const { count } = await supabase
      .from('buckets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_pinned', true)

    if (count !== null && count >= 10) {
      // Could throw error or handle UI feedback
      console.warn('Max pinned items reached')
      return { error: 'Max 10 pinned items allowed' }
    }
  }

  const { error } = await supabase
    .from('buckets')
    .update({ is_pinned: !currentStatus })
    .eq('id', bucketId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error toggling pin:', error)
    return { error: 'Failed to update' }
  }

  revalidatePath('/archive')
}
