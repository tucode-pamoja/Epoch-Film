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

            <div className="relative z-10 flex flex-col h-full w-full max-w-[1400px] mx-auto overflow-hidden">
                <header className="flex flex-col items-start gap-1 p-6 sm:px-12 sm:pt-12 sm:pb-4 animate-fade-in-up shrink-0">
                    <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] uppercase text-[10px]">Your History</div>
                    <h1 className="text-4xl sm:text-5xl font-display text-celluloid">
                        Timeline
                    </h1>
                    <p className="text-smoke text-sm">완성된 당신의 필름들을 확인하세요.</p>
                </header>

                <main className="flex-1 flex flex-col justify-center min-h-0 relative">
                    <CinematicTimeline buckets={buckets} />
                </main>

                {/* Footer space to prevent bottom navigation overlap */}
                <div className="h-20 shrink-0 pointer-events-none" />
            </div>
        </div>
    )
}
