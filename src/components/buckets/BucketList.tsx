import { createClient } from '@/utils/supabase/server'
import { BucketListClient } from './BucketListClient'
import { redirect } from 'next/navigation'

export default async function BucketList() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: buckets } = await supabase
    .from('buckets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <BucketListClient buckets={buckets || []} />
}
