'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function awardBadge(badgeType: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // Check if already awarded
  const { data: existing } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .eq('badge_type', badgeType)
    .single()

  if (existing) return

  // Award badge
  await supabase.from('achievements').insert({
    user_id: user.id,
    badge_type: badgeType,
  })

  revalidatePath('/hall-of-fame')
  // Redirect to show the celebration modal
  // Note: Since this is a server action, returning data to client to handle redirect is often better for modals,
  // but simpler here effectively triggers the modal if the page refreshes with the param.
  // Actually, we can use `redirect` from next/navigation but it throws an error that pauses execution.
  // So we will just revalidate. 
  // Wait, the client calling this simulation needs to know.
  // Let's modify the return type or just use redirect which works in server actions.
}

import { redirect } from 'next/navigation'

// We need to export a new wrapper or modify existing to redirect
export async function simulateAwardBadge(badgeType: string) {
   await awardBadge(badgeType)
   redirect(`/hall-of-fame?unlocked=${badgeType}`)
}
