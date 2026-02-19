import { SupabaseClient } from '@supabase/supabase-js'

export async function registerPushToken(
    supabase: SupabaseClient,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceName?: string
) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('push_tokens')
        .upsert({
            user_id: user.id,
            token,
            platform,
            device_name: deviceName,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'token'
        })

    if (error) throw error
    return { success: true }
}

export async function unregisterPushToken(supabase: SupabaseClient, token: string) {
    const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('token', token)

    if (error) throw error
    return { success: true }
}
