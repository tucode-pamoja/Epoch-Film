import { Bucket, BucketStatus } from '@/types'
import { SceneCard } from './SceneCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Loader2 } from 'lucide-react'
import { useState, useOptimistic, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { CompletionModal } from '@/components/archive/CompletionModal'
import { completeBucket } from '@/app/archive/actions'
import { togglePin as togglePinAction } from '@/actions/bucket-actions'
import { toast } from 'sonner'

interface BucketListClientProps {
  buckets: Bucket[]
}

export function BucketListClient({ buckets }: BucketListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [completingBucket, setCompletingBucket] = useState<Bucket | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticBuckets, addOptimisticAction] = useOptimistic(
    buckets,
    (state, action: { type: 'PIN' | 'STATUS', id: string, status?: BucketStatus }) => {
      return state.map((b) => {
        if (b.id !== action.id) return b
        if (action.type === 'PIN') return { ...b, is_pinned: !b.is_pinned }
        if (action.type === 'STATUS') return { ...b, status: action.status || b.status }
        return b
      })
    }
  )

  const categories = ['ALL', 'TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'FOOD', 'OTHER']

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      addOptimisticAction({ type: 'PIN', id })
      const result = await togglePinAction(id, currentStatus)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  const handleCompletionSubmit = async (data: { image?: File; caption: string }) => {
    if (!completingBucket) return

    const formData = new FormData()
    formData.append('caption', data.caption)
    if (data.image) {
      formData.append('image', data.image)
    }

    const bucketId = completingBucket.id
    setCompletingBucket(null)

    startTransition(async () => {
      addOptimisticAction({ type: 'STATUS', id: bucketId, status: 'ACHIEVED' })
      try {
        await completeBucket(bucketId, formData)
        toast.success("Scene achieved successfully!")
      } catch (error) {
        toast.error("Failed to complete scene")
      }
    })
  }

  if (!buckets?.length) {
    // ... same as before ...
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
    ? optimisticBuckets
    : optimisticBuckets.filter(b => b.category?.toUpperCase() === selectedCategory)

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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-void/10 pointer-events-none"
          >
            <div className="bg-void/80 backdrop-blur-xl border border-gold-film/20 rounded-full px-6 py-3 flex items-center gap-3 shadow-huge">
              <Loader2 className="w-4 h-4 text-gold-film animate-spin" />
              <span className="font-mono-technical text-[10px] text-gold-film tracking-[0.3em] uppercase">Processing_Scene...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          filter: isPending ? 'blur(4px) grayscale(0.5)' : 'blur(0px) grayscale(0)',
          opacity: isPending ? 0.7 : 1,
          scale: isPending ? 0.98 : 1
        }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col min-h-0"
      >
        {/* 1. Fixed Category Filtration Hub */}
        <div className="flex-shrink-0 pt-2 pb-10">
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 no-scrollbar justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono-technical transition-all border ${selectedCategory === cat
                  ? 'bg-gold-film border-gold-film text-void shadow-warm scale-105 font-bold'
                  : 'bg-white/5 border-white/5 text-smoke/60 hover:border-white/10 hover:text-celluloid'
                  }`}
              >
                {cat === 'ALL' ? 'ARCHIVE_ALL' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Internally Scrolling Sequence Catalog */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="space-y-20">
            {/* Selected Sequence Section */}
            {pinnedBuckets.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-smoke/40 font-mono-technical">
                  <Star className="w-3 h-3 text-gold-film" fill="currentColor" />
                  <h2 className="text-[10px] tracking-[0.3em] uppercase">Featured Sequences</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {pinnedBuckets.map((bucket) => (
                    <SceneCard
                      key={bucket.id}
                      bucket={bucket}
                      onComplete={() => setCompletingBucket(bucket)}
                      onTogglePin={() => handleTogglePin(bucket.id, bucket.is_pinned)}
                      isPending={isPending}
                    />
                  ))}
                </motion.div>
              </section>
            )}

            {/* All Archive Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-smoke/40 font-mono-technical">
                <div className="w-1.5 h-1.5 rounded-full bg-smoke/20" />
                <h2 className="text-[10px] tracking-[0.3em] uppercase">Archive Catalog</h2>
                <span className="text-gold-film/30 text-[9px]">({filteredBuckets.length} ENTRIES)</span>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {otherBuckets.map((bucket) => (
                  <SceneCard
                    key={bucket.id}
                    bucket={bucket}
                    onComplete={() => setCompletingBucket(bucket)}
                    onTogglePin={() => handleTogglePin(bucket.id, bucket.is_pinned)}
                    isPending={isPending}
                  />
                ))}
              </motion.div>
            </section>
          </div>
        </div>
      </motion.div>

      <CompletionModal
        isOpen={!!completingBucket}
        onClose={() => setCompletingBucket(null)}
        onComplete={handleCompletionSubmit}
        bucketTitle={completingBucket?.title || ''}
      />
    </div>
  )
}
