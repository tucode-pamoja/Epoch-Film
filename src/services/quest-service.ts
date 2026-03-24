import { SupabaseClient } from '@supabase/supabase-js';

export async function claimQuestReward(supabase: SupabaseClient, questId: string, userId: string) {
    // 1. Get Quest Info
    // (In a real DB we'd have a quests table, for now we simulate with logic)
    // We'll increment the user's XP in the profiles table.
    
    // For demo, we'll assume a fixed reward of 100 XP
    const rewardXp = 100;

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

    if (profileError) throw profileError;

    let newXp = (profile.xp || 0) + rewardXp;
    let newLevel = profile.level || 1;

    // Simple level up logic: each level needs level * 1000 XP
    const nextLevelXp = newLevel * 1000;
    if (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({
            xp: newXp,
            level: newLevel,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, newXp, newLevel };
}

export async function fetchUserNotifications(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from('notifications') // Assuming this table exists or we'll mock it
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    // If table doesn't exist, return empty
    if (error) return [];
    return data;
}
