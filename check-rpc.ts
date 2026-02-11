import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function listRPC() {
    console.log('Listing RPC functions...')
    // This is tricky without direct SQL access, usually we can't inspect schema easily via client unless configured.
    // But we can try to call a known system RPC if available or check openapi spec if accessible.
    // For now, let's just try to call a dummy function to see error.
    const { data, error } = await supabase.rpc('get_schema_info', {})
    if (error) console.log('RPC get_schema_info failed:', error.message)
    else console.log('RPC get_schema_info success:', data)
}

listRPC()
