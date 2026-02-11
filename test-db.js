const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
    try {
        console.log('Testing Buckets -> Users join...')
        const { data, error } = await supabase.from('buckets').select('id, users:user_id(nickname)').limit(1)
        if (error) console.log('Users join failed:', error.message)
        else console.log('Users join success:', data)

        console.log('Testing Bucket Casts -> Users join...')
        const { data: casts, error: castsError } = await supabase.from('bucket_casts').select('id, user_id, users:user_id(nickname)').limit(1)
        if (castsError) console.log('Cast Users join failed:', castsError.message)
        else console.log('Cast Users join success:', casts)
    } catch (e) {
        console.log('CRITICAL ERROR:', e.message)
    }
}

test()
