import { ExploreClient } from '@/components/archive/ExploreClient'
import { StarField } from '@/components/layout/StarField'
import { getPublicBuckets } from '@/app/archive/actions'
import { createClient } from '@/utils/supabase/server'

export default async function ExplorePage() {
    const buckets = await getPublicBuckets()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="relative h-[100dvh] w-full overflow-hidden bg-void no-scrollbar">
            <StarField />

            {/* Cinematic Background Glow */}
            <div className="fixed inset-0 bg-gradient-to-b from-darkroom via-transparent to-void pointer-events-none z-10" />

            <main className="relative z-20 h-full w-full">
                <ExploreClient initialBuckets={buckets} currentUserId={user?.id} />
            </main>
        </div>
    )
}
