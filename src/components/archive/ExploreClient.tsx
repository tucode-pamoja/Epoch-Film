'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, User, PlayCircle, Trophy, ChevronDown, Film } from 'lucide-react'
import { BucketCard } from '@/components/buckets/BucketCard'

interface ExploreClientProps {
    initialBuckets: any[]
}

export function ExploreClient({ initialBuckets }: ExploreClientProps) {
    const [activeTab, setActiveTab] = useState<'ACHIEVED' | 'ACTIVE'>('ACHIEVED')
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const originalHtmlOverflow = document.documentElement.style.overflow
        const originalBodyOverflow = document.body.style.overflow

        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow
            document.body.style.overflow = originalBodyOverflow
        }
    }, [])

    const filteredFeed = initialBuckets.filter(item => item.status === activeTab)

    const tabs = [
        { id: 'ACHIEVED', label: '달성한 목표', icon: Trophy },
        { id: 'ACTIVE', label: '계획중인 목표', icon: PlayCircle }
    ]

    return (
        <div className="h-full w-full flex flex-col bg-void text-white">
            {/* 1. Interactive Navigation HUD - Proximity-based visibility */}
            <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pointer-events-none h-32 group/nav">
                {/* Hit Area Trigger */}
                <div className="absolute inset-0 pointer-events-auto" />

                <div className="relative flex flex-col items-center gap-4 transition-all duration-700 opacity-0 -translate-y-4 group-hover/nav:opacity-100 group-hover/nav:translate-y-0 pointer-events-auto">
                    {/* Tab Selector */}
                    <div className="flex items-center gap-1 p-1 bg-void/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-display transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-gold-film text-velvet shadow-warm font-bold'
                                        : 'text-smoke hover:text-white'
                                    }
                                `}
                            >
                                <tab.icon size={13} />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Main Snap Feed */}
            <div
                ref={scrollContainerRef}
                className="flex-1 w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                    >
                        {filteredFeed.map((bucket, index) => (
                            <section
                                key={bucket.id}
                                className="h-[100dvh] w-full snap-start snap-always flex items-center justify-center relative px-6"
                            >
                                <div className="w-full max-w-[340px] flex flex-col gap-6 -translate-y-8">
                                    {/* Creator Badge */}
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border border-gold-film/20 bg-darkroom flex items-center justify-center shrink-0 overflow-hidden">
                                                {bucket.users?.profile_image_url ? (
                                                    <img src={bucket.users.profile_image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={18} className="text-gold-film/40" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-display text-white tracking-widest leading-none">
                                                    {bucket.users?.nickname || 'Unknown Director'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-mono-technical text-gold-film font-bold">{(bucket.tickets || 0).toLocaleString()} TICKETS</span>
                                        </div>
                                    </div>

                                    {/* The Poster (Main Attraction) */}
                                    <div className="relative aspect-[2/3] w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-lg overflow-hidden group">
                                        <BucketCard
                                            bucket={bucket}
                                            isPublic={true}
                                        />
                                    </div>


                                    {/* Scroll Guide */}
                                    {index === 0 && (
                                        <motion.div
                                            animate={{ y: [0, 10, 0] }}
                                            transition={{ repeat: Infinity, duration: 2.5 }}
                                            className="absolute -bottom-24 left-1/2 -translate-x-1/2 opacity-20"
                                        >
                                            <ChevronDown size={24} />
                                        </motion.div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredFeed.length === 0 && (
                    <div className="h-[100dvh] flex flex-col items-center justify-center opacity-20">
                        <Film size={48} className="mb-4" />
                        <span className="text-xs tracking-[0.5em] uppercase">No screening scheduled</span>
                    </div>
                )}
            </div>
        </div>
    )
}
