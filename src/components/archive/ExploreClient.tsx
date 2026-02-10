'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, PlayCircle, Trophy, ChevronDown, Film, Loader2, X, Ticket, Copy } from 'lucide-react'
import { SceneCard } from '@/components/buckets/SceneCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { getPublicBuckets } from '@/app/archive/actions'
import { NotificationBell } from '../layout/NotificationBell'
import { FollowButton } from './FollowButton'

interface ExploreClientProps {
    initialBuckets: any[]
    currentUserId?: string
}

export function ExploreClient({ initialBuckets, currentUserId }: ExploreClientProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [focusedId, setFocusedId] = useState<string | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    const fetchMore = useCallback(async (page: number) => {
        // Fetch buckets for the given page
        return await getPublicBuckets(page, 12, undefined, 'ALL', searchTerm.trim(), false)
    }, [searchTerm])

    const { items, setItems, loading, hasMore, loadMoreRef, setPage, setHasMore, loadingRef } = useInfiniteScroll(fetchMore, {
        pageSize: 12,
        initialItems: initialBuckets
    })

    const performSearch = async (term: string) => {
        const trimmedSearch = term.trim()

        // Block other fetches during search reset
        if (loadingRef?.current) return

        setPage(0)
        // Fetch all statuses for search results starting from page 0
        const filtered = await getPublicBuckets(0, 12, undefined, 'ALL', trimmedSearch, false)
        setItems(filtered)
        setHasMore(filtered.length === 12)
    }

    // Intersection Observer to detect focused card
    useEffect(() => {
        const options = {
            root: scrollContainerRef.current,
            threshold: 0.6,
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setFocusedId(entry.target.getAttribute('data-id'))
                }
            })
        }, options)

        const currentRefs = sectionRefs.current
        Object.values(currentRefs).forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => {
            Object.values(currentRefs).forEach((ref) => {
                if (ref) observer.unobserve(ref)
            })
        }
    }, [items])

    const isInitialMount = useRef(true)

    // Handle Search Debounce
    useEffect(() => {
        // Skip redundant fetch on mount if search is empty (initialBuckets already handled it)
        if (isInitialMount.current && searchTerm === '') {
            isInitialMount.current = false
            return
        }

        const timer = setTimeout(() => {
            performSearch(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur() // Close mobile keyboard
            performSearch(searchTerm) // Immediate search without debounce
        }
    }

    // Lock body scroll and remove padding for a full-screen experience
    useEffect(() => {
        const originalPadding = document.body.style.paddingBottom
        const originalOverflow = document.body.style.overflow

        document.body.style.overflow = 'hidden'
        document.body.style.paddingBottom = '0px'

        return () => {
            document.body.style.overflow = originalOverflow
            document.body.style.paddingBottom = originalPadding
        }
    }, [])


    return (
        <div className="h-full w-full flex flex-col bg-void text-white">
            {/* 1. Cinematic Discover Header (Fixed at Top) */}
            <header className="fixed top-0 left-0 right-0 z-[100] bg-void/60 backdrop-blur-3xl border-b border-white/5 py-4 shadow-2xl">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Top Row: Persistent Search Bar & Notification */}
                    <div className="flex items-center gap-6">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="어떤 페하의 이야기를 찾으시나요? (감독, 제목, 키워드)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-white/5 border border-white/10 rounded-full px-14 py-2.5 text-sm focus:outline-none focus:border-gold-film/50 focus:bg-white/10 transition-all font-light placeholder:text-smoke/20 italic"
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-film/40 group-focus-within:text-gold-film transition-colors">
                                <Search size={20} />
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-smoke/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <div className="shrink-0 scale-110">
                            <NotificationBell />
                        </div>
                    </div>
                </div>
            </header>

            <div
                ref={scrollContainerRef}
                className="flex-1 w-full overflow-y-auto overscroll-y-none snap-y snap-mandatory no-scrollbar scroll-smooth pt-20"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`unified-feed-${searchTerm}`}
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
                                    <div className="w-full max-w-[340px] flex flex-col gap-4 -translate-y-4">
                                        {/* Creator Badge */}
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border border-gold-film/20 bg-darkroom flex items-center justify-center shrink-0 overflow-hidden">
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
                                            <div className="flex items-center gap-4">
                                                <FollowButton targetId={bucket.user_id} currentUserId={currentUserId} />
                                            </div>
                                        </div>

                                        {/* The Poster (Main Attraction) */}
                                        <div
                                            ref={(el) => { sectionRefs.current[bucket.id] = el }}
                                            data-id={bucket.id}
                                            className="relative aspect-[4/5] w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-lg overflow-hidden group"
                                        >
                                            <SceneCard
                                                bucket={bucket}
                                                isPublic={true}
                                                isFocused={focusedId === bucket.id}
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
