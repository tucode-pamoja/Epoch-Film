import BucketList from '@/components/buckets/BucketList'
import { Button } from '@/components/ui/Button'
import { Suspense } from 'react'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { StarField } from '@/components/layout/StarField'

export default async function ArchivePage() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-void selection:bg-gold-film/30 flex flex-col">
      <StarField />

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-darkroom to-transparent pointer-events-none z-0" />
      <div className="fixed top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gold-film/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Main Workspace - No Vertical Scroll */}
      <div className="relative z-10 flex-1 overflow-hidden px-6 sm:px-12 pt-12 sm:pt-16">
        <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <section className="flex-1 overflow-hidden">
            <Suspense fallback={<div className="text-smoke font-mono-technical animate-pulse text-center py-20">데이터를 불러오는 중... (LOADING_SEQUENCES)</div>}>
              <BucketList />
            </Suspense>
          </section>

          <footer className="py-8 border-t border-white/5 text-center shrink-0">
            <p className="text-[10px] font-mono-technical text-smoke/30 tracking-[0.3em] uppercase">
              End of Production Workspace
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
