'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { CinematicTimeline } from '@/components/buckets/CinematicTimeline'
import { StarField } from '@/components/layout/StarField'
import { useState } from 'react'
import { Bucket } from '@/types'

export default function TimelinePage() {
    const router = useRouter()
    const [buckets, setBuckets] = useState<Bucket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Lock body scroll for this page
        document.body.style.overflow = 'hidden'

        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('buckets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setBuckets(data || [])
            setLoading(false)
        }

        fetchData()

        return () => {
            document.body.style.overflow = ''
        }
    }, [router])

    if (loading) return null

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-void selection:bg-gold-film/30 flex flex-col pt-safe">
            <StarField />

            <div className="relative z-10 flex flex-col h-full w-full max-w-[1400px] mx-auto overflow-hidden pb-12">
                <header className="flex flex-col items-start gap-0 px-6 pt-2 pb-0 shrink-0 animate-fade-in-up">
                    <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] uppercase text-[10px]">Your History</div>
                    <h1 className="text-xl sm:text-2xl font-display text-celluloid">
                        Timeline
                    </h1>
                </header>

                <main className="flex-1 flex flex-col justify-center min-h-0 relative overflow-hidden">
                    <CinematicTimeline buckets={buckets} />
                </main>
            </div>
        </div>
    )
}
