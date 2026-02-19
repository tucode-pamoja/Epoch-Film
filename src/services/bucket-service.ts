import { SupabaseClient } from '@supabase/supabase-js'

export async function getBucketService(supabase: SupabaseClient, id: string) {
    const { data, error } = await supabase
        .from('buckets')
        .select(`
      *, 
      users!user_id(nickname, profile_image_url), 
      original_bucket:buckets!original_bucket_id(id, title, user_id, users!user_id(nickname, profile_image_url))
    `)
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }

    const { count: remakeCount } = await supabase
        .from('buckets')
        .select('*', { count: 'exact', head: true })
        .eq('original_bucket_id', id)

    return { ...data, remake_count: remakeCount || 0 }
}

export async function createBucketService(
    supabase: SupabaseClient,
    userId: string,
    payload: {
        title: string;
        category: string;
        description?: string;
        importance?: number;
        tags?: string[];
        is_public?: boolean;
        target_date?: string | null;
        is_routine?: boolean;
        routine_frequency?: string | null;
        routine_days?: number[] | null;
    }
) {
    const { data, error } = await supabase.from('buckets').insert({
        user_id: userId,
        ...payload
    }).select().single()

    if (error) throw error
    return data
}

export async function deleteBucketService(supabase: SupabaseClient, userId: string, bucketId: string) {
    // Verify ownership before delete
    const { data: bucket, error: fetchError } = await supabase
        .from('buckets')
        .select('user_id')
        .eq('id', bucketId)
        .single()

    if (fetchError || !bucket) throw new Error('Scene not found')
    if (bucket.user_id !== userId) throw new Error('Forbidden')

    const { error: deleteError } = await supabase
        .from('buckets')
        .delete()
        .eq('id', bucketId)

    if (deleteError) throw deleteError
    return { success: true }
}

export async function togglePinService(supabase: SupabaseClient, bucketId: string, currentStatus: boolean) {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Optional: Check limit of 10 items if pinning
    if (!currentStatus) {
        const { count } = await supabase
            .from('buckets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_pinned', true)

        if (count !== null && count >= 10) {
            throw new Error('Max 10 pinned items allowed')
        }
    }

    const { data, error } = await supabase
        .from('buckets')
        .update({ is_pinned: !currentStatus })
        .eq('id', bucketId)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw error
    return data
}
