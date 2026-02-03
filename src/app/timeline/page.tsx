
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CinematicTimeline } from '@/components/buckets/CinematicTimeline'

export default async function TimelinePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: buckets } = await supabase
        .from('buckets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: '2rem 1.5rem' }} className="bg-void overflow-x-hidden selection:bg-gold-film/30">
            <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }} className="relative z-10 space-y-12 pt-8">
                <header className="flex flex-col items-start gap-2 animate-fade-in-up">
                    <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] uppercase text-[10px]">Your History</div>
                    <h1 className="text-4xl sm:text-5xl font-display text-celluloid">
                        Timeline
                    </h1>
                    <p className="text-smoke text-sm">완성된 당신의 필름들을 확인하세요.</p>
                </header>

                <main className="min-h-[50vh] flex items-center">
                    <CinematicTimeline buckets={buckets || []} />
                </main>
            </div>
        </div>
    )
}
