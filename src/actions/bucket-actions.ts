'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { togglePinService } from '@/services/bucket-service'

export async function togglePin(bucketId: string, currentStatus: boolean) {
  const supabase = await createClient()

  try {
    await togglePinService(supabase, bucketId, currentStatus)
    revalidatePath('/archive')
    return { success: true }
  } catch (error: any) {
    console.error('Error toggling pin:', error)
    return { error: error.message || 'Failed to update' }
  }
}
