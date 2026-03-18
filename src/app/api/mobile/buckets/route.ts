import { createClient } from '@/utils/supabase/server'
import { createBucketService } from '@/services/bucket-service'
import { NextResponse } from 'next/server'


export async function GET(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const isPinned = searchParams.get('isPinned') === 'true' ? true : searchParams.get('isPinned') === 'false' ? false : undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    try {
        const { listBucketsService } = await import('@/services/bucket-service')
        const buckets = await listBucketsService(supabase, user.id, {
            category,
            isPinned,
            limit,
            offset
        })
        return NextResponse.json(buckets)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

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

