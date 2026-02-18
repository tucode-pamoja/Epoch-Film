export type Profile = {
  id: string
  email: string
  nickname: string | null
  profile_image_url: string | null
  introduction: string | null
  mbti: string | null
  xp: number
  level: number
  daily_tickets: number
  last_ticket_reset_at: string
  last_active_at: string
  settings: {
    notifications: {
      email: boolean
      push: boolean
    }
    privacy: {
      public_profile: boolean
    }
    theme: 'dark' | 'light' | 'cinematic'
  } | null
  created_at: string
  updated_at: string
}

export type BucketStatus = 'DRAFT' | 'ACTIVE' | 'ACHIEVED'
export type BucketCategory = 'TRAVEL' | 'GROWTH' | 'CAREER' | 'LOVE' | 'HEALTH' | 'CULTURE' | 'FOOD' | 'OTHER'

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
  is_routine: boolean
  routine_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null
  routine_days: number[] | null
  routine_last_completed_at: string | null
  created_at: string
  updated_at: string
  original_bucket_id: string | null
  remake_count?: number
  bucket_casts?: BucketCast[] | null
  users?: Profile // Joined relation
  original_bucket?: {
    id: string
    title: string
    user_id: string
    users?: {
      nickname: string | null
      profile_image_url: string | null
    }
  } | null
}

export type CastRole = 'CO_DIRECTOR' | 'ACTOR' | 'GUEST'
export type CastStatus = 'pending' | 'accepted' | 'rejected' | 'changes_requested'

export interface BucketCast {
  id: string
  bucket_id: string
  user_id: string
  role: CastRole | null
  is_accepted: boolean
  status: CastStatus
  message: string | null
  created_at: string
  updated_at: string
  user?: Profile // Joined relation
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
  users?: {
    nickname: string | null
    profile_image_url: string | null
  }
}

export interface UserStats {
  level: number
  xp: number
  nextLevelXp: number
  streak: number
  completedDreams: number
  activeDreams: number
  followerCount: number
  followingCount: number
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
