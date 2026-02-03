import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BucketDetailClient } from '@/components/archive/BucketDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BucketDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch bucket details
  const { data: bucket, error } = await supabase
    .from('buckets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !bucket) {
    notFound()
  }

  // Fetch memories (Check-in shots)
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('bucket_id', id)
    .order('created_at', { ascending: true }) // Ascending for timeline

  // Fetch letters (Time Capsule)
  const { data: letters } = await supabase
    .from('letters')
    .select('*')
    .eq('bucket_id', id)
    .order('created_at', { ascending: true })

  return (
    <BucketDetailClient
      bucket={bucket}
      memories={memories || []}
      letters={letters || []}
      currentUserId={user.id}
    />
  )
}
