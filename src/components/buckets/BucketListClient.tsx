'use client'

import { Bucket } from '@/types'
import { BucketCard } from './BucketCard'
import { motion } from 'framer-motion'
import { Star, Film } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CinematicTimeline } from './CinematicTimeline'
import { CompletionModal } from '@/components/archive/CompletionModal'
import { completeBucket } from '@/app/archive/actions'

interface BucketListClientProps {
  buckets: Bucket[]
}

export function BucketListClient({ buckets }: BucketListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [completingBucket, setCompletingBucket] = useState<Bucket | null>(null)

  const categories = ['ALL', 'TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'FOOD', 'OTHER']

  const handleCompletionSubmit = async (data: { image?: File; caption: string }) => {
    if (!completingBucket) return

    const formData = new FormData()
    formData.append('caption', data.caption)
    if (data.image) {
      formData.append('image', data.image)
    }

    await completeBucket(completingBucket.id, formData)
    setCompletingBucket(null)
  }

  if (!buckets?.length) {
    // ... existing code ...
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
        <div className="relative w-24 h-32 bg-darkroom rounded-sm film-border shadow-deep flex items-center justify-center mb-10 group overflow-hidden">
          <div className="absolute inset-0 bg-gold-film/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Star className="text-gold-film/20 group-hover:text-gold-film/40 transition-colors" size={40} />
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="font-mono-technical text-gold-film tracking-[0.3em] text-[10px]">SCENE 1: THE BEGINNING</div>
          <h2 className="text-3xl font-display text-celluloid">모든 훌륭한 영화는 빈 시나리오에서 시작됩니다.</h2>
          <p className="text-smoke font-light text-sm leading-relaxed">
            아카이브가 현재 비어 있습니다. 당신의 다음 시대의 첫 번째 장면은 무엇인가요?
          </p>
        </div>

        <div className="mt-12">
          <Button href="/archive/new" size="lg" className="rounded-sm px-10">
            🎬 시나리오 작성하기
          </Button>
        </div>

        <p className="mt-16 text-[9px] text-smoke/30 font-light italic tracking-widest max-w-[250px] uppercase">
          "시작하기에 가장 좋은 때는 어제였고, 두 번째로 좋은 때는 지금이다."
        </p>
      </div>
    )
  }

  const filteredBuckets = selectedCategory === 'ALL'
    ? buckets
    : buckets.filter(b => b.category?.toUpperCase() === selectedCategory)

  const pinnedBuckets = filteredBuckets.filter(b => b.is_pinned)
  const otherBuckets = filteredBuckets.filter(b => !b.is_pinned)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="space-y-20">
      {/* Cinematic Timeline Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 font-mono-technical text-smoke ml-1">
          <Film className="w-4 h-4 text-gold-film" />
          <h2 className="text-[10px] tracking-widest uppercase">제작 타임라인 (PRODUCTION_TIMELINE)</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        <CinematicTimeline buckets={buckets} />
      </section>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-sm font-mono-technical transition-all border ${selectedCategory === cat
              ? 'bg-gold-film border-gold-film text-void shadow-warm scale-105'
              : 'bg-white/5 border-white/5 text-smoke hover:border-white/10 hover:text-celluloid'
              }`}
          >
            {cat === 'ALL' ? '전체보기' : cat}
          </button>
        ))}
      </div>

      <div className="space-y-24">
        {/* Selected Sequence Section */}
        {pinnedBuckets.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-smoke font-mono-technical ml-1">
              <Star className="w-4 h-4 text-gold-film" fill="currentColor" />
              <h2>Featured Sequences</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {pinnedBuckets.map((bucket) => (
                <BucketCard
                  key={bucket.id}
                  bucket={bucket}
                  onComplete={() => setCompletingBucket(bucket)}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* All Archive Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between ml-1">
            <div className="flex items-center gap-4 text-smoke font-mono-technical flex-1">
              <div className="w-1.5 h-1.5 rounded-full bg-smoke" />
              <h2 className="text-lg">
                Archive Catalogue
              </h2>
              <span className="text-smoke/40 font-mono-technical text-[10px]">({filteredBuckets.length} ENTRIES)</span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {otherBuckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                onComplete={() => setCompletingBucket(bucket)}
              />
            ))}
          </motion.div>
        </section>
      </div>

      <CompletionModal
        isOpen={!!completingBucket}
        onClose={() => setCompletingBucket(null)}
        onComplete={handleCompletionSubmit}
        bucketTitle={completingBucket?.title || ''}
      />
    </div>
  )
}
