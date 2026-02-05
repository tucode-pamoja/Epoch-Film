'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, User, PlayCircle, Trophy, ChevronDown, Film, Loader2 } from 'lucide-react'
import { SceneCard } from '@/components/buckets/SceneCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { getPublicBuckets } from '@/app/archive/actions'
import { NotificationBell } from '../layout/NotificationBell'

interface ExploreClientProps {
    initialBuckets: any[]
}

export function ExploreClient({ initialBuckets }: ExploreClientProps) {
    const [activeTab, setActiveTab] = useState<'ACHIEVED' | 'ACTIVE'>('ACHIEVED')
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('ALL')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const categories = [
        { id: 'ALL', label: '전체 (ALL)' },
        { id: '여행', label: '여행 (TRAVEL)' },
        { id: '음식', label: '음식 (FOOD)' },
        { id: '성장', label: '성장 (GROWTH)' },
        { id: '운동', label: '운동 (SPORTS)' },
        { id: '문화', label: '문화 (CULTURE)' }
    ]

    const fetchMore = async (page: number) => {
        return await getPublicBuckets(page + 1, 12, activeTab, activeCategory, searchTerm)
    }

    const { items, setItems, loading, hasMore, loadMoreRef, setPage, setHasMore } = useInfiniteScroll(fetchMore)

    // Handle Search Debounce & Filter Change
    useEffect(() => {
        const timer = setTimeout(async () => {
            setPage(0)
            const filtered = await getPublicBuckets(0, 12, activeTab, activeCategory, searchTerm)
            setItems(filtered)
            setHasMore(filtered.length === 12)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, activeCategory, activeTab, setPage, setItems, setHasMore])

    const tabs = [
        { id: 'ACHIEVED', label: '달성한 목표', icon: Trophy },
        { id: 'ACTIVE', label: '계획중인 목표', icon: PlayCircle }
    ]

    return (
        <div className="h-full w-full flex flex-col bg-void text-white">
            {/* 1. Interactive Navigation HUD */}
            <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pointer-events-none h-48 group/nav">
                {/* Hit Area Trigger */}
                <div className="absolute inset-0 pointer-events-auto" />

                <div className="absolute top-8 right-8 pointer-events-auto transition-all duration-700 opacity-0 -translate-y-4 group-hover/nav:opacity-100 group-hover/nav:translate-y-0 flex items-center gap-4">
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-2 rounded-full border transition-all ${isSearchOpen ? 'bg-gold-film text-void border-gold-film' : 'bg-white/5 text-smoke border-white/10 hover:text-white'}`}
                    >
                        <Film size={20} />
                    </button>
                    <NotificationBell />
                </div>

                <div className="relative flex flex-col items-center gap-6 transition-all duration-700 opacity-0 -translate-y-4 group-hover/nav:opacity-100 group-hover/nav:translate-y-0 pointer-events-auto w-full max-w-xl px-6">
                    {/* Tab Selector */}
                    <div className="flex items-center gap-1 p-1 bg-void/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-huge">
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

                    {/* Category Filter HUD */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 bg-white/5 backdrop-blur-md rounded-full border border-white/5">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    px-4 py-1 rounded-full text-[10px] whitespace-nowrap font-mono-technical transition-all
                                    ${activeCategory === cat.id
                                        ? 'text-gold-film bg-white/10'
                                        : 'text-smoke/60 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Console */}
                    <AnimatePresence>
                        {isSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, width: '60%' }}
                                animate={{ opacity: 1, y: 0, width: '100%' }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative group/search"
                            >
                                <input
                                    type="text"
                                    placeholder="감독 또는 제목 검색... (SEARCH_STORY)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-void/80 border border-gold-film/30 rounded-sm px-10 py-3 text-sm focus:outline-none focus:border-gold-film transition-all font-light placeholder:text-smoke/30 italic"
                                    autoFocus
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-film/40">
                                    <Film size={16} />
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono-technical text-smoke/40 hover:text-red-400"
                                    >
                                        RESET_FILTER
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. Main Snap Feed */}
            <div
                ref={scrollContainerRef}
                className="flex-1 w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth pt-32"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeTab}-${activeCategory}-${searchTerm}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                    >
                        {items.length > 0 ? (
                            items.map((bucket, index) => (
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
                                        <div className="relative aspect-[3/4] w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-lg overflow-hidden group">
                                            <SceneCard
                                                bucket={bucket}
                                                isPublic={true}
                                            />
                                        </div>

                                        {/* Scroll Guide */}
                                        {index === items.length - 1 && hasMore && (
                                            <div ref={loadMoreRef} className="absolute -bottom-10 left-1/2 -translate-x-1/2 pb-10">
                                                {loading && <Loader2 size={24} className="text-gold-film animate-spin" />}
                                            </div>
                                        )}

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
                            ))
                        ) : (
                            <div className="h-[100dvh] flex flex-col items-center justify-center opacity-20">
                                <Film size={48} className="mb-4" />
                                <span className="text-xs tracking-[0.5em] uppercase">No screening scheduled for this selection</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
