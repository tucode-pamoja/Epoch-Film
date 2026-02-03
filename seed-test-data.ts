import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function seed() {
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
        console.error('Error fetching users:', userError)
        return
    }

    const testUser = userData.users.find(u => u.email === 'director@epoch.film')
    if (!testUser) {
        console.error('Test user not found!')
        return
    }

    // Delete existing buckets for this user to avoid duplicates and update to Korean
    await supabase.from('buckets').delete().eq('user_id', testUser.id)
    console.log('Cleared existing data for test user.')

    const items = [
        {
            user_id: testUser.id,
            title: '아이슬란드 오로라 헌팅',
            description: '북극광 아래에서 춤추는 빛의 파도를 카메라에 담기.',
            category: 'TRAVEL',
            status: 'ACTIVE',
            is_pinned: true,
            tags: ['오로라', '아이슬란드', '사진']
        },
        {
            user_id: testUser.id,
            title: '개인 사진전 개최',
            description: '에포크 필름으로 기록한 나의 인생을 지역 갤러리에서 전시하기.',
            category: 'GROWTH',
            status: 'ACTIVE',
            is_pinned: false,
            tags: ['예술', '전시회', '커리어']
        },
        {
            user_id: testUser.id,
            title: '마라톤 풀코스 완주',
            description: '42.195km의 한계를 넘어 결승선 통과하기.',
            category: 'GROWTH',
            status: 'ACHIEVED',
            is_pinned: false,
            tags: ['운동', '마라톤']
        }
    ];

    const { error } = await supabase.from('buckets').insert(items)
    if (error) {
        console.error('Error seeding items:', error.message)
    } else {
        console.log('Seeded 3 test items for director@epoch.film')
    }
}

seed()
