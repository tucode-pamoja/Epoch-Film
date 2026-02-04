import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BucketDetailClient } from '@/components/archive/BucketDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

// Combined Mock Data for Explore/Demo purposes
const EXPLORE_MOCK_DATA: Record<string, { bucket: any, memories: any[], letters: any[] }> = {
  'exp-1': {
    bucket: {
      id: 'exp-1',
      user_id: 'user-1',
      title: '오로라 헌팅 in 아이슬란드',
      category: 'TRAVEL',
      thumbnail_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7',
      description: '드디어 꿈꾸던 오로라를 봤습니다. 영하 20도의 추위도 잊게 만드는 장관이었어요.',
      status: 'ACHIEVED',
      is_pinned: false,
      importance: 5,
      tags: ['travel', 'iceland', 'aurora'],
      achieved: true,
      achieved_at: '2024-02-01T12:00:00Z',
      target_date: null,
      roadmap: null,
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-02-01T12:00:00Z',
      tickets: 142,
      users: { nickname: 'Dreamer_01', profile_image_url: null }
    },
    memories: [
      { id: 'm1', bucket_id: 'exp-1', media_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7', caption: '레이캬비크 도착! 첫 날부터 심상치 않은 하늘.', created_at: '2024-01-16T10:00:00Z' },
      { id: 'm2', bucket_id: 'exp-1', media_url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae', caption: '영하 20도에서의 기다림 끝에 찾아온 기적.', created_at: '2024-02-01T22:00:00Z' }
    ],
    letters: []
  },
  'exp-2': {
    bucket: {
      id: 'exp-2',
      user_id: 'fd2cf-user-2', // To match AGENT_FD2CF in screenshot
      title: '발리에서 서핑 배우기',
      category: 'HEALTH',
      thumbnail_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f',
      description: '발리 가보자',
      status: 'ACTIVE',
      is_pinned: false,
      importance: 4,
      tags: ['surf', 'bali', 'travel'],
      achieved: false,
      achieved_at: null,
      target_date: '2024-06-01T00:00:00Z',
      roadmap: null,
      created_at: '2026-02-03T12:00:00Z', // Matches Premiere date in screenshot
      updated_at: '2026-02-03T12:00:00Z',
      tickets: 89,
      users: { nickname: 'Waterman_Surf', profile_image_url: null }
    },
    memories: [
      { id: 'm3', bucket_id: 'exp-2', media_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f', caption: '드디어 첫 파도를 잡았습니다!', created_at: '2024-02-15T09:00:00Z' }
    ],
    letters: []
  },
  'exp-3': {
    bucket: {
      id: 'exp-3',
      user_id: 'user-3',
      title: '도쿄 마라톤 완주',
      category: 'HEALTH',
      thumbnail_url: 'https://images.unsplash.com/photo-1552674605-4694559e5bc7',
      description: '42.195km 완주 성공! 포기하고 싶은 순간을 넘어서 해냈습니다.',
      status: 'ACHIEVED',
      is_pinned: false,
      importance: 5,
      tags: ['health', 'marathon', 'achievement'],
      achieved: true,
      achieved_at: '2023-12-05T12:00:00Z',
      target_date: null,
      roadmap: null,
      created_at: '2023-11-20T12:00:00Z',
      updated_at: '2023-12-05T12:00:00Z',
      tickets: 256,
      users: { nickname: 'Runner_Lee', profile_image_url: null }
    },
    memories: [
      { id: 'm4', bucket_id: 'exp-3', media_url: 'https://images.unsplash.com/photo-1552674605-4694559e5bc7', caption: '결승선 통과 1분 전. 심장이 터질 것 같아요.', created_at: '2023-12-05T14:00:00Z' }
    ],
    letters: []
  }
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

  // Handle Mock Data for Explore/Public/Hall of Fame Feed items
  if (id.startsWith('exp-') || id.startsWith('h')) {
    // Map h1, h2, h3 to exp-1, exp-2, exp-3 for demo purposes
    const targetId = id.startsWith('h') ? `exp-${id.slice(1)}` : id
    const mockEntry = EXPLORE_MOCK_DATA[targetId]
    if (!mockEntry) notFound()

    return (
      <BucketDetailClient
        bucket={mockEntry.bucket}
        memories={mockEntry.memories}
        letters={mockEntry.letters}
        currentUserId={user.id}
      />
    )
  }

  // Fetch real bucket details
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

  // Fetch if user has issued ticket
  const { data: ticket } = await supabase
    .from('bucket_tickets')
    .select('*')
    .eq('user_id', user.id)
    .eq('bucket_id', id)
    .single()

  return (
    <BucketDetailClient
      bucket={bucket}
      memories={memories || []}
      letters={letters || []}
      currentUserId={user.id}
      hasIssuedTicket={!!ticket}
    />
  )
}
