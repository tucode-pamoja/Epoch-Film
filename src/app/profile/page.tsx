import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserStats, getActiveQuests, getUserBuckets } from '../archive/actions'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { StarField } from '@/components/layout/StarField'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const stats = await getUserStats()
    const quests = await getActiveQuests()
    const buckets = await getUserBuckets()

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    const combinedUser = {
        ...user,
        ...profile,
        // Ensure properties expected by ProfileClient are present if profile is missing (though it shouldn't be)
        nickname: profile?.nickname || user.user_metadata?.full_name || user.email?.split('@')[0],
        profile_image_url: profile?.profile_image_url || user.user_metadata?.avatar_url,
        introduction: profile?.introduction
    }

    const defaultStats = {
        level: 1,
        xp: 0,
        nextLevelXp: 500,
        streak: 0,
        completedDreams: 0,
        activeDreams: 0,
        followerCount: 0,
        followingCount: 0
    }

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-void selection:bg-gold-film/30 flex flex-col">
            <StarField />

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-darkroom to-transparent pointer-events-none z-0" />

            {/* Scrollable Main Area */}
            <div className="relative z-10 flex-1 overflow-y-auto w-full no-scrollbar">
                <main className="w-full min-h-full pb-20">
                    <ProfileClient
                        user={combinedUser}
                        stats={stats || defaultStats}
                        buckets={buckets}
                        quests={quests}
                        currentUserId={user.id}
                    />
                </main>
            </div>
        </div>
    )
}
