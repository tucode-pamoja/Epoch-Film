'use client'

import { motion } from 'framer-motion'
import { Bucket } from '@/types'
import Link from 'next/link'

interface CinematicTimelineProps {
    buckets: Bucket[]
}

export function CinematicTimeline({ buckets }: CinematicTimelineProps) {
    // Only show achieved buckets, sorted by completion date
    const sortedBuckets = [...buckets]
        .filter(b => b.status === 'ACHIEVED')
        .sort((a, b) =>
            new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
        )

    if (sortedBuckets.length === 0) return null

    return (
        <div className="relative w-full overflow-x-auto pb-12 pt-8 no-scrollbar">
            <div className="flex items-start gap-0 min-w-max px-12">
                {sortedBuckets.map((bucket, index) => (
                    <div key={bucket.id} className="flex items-start">
                        {/* Timeline Node */}
                        <div className="relative flex flex-col items-center group">
                            {/* Date Label */}
                            <div className="absolute -top-10 font-mono-technical text-[10px] text-smoke group-hover:text-cyan-film transition-colors h-4">
                                {new Date(bucket.updated_at || bucket.created_at).getFullYear()}.{new Date(bucket.updated_at || bucket.created_at).getMonth() + 1}
                            </div>

                            {/* Connector Line */}
                            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-cyan-film/40" />

                            {/* Point */}
                            <div className="relative">
                                <Link href={`/archive/${bucket.id}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.2 }}
                                        className="w-4 h-4 rounded-full border-2 border-cyan-film bg-cyan-film shadow-[0_0_15px_rgba(78,205,196,0.6)] transition-all cursor-pointer z-10 relative"
                                    />
                                </Link>
                            </div>

                            {/* Title Card (Vertical) */}
                            <div className="mt-6 w-40 transform origin-top-left flex flex-col gap-2">
                                <Link href={`/archive/${bucket.id}`} className="block group/text">
                                    <h4 className="text-sm font-display text-cyan-film transition-colors line-clamp-2 group-hover/text:text-white">
                                        {bucket.title}
                                    </h4>
                                    <div className="mt-1 font-mono-technical text-[8px] text-smoke uppercase tracking-widest">
                                        {bucket.category}
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Connecting Bar between nodes */}
                        {index < sortedBuckets.length - 1 && (
                            <div className="w-36 mt-[62px] h-px bg-gradient-to-r from-cyan-film/40 to-white/5" />
                        )}
                    </div>
                ))}

                {/* End of Timeline */}
                <div className="flex items-center">
                    <div className="w-32 mt-[60px] h-px bg-gradient-to-r from-cyan-film/40 to-transparent" />
                    <div className="mt-[60px] ml-4 font-mono-technical text-[10px] text-smoke italic">CONTINUING...</div>
                </div>
            </div>
        </div>
    )
}
