import BucketList from '@/components/buckets/BucketList'
import { Button } from '@/components/ui/Button'
import { Suspense } from 'react'
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-background p-6 sm:p-8 overflow-x-hidden selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
            The Archive
          </h1>
          <p className="mt-2 text-white/40 font-light tracking-wide">
            Your collection of moments and dreams.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/hall-of-fame">
             <Button 
               variant="outline" 
               className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
             >
               <Trophy size={16} className="mr-2" />
               Hall of Fame
             </Button>
          </Link>
          <Button 
            href="/archive/new" 
            className="rounded-full px-6 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.5)] transition-all hover:-translate-y-0.5"
          >
            + New Reel
          </Button>
        </div>
      </header>

      <main className="relative z-10 space-y-12">
        {/* Selected Sequence Section (Placeholder for now, logic can be added to BucketList or separate component) */}
        {/* We will implement Selected Sequence logic inside BucketList to avoid prop drilling complex server data for now, 
            or better, split it. For this step, let's keep it simple and upgrade the layout first. */}
        
        <Suspense fallback={<div className="text-white/40 animate-pulse">Loading archive...</div>}>
          <BucketList />
        </Suspense>
      </main>
    </div>
  )
}
