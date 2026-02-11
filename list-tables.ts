import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function listTables() {
    // There isn't a direct way to list tables via supabase-js without RPC or querying a system table
    // But we can try to query common names
    const tables = ['users', 'profiles', 'buckets', 'memories', 'bucket_casts', 'follows']
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(0)
        if (error) {
            console.log(`Table [${table}]: Error - ${error.message} (${error.code})`)
        } else {
            console.log(`Table [${table}]: EXISTS`)
        }
    }
}

listTables()
