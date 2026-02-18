
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function checkTables() {
    const lines: string[] = []
    function log(msg: string) {
        console.log(msg)
        lines.push(msg)
    }

    log('--- Checking Tables ---')

    // Check Quests
    const { error: questsError } = await supabase.from('quests').select('count').limit(0)
    if (questsError) log('Quests Table: MISSING/ERROR - ' + questsError.message)
    else log('Quests Table: OK')

    // Check Bucket Casts Role
    const { error: roleError } = await supabase.from('bucket_casts').select('role').limit(0)
    if (roleError) log('Bucket Casts Role Column: MISSING/ERROR - ' + roleError.message)
    else log('Bucket Casts Role Column: OK')

    // Write to file for verification
    fs.writeFileSync('check_result.txt', lines.join('\n'))
}

checkTables()
