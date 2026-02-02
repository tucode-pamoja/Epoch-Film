'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createBucket(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const importance = Number(formData.get('importance'))
  const description = formData.get('description') as string

  if (!title || !category) {
    // Basic validation, should be handled by client as well
    return
  }

  const { error } = await supabase.from('buckets').insert({
    user_id: user.id,
    title,
    category,
    importance,
    description,
    status: 'ACTIVE', // Default status
    is_pinned: false,
  })

  if (error) {
    console.error('Error creating bucket:', error)
    redirect('/archive/new?error=Failed to create reel')
  }

  revalidatePath('/archive')
  redirect('/archive')
}
