import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function testQuery() {
    const { data, error } = await supabase
        .from('buckets')
        .select(`
            *,
            users(nickname, profile_image_url),
            bucket_casts(id, role, is_accepted, user_id, users(nickname, profile_image_url))
        `)
        .limit(1)

    if (error) {
        console.error('QUERY FAILED:')
        console.error('Message:', error.message)
        console.error('Details:', error.details)
        console.error('Hint:', error.hint)
        console.error('Code:', error.code)
    } else {
        console.log('QUERY SUCCESS!')
        console.log(JSON.stringify(data, null, 2))
    }
}

testQuery()
