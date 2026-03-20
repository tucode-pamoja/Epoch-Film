import { SupabaseClient } from '@supabase/supabase-js';

export async function issueTicketService(supabase: SupabaseClient, bucketId: string, userId: string) {
    const { data, error } = await supabase.rpc('issue_bucket_ticket', {
        p_bucket_id: bucketId,
        p_user_id: userId
    });
    if (error) throw error;
    return data;
}

export async function checkFollowingStatus(supabase: SupabaseClient, followerId: string, followingId: string) {
    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();
    if (error || !data) return false;
    return true;
}

export async function followDirectorService(supabase: SupabaseClient, followerId: string, followingId: string) {
    const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
    if (error && error.code !== '23505') throw error;
    return { success: true };
}

export async function unfollowDirectorService(supabase: SupabaseClient, followerId: string, followingId: string) {
    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
    if (error) throw error;
    return { success: true };
}

export async function remakeBucketService(supabase: SupabaseClient, bucketId: string, userId: string) {
    const { data: original, error: fetchError } = await supabase
        .from('buckets')
        .select('*')
        .eq('id', bucketId)
        .single();
    if (fetchError || !original) throw new Error('Original scene not found');

    const { data: newBucket, error: createError } = await supabase
        .from('buckets')
        .insert({
            user_id: userId,
            title: original.title,
            description: original.description,
            category: original.category,
            status: 'ACTIVE',
            is_pinned: false,
            importance: original.importance,
            tags: original.tags,
            thumbnail_url: original.thumbnail_url,
            is_public: true,
            original_bucket_id: original.id,
            is_routine: original.is_routine,
            routine_frequency: original.routine_frequency,
            routine_days: original.routine_days,
            tickets: 0
        })
        .select()
        .single();
    if (createError) throw createError;
    return newBucket;
}
