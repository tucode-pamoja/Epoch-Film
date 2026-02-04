import { HallOfFameClient } from '@/components/archive/HallOfFameClient'
import { getHallOfFameBuckets } from '@/app/archive/actions'

export default async function HallOfFamePage() {
  const buckets = await getHallOfFameBuckets()

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '2rem 1.5rem' }} className="bg-void overflow-x-hidden selection:bg-gold-film/30">
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }} className="relative z-10 space-y-12 pt-8">
        <header className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] uppercase text-[10px] mb-2">The Oscars of Dreams</div>
          <h1 className="text-4xl sm:text-5xl font-display text-celluloid mb-3">Hall of Fame</h1>
          <p className="text-smoke text-sm font-light">이달의 가장 많은 티켓을 받은 걸작들을 만나보세요.</p>
        </header>

        <main>
          <HallOfFameClient initialBuckets={buckets} />
        </main>
      </div>
    </div>
  )
}
