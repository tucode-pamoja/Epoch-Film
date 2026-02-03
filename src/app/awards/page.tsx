
import { AwardsClient } from '@/components/archive/AwardsClient'

export default function AwardsPage() {
    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: '2rem 1.5rem' }} className="bg-void overflow-x-hidden selection:bg-gold-film/30">
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }} className="relative z-10 space-y-12 pt-8">
                <header className="flex flex-col items-center text-center animate-fade-in-up">
                    <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] uppercase text-[10px] mb-2">My Achievements</div>
                    <h1 className="text-4xl sm:text-5xl font-display text-celluloid mb-3">Awards</h1>
                    <p className="text-smoke text-sm font-light">당신이 달성한 영광의 순간들입니다.</p>
                </header>

                <main>
                    <AwardsClient />
                </main>
            </div>
        </div>
    )
}
