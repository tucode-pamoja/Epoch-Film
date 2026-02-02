'use client'

import { Bucket } from '@/types'
import { clsx } from 'clsx'
import { Star } from 'lucide-react'
import { togglePin } from '@/actions/bucket-actions'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

interface BucketCardProps {
  bucket: Bucket
}

export function BucketCard({ bucket }: BucketCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    await togglePin(bucket.id, bucket.is_pinned)
  }

  return (
    <Link href={`/archive/${bucket.id}`} className="block outline-none">
      <motion.div
        layoutId={`card-${bucket.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.03] p-6 backdrop-blur-md transition-colors hover:bg-white/[0.06] border border-white/5 cursor-pointer h-full"
      >
        {/* Subtle Glow Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50 ring-1 ring-inset ring-white/10">
              {bucket.category}
            </span>
            
            <button
              onClick={handlePin}
              className="rounded-full p-2 text-white/20 transition-all hover:bg-white/10 hover:text-primary active:scale-90 z-20"
              title={bucket.is_pinned ? "Unpin" : "Pin to Top"}
            >
              <Star
                size={18}
                className={clsx(
                  "transition-all", 
                  bucket.is_pinned ? "fill-primary text-primary" : "fill-transparent"
                )} 
              />
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold leading-snug text-white/90 group-hover:text-white transition-colors">
              {bucket.title}
            </h3>
            {bucket.description && (
              <p className="mt-2 text-sm text-white/40 line-clamp-2 leading-relaxed">
                {bucket.description}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span>{new Date(bucket.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          
          {bucket.status === 'ACHIEVED' && (
            <span className="text-xs font-bold text-primary/80">COMPLETED</span>
          )}
        </div>

        {bucket.tags && bucket.tags.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-2">
            {bucket.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-white/30">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  )
}
