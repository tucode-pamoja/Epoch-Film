import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createTestUser() {
    const email = 'director@epoch.film'
    const password = 'password123'

    console.log(`Attempting to create user: ${email}`)

    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
    })

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('User already exists. You can log in with:')
        } else {
            console.error('Error creating user:', error.message)
            return
        }
    } else {
        console.log('User created successfully!')
    }

    console.log('-------------------------')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('-------------------------')
}

createTestUser()
