export type Profile = {
  id: string
  email: string
  nickname: string | null
  profile_image_url: string | null
  mbti: string | null
  xp: number
  level: number
  last_active_at: string
  created_at: string
}

export type BucketStatus = 'DRAFT' | 'ACTIVE' | 'ACHIEVED'
export type BucketCategory = 'TRAVEL' | 'SKILL' | 'HEALTH' | 'CULTURE' | 'FOOD' | 'OTHER'

export interface Bucket {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  status: BucketStatus
  is_pinned: boolean
  importance: number
  tags: string[] | null
  achieved: boolean
  achieved_at: string | null
  target_date: string | null
  roadmap: any | null
  thumbnail_url: string | null
  is_public: boolean
  tickets: number
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  bucket_id: string
  user_id: string
  caption: string | null
  media_url: string | null
  media_type: 'IMAGE' | 'VIDEO'
  location_lat: number | null
  location_lng: number | null
  captured_at: string | null
  created_at: string
}

export interface UserStats {
  level: number
  xp: number
  nextLevelXp: number
  streak: number
  completedDreams: number
  activeDreams: number
}

export interface Quest {
  id: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL'
  title: string
  title_ko?: string
  description: string
  xp_reward: number
  progress: number
  requirement_count: number
  is_completed: boolean
  is_claimed?: boolean
  expires_at?: string
}
