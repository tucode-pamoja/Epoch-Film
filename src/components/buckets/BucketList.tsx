import { createClient } from '@/utils/supabase/server'
import { BucketCard } from './BucketCard'
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

  if (!buckets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
        <p>No buckets found in your archive.</p>
        <p className="text-sm">Start by creating your first reel.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {buckets.map((bucket) => (
        <BucketCard key={bucket.id} bucket={bucket} />
      ))}
    </div>
  )
}
