'use client'

import { Bucket } from '@/types'
import { BucketCard } from './BucketCard'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface BucketListClientProps {
  buckets: Bucket[]
}

export function BucketListClient({ buckets }: BucketListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  
  const categories = ['ALL', 'TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'FOOD', 'OTHER']

  if (!buckets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
           <Star className="text-white/20" />
        </div>
        <p className="text-white/40 mb-2 font-light">No reels found in your archive.</p>
        <p className="text-sm text-white/20">Start by creating your first reel.</p>
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
    <div className="space-y-12">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
              selectedCategory === cat 
                ? 'bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {/* Selected Sequence Section */}
        {pinnedBuckets.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-white/40 font-medium tracking-wide text-xs uppercase ml-1">
              <Star className="w-3.5 h-3.5" />
              <h2>Selected Sequence</h2>
            </div>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
               {pinnedBuckets.map((bucket) => (
                 <BucketCard key={bucket.id} bucket={bucket} />
               ))}
            </motion.div>
          </section>
        )}

        {/* All Archive Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-white/90 font-semibold text-lg">
              Collection <span className="text-white/30 text-sm ml-2 font-normal">{filteredBuckets.length}</span>
            </h2>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {otherBuckets.map((bucket) => (
              <BucketCard key={bucket.id} bucket={bucket} />
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  )
}
