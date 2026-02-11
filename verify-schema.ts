import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function verifySchema() {
    console.log('Verifying schema updates...')

    // Check quests table
    const { count: questsCount, error: questsError } = await supabase.from('quests').select('count').limit(1)
    if (questsError) console.log('Quests Table: FAILED -', questsError.message)
    else console.log('Quests Table: OK')

    // Check bucket_casts role column
    // Try inserting a dummy cast with role to check constraint, or just select if we have data.
    // We can't select columns directly if table empty easily.
    // Try to update a nonexistent row with role column
    const { error: roleError } = await supabase
        .from('bucket_casts')
        .update({ role: 'ACTOR' })
        .eq('id', '00000000-0000-0000-0000-000000000000')

    if (roleError && roleError.code !== 'PGRST116') { // PGRST116 is just no rows found which is fine
        console.log('Bucket Casts Role: ERROR -', roleError.message)
    } else {
        console.log('Bucket Casts Role: LIKELY OK (Update executed without schema error)')
    }
}

verifySchema()
