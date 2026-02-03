
import { ExploreClient } from '@/components/archive/ExploreClient'

export default function ExplorePage() {
    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: '2rem 1rem' }} className="bg-void overflow-x-hidden selection:bg-gold-film/30">
            <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }} className="relative z-10 space-y-8 pt-8">
                <header className="flex flex-col items-center text-center animate-fade-in-up">
                    <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] uppercase text-[10px]">Now Screening</div>
                    <h1 className="text-4xl font-display text-celluloid">
                        Explore
                    </h1>
                    <p className="text-smoke text-sm mt-2">다른 드리머들의 이야기에 티켓을 보내세요.</p>
                </header>

                <main>
                    <ExploreClient />
                </main>
            </div>
        </div>
    )
}
