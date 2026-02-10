import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getUserStats, getUserBuckets, getPublicUserProfile } from '../../archive/actions'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { StarField } from '@/components/layout/StarField'

type Props = {
    params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // If viewing own profile via ID, redirect to canonical /profile
    // TEMPORARILY DISABLED FOR TESTING: Allows viewing own profile as "other user"
    // if (currentUser && currentUser.id === id) {
    //     redirect('/profile')
    // }

    // Fetch public profile
    const targetUser = await getPublicUserProfile(id)
    if (!targetUser) {
        notFound()
    }

    const stats = await getUserStats(id)
    const buckets = await getUserBuckets(id)

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
                        user={targetUser}
                        stats={stats || defaultStats}
                        buckets={buckets}
                        quests={[]} // Hide quests for other users
                        isOwnProfile={false}
                        currentUserId={currentUser?.id}
                    />
                </main>
            </div>
        </div>
    )
}
