export type Profile = {
  id: string
  email: string
  nickname: string | null
  profile_image_url: string | null
  mbti: string | null
  created_at: string
}

export type BucketStatus = 'DRAFT' | 'ACTIVE' | 'ACHIEVED'
export type BucketCategory = 'TRAVEL' | 'GROWTH' | 'CAREER' | 'Relationship' | 'FOOD' | 'OTHER'

export type Bucket = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: BucketCategory
  status: BucketStatus
  is_pinned: boolean
  target_date: string | null
  importance: number
  created_at: string
  updated_at: string
}
