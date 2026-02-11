import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function checkSchema() {
    console.log('Checking bucket_casts schema...')
    const { data, error } = await supabase
        .from('bucket_casts')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error selecting from bucket_casts:', error.message)
    } else {
        console.log('Successfully selected from bucket_casts.')
        if (data && data.length > 0) {
            console.log('Sample row:', data[0])
            console.log('Has role column:', 'role' in data[0])
            console.log('Has is_accepted column:', 'is_accepted' in data[0])
        } else {
            console.log('Table is empty, cannot verify columns via select *.')
            // Try to insert a dummy row with the columns to see if it errors
            const { error: insertError } = await supabase
                .from('bucket_casts')
                .select('role')
                .limit(1)

            if (insertError) {
                console.log('Column check failed:', insertError.message)
            } else {
                console.log('Column check passed (select role executed).')
            }
        }
    }
}

checkSchema()
