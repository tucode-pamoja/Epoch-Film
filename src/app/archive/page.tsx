import BucketList from '@/components/buckets/BucketList'
import { Button } from '@/components/ui/Button'

import { Suspense } from 'react'

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">The Archive</h1>
          <p className="mt-1 text-gray-400">Capture your epoch, Develop your dream.</p>
        </div>
        <Button href="/archive/new">New Reel</Button>
      </header>

      <main>
        <Suspense fallback={<div className="text-white">Loading archive...</div>}>
          <BucketList />
        </Suspense>
      </main>
    </div>
  )
}
