import { Bucket } from '@/types'
import { clsx } from 'clsx'
import { Star } from 'lucide-react'
import { togglePin } from '@/actions/bucket-actions'
import { Button } from '@/components/ui/Button'

interface BucketCardProps {
  bucket: Bucket
}

export function BucketCard({ bucket }: BucketCardProps) {
  const handlePin = async () => {
    'use server'
    await togglePin(bucket.id, bucket.is_pinned)
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-surface/50 p-6 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.15)] backdrop-blur-sm">
      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
            {bucket.category}
          </span>
          <div className="flex items-center gap-2">
            {bucket.status === 'ACHIEVED' && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20">
                ACHIEVED
              </span>
            )}
            <form action={handlePin}>
               <button 
                type="submit"
                className={clsx(
                  "p-1.5 rounded-full transition-colors hover:bg-white/10 focus:outline-none",
                  bucket.is_pinned ? "text-primary" : "text-white/20 hover:text-white/60"
                )}
                title={bucket.is_pinned ? "Remove from This Year" : "Add to This Year"}
               >
                 <Star size={16} fill={bucket.is_pinned ? "currentColor" : "none"} />
               </button>
            </form>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold leading-tight text-white group-hover:text-primary transition-colors">
          {bucket.title}
        </h3>
        
        {bucket.description && (
          <p className="line-clamp-2 text-sm text-gray-400 font-light leading-relaxed">
            {bucket.description}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-xs text-white/30 font-mono">
          {new Date(bucket.created_at).toLocaleDateString()}
        </span>
        
        {/* Visual indicator for pinned items */}
        {bucket.is_pinned && (
           <span className="text-[10px] text-primary/60 uppercase tracking-wider font-medium flex items-center gap-1">
             ● Selected Sequence
           </span>
        )}
      </div>
    </div>
  )
}
