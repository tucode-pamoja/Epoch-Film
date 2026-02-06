import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkBucket() {
    const { data, error } = await supabase.storage.getBucket('memories')
    if (error) {
        console.error('Error fetching bucket:', error)
    } else {
        console.log('Bucket config:', JSON.stringify(data, null, 2))
    }
}

checkBucket()
