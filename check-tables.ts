import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function checkTables() {
    console.log('--- Checking Tables ---')

    // Check Quests
    const { error: questsError } = await supabase.from('quests').select('count').limit(0)
    if (questsError) console.log('Quests Table: MISSING/ERROR -', questsError.message)
    else console.log('Quests Table: OK')

    // Check Bucket Casts Role
    const { error: roleError } = await supabase.from('bucket_casts').select('role').limit(0)
    if (roleError) console.log('Bucket Casts Role Column: MISSING/ERROR -', roleError.message)
    else console.log('Bucket Casts Role Column: OK')
}

checkTables()
