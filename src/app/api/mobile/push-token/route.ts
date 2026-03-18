import { createClient } from '@/utils/supabase/server'
import { registerPushToken } from '@/services/push-service'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { token, platform, deviceName } = await req.json()

        if (!token || !platform) {
            return NextResponse.json({ error: 'Token and platform are required' }, { status: 400 })
        }

        const result = await registerPushToken(supabase, token, platform, deviceName)
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
