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

export interface Bucket {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  status: 'DRAFT' | 'ACTIVE' | 'ACHIEVED'
  is_pinned: boolean
  importance: number
  tags: string[] | null
  created_at: string
  updated_at: string
}
