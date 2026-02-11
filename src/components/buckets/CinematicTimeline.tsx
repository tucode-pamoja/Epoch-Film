'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bucket } from '@/types'
import Link from 'next/link'
import { Filter, ChevronRight, ChevronLeft, Telescope, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface CinematicTimelineProps {
    buckets: Bucket[]
}

type ViewMode = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY'

export function CinematicTimeline({ buckets }: CinematicTimelineProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
    const [viewMode, setViewMode] = useState<ViewMode>('DAY')
    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeId, setActiveId] = useState<string | null>(null)

    const categories = ['ALL', 'TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'HEALTH', 'CULTURE', 'FOOD', 'OTHER']

    const baseFilteredBuckets = useMemo(() => {
        return buckets
            .filter(b => selectedCategory === 'ALL' || b.category === selectedCategory)
            .sort((a, b) =>
                new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
            )
    }, [buckets, selectedCategory])

    const timelineData = useMemo(() => {
        if (viewMode === 'YEAR') {
            const years: Record<number, Bucket[]> = {}
            baseFilteredBuckets.forEach(b => {
                const year = new Date(b.updated_at || b.created_at).getFullYear()
                if (!years[year]) years[year] = []
                years[year].push(b)
            })
            return Object.entries(years).map(([year, items]) => ({
                id: year,
                label: year,
                items,
                bucket: items[0],
                date: new Date(parseInt(year), 0, 1)
            }))
        }

        if (viewMode === 'MONTH') {
            const months: Record<string, Bucket[]> = {}
            baseFilteredBuckets.forEach(b => {
                const d = new Date(b.updated_at || b.created_at)
                const key = `${d.getFullYear()}-${d.getMonth() + 1}`
                if (!months[key]) months[key] = []
                months[key].push(b)
            })
            return Object.entries(months).map(([key, items]) => ({
                id: key,
                label: key.replace('-', '.'),
                items,
                bucket: items[0],
                date: items[0] ? new Date(items[0].updated_at || items[0].created_at) : new Date()
            }))
        }

        if (viewMode === 'WEEK') {
            const weeks: Record<string, Bucket[]> = {}
            baseFilteredBuckets.forEach(b => {
                const d = new Date(b.updated_at || b.created_at)
                const onejan = new Date(d.getFullYear(), 0, 1)
                const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7)
                const key = `${d.getFullYear()}-W${week}`
                if (!weeks[key]) weeks[key] = []
                weeks[key].push(b)
            })
            return Object.entries(weeks).map(([key, items]) => ({
                id: key,
                label: key,
                items,
                bucket: items[0],
                date: items[0] ? new Date(items[0].updated_at || items[0].created_at) : new Date()
            }))
        }

        return baseFilteredBuckets.map(b => ({
            id: b.id,
            label: `${new Date(b.updated_at || b.created_at).getFullYear()}.${new Date(b.updated_at || b.created_at).getMonth() + 1}`,
            items: [b],
            bucket: b,
            date: new Date(b.updated_at || b.created_at)
        }))
    }, [baseFilteredBuckets, viewMode])

    const handleNodeClick = () => {
        if (viewMode === 'YEAR') setViewMode('MONTH')
        else if (viewMode === 'MONTH') setViewMode('WEEK')
        else if (viewMode === 'WEEK') setViewMode('DAY')
    }

    // Set default active node when data changes
    useEffect(() => {
        if (timelineData.length > 0) {
            setActiveId(timelineData[0].id)
        }
    }, [timelineData])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container
            const progress = scrollWidth > clientWidth
                ? scrollLeft / (scrollWidth - clientWidth)
                : 0
            setScrollProgress(progress)

            // Track active node in center
            const nodes = container.querySelectorAll('[data-timeline-node]')
            if (nodes.length === 0) return

            let closestId: string | null = null
            let minDistance = Infinity
            const viewportCenter = clientWidth / 2

            nodes.forEach((node) => {
                const rect = node.getBoundingClientRect()
                const nodeCenter = rect.left + rect.width / 2
                const distance = Math.abs(nodeCenter - viewportCenter)
                if (distance < minDistance) {
                    minDistance = distance
                    closestId = node.getAttribute('data-id')
                }
            })
            if (closestId) setActiveId(closestId)
        }

        container.addEventListener('scroll', handleScroll, { passive: true })

        // Delayed initial check: scroll first node to center, then detect active
        const timer = setTimeout(() => {
            const firstNode = container.querySelector('[data-timeline-node]')
            if (firstNode) {
                const containerRect = container.getBoundingClientRect()
                const nodeRect = firstNode.getBoundingClientRect()
                const scrollTarget = container.scrollLeft + (nodeRect.left + nodeRect.width / 2) - (containerRect.left + containerRect.width / 2)
                container.scrollTo({ left: scrollTarget, behavior: 'instant' })
            }
            handleScroll()
        }, 500)

        return () => {
            container.removeEventListener('scroll', handleScroll)
            clearTimeout(timer)
        }
    }, [timelineData, viewMode])

    if (buckets.length === 0) return (
        <div className="w-full flex-1 flex flex-col items-center justify-start pt-6 pb-20 text-center animate-fade-in-up">
            <div className="relative w-20 h-28 bg-darkroom rounded-sm film-border shadow-deep flex items-center justify-center mb-6 group overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gold-film/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Star className="text-gold-film/20 group-hover:text-gold-film/40 transition-colors" size={32} />
            </div>

            <div className="space-y-4 w-full max-w-3xl mx-auto px-4">
                <div className="font-mono-technical text-gold-film tracking-[0.3em] text-[10px]">SCENE 1: THE BEGINNING</div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-celluloid w-full break-keep leading-tight">
                    모든 훌륭한 영화는 빈 시나리오에서 시작됩니다.
                </h2>
                <p className="text-smoke font-light text-sm sm:text-base leading-relaxed w-full break-keep">
                    아카이브가 현재 비어 있습니다. 당신의 다음 시대의 첫 번째 장면은 무엇인가요?
                </p>
            </div>

            <div className="mt-8 shrink-0">
                <Button href="/archive/new" size="lg" className="rounded-sm px-10 py-5 text-sm">
                    🎬 시나리오 작성하기
                </Button>
            </div>

            <p className="mt-12 text-xs sm:text-sm text-smoke/60 font-light italic tracking-widest w-full break-keep uppercase">
                &quot;시작하기에 가장 좋은 때는 어제였고, 두 번째로 좋은 때는 지금이다.&quot;
            </p>
        </div>
    )

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(78,205,196,0.05)_0%,transparent_70%)] opacity-50" />
                <div
                    className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                />
            </div>

            {/* Top HUD Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-12 py-2 shrink-0 z-30 pointer-events-none">
                {/* Categories Pill */}
                <div className="pointer-events-auto relative flex items-center gap-2 p-1.5 bg-void/40 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

                    <div className="px-3 border-r border-white/10">
                        <Filter size={12} className="text-cyan-film/60" />
                    </div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={clsx(
                                "px-3 py-1.5 rounded-full text-[9px] font-mono-technical transition-all relative z-10",
                                selectedCategory === cat
                                    ? "bg-cyan-film/20 text-cyan-film shadow-[0_0_10px_rgba(78,205,196,0.2)]"
                                    : "text-smoke/40 hover:text-smoke/80 hover:bg-white/5"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* View Mode Pill */}
                <div className="pointer-events-auto relative flex items-center gap-1 p-1.5 bg-void/40 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

                    {(['YEAR', 'MONTH', 'WEEK', 'DAY'] as ViewMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                                "px-4 py-1.5 text-[9px] font-mono-technical rounded-full transition-all border relative z-10",
                                viewMode === mode
                                    ? "bg-cyan-film/10 text-cyan-film border-cyan-film/20 shadow-[0_0_10px_rgba(78,205,196,0.1)]"
                                    : "text-smoke/30 hover:text-smoke/60 border-transparent hover:bg-white/5"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Observation Deck */}
            <div className="flex-1 relative flex items-center justify-center overflow-visible">
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-x-auto overflow-y-hidden no-scrollbar flex items-center"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${viewMode}-${selectedCategory}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-center gap-0 min-w-max px-[45dvw] h-full"
                        >
                            {timelineData.map((node, index) => {
                                const isActive = activeId === node.id
                                return (
                                    <div key={node.id} className="flex items-center justify-center h-full pb-15 relative" data-timeline-node data-id={node.id}>
                                        {/* Node Group - Centered on the timeline */}
                                        <div className={clsx(
                                            "relative z-10 flex items-center justify-center transition-all duration-1000",
                                            isActive ? "scale-100 opacity-100 filter-none" : "scale-90 opacity-60 grayscale"
                                        )}>
                                            {/* TOP SECTION: Label & Signal Line (Absolute, anchored to bottom of node) */}
                                            <div className={clsx(
                                                "absolute bottom-full mb-2 flex flex-col items-center transition-all duration-700 w-max",
                                                isActive ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"
                                            )}>
                                                {/* Date Label */}
                                                <div className={clsx(
                                                    "font-mono-technical text-[10px] tracking-[0.4em] font-bold mb-2 transition-colors",
                                                    isActive ? "text-cyan-film" : "text-smoke/40"
                                                )}>
                                                    {node.label}
                                                </div>

                                                {/* Vertical Leader Line */}
                                                <div className={clsx(
                                                    "w-px bg-gradient-to-b from-transparent via-cyan-film/40 to-cyan-film/60 transition-all duration-1000",
                                                    isActive ? "h-12" : "h-8"
                                                )} />
                                            </div>

                                            {/* CENTER: The Celestial Node (Static) */}
                                            <div className="relative flex items-center justify-center">
                                                {node.bucket ? (
                                                    viewMode === 'DAY' ? (
                                                        <Link href={`/archive/${node.bucket.id}`} className="relative block group/node">
                                                            <motion.div
                                                                animate={isActive ? {
                                                                    scale: [1, 1.2, 1],
                                                                    boxShadow: ["0 0 20px rgba(78,205,196,0.5)", "0 0 40px rgba(78,205,196,1)", "0 0 20px rgba(78,205,196,0.5)"]
                                                                } : { scale: 1 }}
                                                                transition={{ repeat: Infinity, duration: 4 }}
                                                                className={clsx(
                                                                    "w-4 h-4 rounded-full border-2 transition-all duration-500 cursor-pointer relative z-20 bg-void",
                                                                    isActive ? "border-cyan-film" : "border-cyan-film/40"
                                                                )}
                                                            />
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-cyan-film/40 blur-xl animate-pulse rounded-full z-10" />
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <div onClick={handleNodeClick} className="relative block group/node cursor-pointer">
                                                            <motion.div
                                                                animate={isActive ? {
                                                                    scale: [1, 1.2, 1],
                                                                    boxShadow: ["0 0 20px rgba(78,205,196,0.5)", "0 0 40px rgba(78,205,196,1)", "0 0 20px rgba(78,205,196,0.5)"]
                                                                } : { scale: 1 }}
                                                                transition={{ repeat: Infinity, duration: 4 }}
                                                                className={clsx(
                                                                    "w-4 h-4 rounded-full border-2 transition-all duration-500 relative z-20 bg-void",
                                                                    isActive ? "border-cyan-film" : "border-cyan-film/40"
                                                                )}
                                                            />
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-cyan-film/40 blur-xl animate-pulse rounded-full z-10" />
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full border border-white/10 bg-void z-20" />
                                                )}
                                            </div>

                                            {/* BOTTOM SECTION: Info Card (Absolute, anchored to top of node) */}
                                            <div className={clsx(
                                                "absolute top-full mt-8 flex flex-col items-center w-64 transition-all duration-700",
                                                isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                                            )}>
                                                {node.bucket ? (
                                                    viewMode === 'DAY' ? (
                                                        <Link href={`/archive/${node.bucket.id}`} className="block group/text text-center space-y-4">
                                                            {node.bucket.thumbnail_url && (
                                                                <div className="w-24 h-32 mx-auto mb-6 rounded-sm overflow-hidden border border-white/10 shadow-huge group-hover/text:border-cyan-film/50 transition-all duration-700 transform group-hover/text:scale-105">
                                                                    <img
                                                                        src={node.bucket.thumbnail_url}
                                                                        alt=""
                                                                        className={clsx(
                                                                            "w-full h-full object-cover transition-all duration-1000",
                                                                            isActive ? "grayscale-0 saturate-100 scale-110" : "grayscale saturate-0 scale-100"
                                                                        )}
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent opacity-0 group-hover/text:opacity-100 transition-opacity" />
                                                                </div>
                                                            )}
                                                            <h4 className={clsx(
                                                                "text-base font-display transition-colors line-clamp-2 leading-relaxed tracking-wide px-4",
                                                                isActive ? "text-celluloid" : "text-smoke/60"
                                                            )}>
                                                                {node.bucket.title}
                                                            </h4>
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className={clsx(
                                                                    "h-px transition-all duration-1000",
                                                                    isActive ? "w-20 bg-cyan-film" : "w-4 bg-white/10"
                                                                )} />
                                                                <div className="font-mono-technical text-[8px] uppercase tracking-[0.4em] font-bold text-cyan-film/60">
                                                                    {node.bucket.category}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <div onClick={handleNodeClick} className="cursor-pointer group/text text-center space-y-4">
                                                            {node.bucket.thumbnail_url ? (
                                                                <div className="w-24 h-32 mx-auto mb-6 rounded-sm overflow-hidden border border-white/10 shadow-huge group-hover/text:border-cyan-film/50 transition-all duration-700 transform group-hover/text:scale-105">
                                                                    <img
                                                                        src={node.bucket.thumbnail_url}
                                                                        alt=""
                                                                        className={clsx(
                                                                            "w-full h-full object-cover transition-all duration-1000",
                                                                            isActive ? "grayscale-0 saturate-100 scale-110" : "grayscale saturate-0 scale-100"
                                                                        )}
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent opacity-0 group-hover/text:opacity-100 transition-opacity" />

                                                                    {/* Overlay Badge for Count */}
                                                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-sm">
                                                                        <span className="text-[8px] font-mono-technical text-cyan-film tracking-wider">+{node.items.length}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-18 h-12 mx-auto mb-3 bg-white/5 flex items-center justify-center border border-white/10 rounded-sm">
                                                                    <div className="text-[8px] font-mono-technical text-smoke/40">{node.items.length} SPECTRA</div>
                                                                </div>
                                                            )}
                                                            <h4 className={clsx(
                                                                "text-base font-display transition-colors line-clamp-2 leading-relaxed tracking-wide px-4",
                                                                isActive ? "text-celluloid" : "text-smoke/60"
                                                            )}>
                                                                {node.label} Highlights
                                                            </h4>
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className={clsx(
                                                                    "h-px transition-all duration-1000",
                                                                    isActive ? "w-20 bg-cyan-film" : "w-4 bg-white/10"
                                                                )} />
                                                                <div className="font-mono-technical text-[8px] uppercase tracking-[0.4em] font-bold text-cyan-film/60">
                                                                    Drill Down
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="space-y-4 flex flex-col items-center">
                                                        <div className="h-px w-8 bg-white/10" />
                                                        <p className="text-[8px] font-mono-technical text-smoke/40 uppercase tracking-[0.4em]">Void_Sector</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Interstellar Trail */}
                                        {index < timelineData.length - 1 && (
                                            <div className={clsx(
                                                "w-56 h-[2px] transition-all duration-1000 self-center",
                                                isActive ? "bg-gradient-to-r from-cyan-film to-cyan-film/10 opacity-40" : "bg-white/5 opacity-10"
                                            )} />
                                        )}
                                    </div>
                                )
                            })}

                            {/* End Void Indicator */}
                            <div className="flex items-center h-full pb-15">
                                <div className="w-96 h-px bg-gradient-to-r from-cyan-film/40 to-transparent opacity-2" />
                                <div className="ml-24 flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-film/40 shadow-[0_0_10px_rgba(78,205,196,1)]" />
                                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-1.5 h-1.5 rounded-full bg-cyan-film/40 shadow-[0_0_10px_rgba(78,205,196,1)]" />
                                    </div>
                                    <span className="font-mono-technical text-[9px] text-cyan-film/20 tracking-[0.5em] uppercase">Observation_Limit</span>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Side Navigation Arrows */}
                <motion.button
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-10 top-[44%] -translate-y-1/2 z-30 group"
                    onClick={() => containerRef.current?.scrollBy({ left: -600, behavior: 'smooth' })}
                >
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-film/30 transition-all bg-darkroom/60 backdrop-blur-sm">
                        <ChevronLeft size={20} className="text-smoke/40 group-hover:text-cyan-film transition-colors" />
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-10 top-[44%] -translate-y-1/2 z-30 group"
                    onClick={() => containerRef.current?.scrollBy({ left: 600, behavior: 'smooth' })}
                >
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-film/30 transition-all bg-darkroom/60 backdrop-blur-sm">
                        <ChevronRight size={20} className="text-smoke/40 group-hover:text-cyan-film transition-colors" />
                    </div>
                </motion.button>
            </div>
        </div>
    )
}
