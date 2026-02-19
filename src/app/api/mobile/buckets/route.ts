import { createClient } from '@/utils/supabase/server'
import { createBucketService } from '@/services/bucket-service'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const payload = await req.json()
        const bucket = await createBucketService(supabase, user.id, payload)
        return NextResponse.json(bucket)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
