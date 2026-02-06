'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bucket } from '@/types'
import Link from 'next/link'
import { Filter, ChevronRight, ChevronLeft, Telescope } from 'lucide-react'
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
            .filter(b => b.status === 'ACHIEVED')
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

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container
            if (scrollWidth <= clientWidth) {
                setScrollProgress(0)
                return
            }
            const progress = scrollLeft / (scrollWidth - clientWidth)
            setScrollProgress(progress)

            // Track active node in center
            const nodes = container.querySelectorAll('[data-timeline-node]')
            let closestId = null
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
            setActiveId(closestId)
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check

        return () => container.removeEventListener('scroll', handleScroll)
    }, [timelineData, viewMode])

    if (buckets.length === 0) return (
        <div className="w-full flex-1 flex items-center justify-center p-12">
            <div className="glass-warm border border-white/5 p-12 rounded-sm text-center max-w-sm">
                <Telescope className="w-10 h-10 text-white/10 mx-auto mb-4" />
                <p className="text-smoke italic font-light text-sm">아직 관측된 기록이 없습니다.</p>
            </div>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-12 py-6 shrink-0 z-30">
                <div className="flex items-center gap-2 p-1 bg-void/40 backdrop-blur-md rounded-full border border-white/10">
                    <div className="px-3 border-r border-white/10">
                        <Filter size={10} className="text-cyan-film/60" />
                    </div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={clsx(
                                "px-3 py-1 rounded-full text-[9px] font-mono-technical transition-all",
                                selectedCategory === cat ? "bg-cyan-film/20 text-cyan-film" : "text-smoke/40 hover:text-smoke/80"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-sm border border-white/10">
                    {(['YEAR', 'MONTH', 'WEEK', 'DAY'] as ViewMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                                "px-4 py-1.5 text-[9px] font-mono-technical rounded-sm transition-all border",
                                viewMode === mode ? "bg-cyan-film/10 text-cyan-film border-cyan-film/20" : "text-smoke/30 hover:text-smoke/60 border-transparent"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Observation Deck */}
            <div className="flex-1 min-h-0 relative flex items-center overflow-hidden">
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-x-auto pt-40 pb-24 no-scrollbar"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${viewMode}-${selectedCategory}`}
                            initial={{ opacity: 0, filter: 'blur(20px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(20px)' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-start gap-0 min-w-max px-[45dvw] h-full"
                        >
                            {timelineData.map((node, index) => {
                                const isActive = activeId === node.id
                                return (
                                    <div key={node.id} className="flex items-start" data-timeline-node data-id={node.id}>
                                        <div className={clsx(
                                            "relative flex flex-col items-center group h-full transition-all duration-1000",
                                            isActive ? "scale-100 opacity-100 filter-none" : "scale-90 opacity-30 blur-[2px] grayscale"
                                        )}>
                                            {/* Date Label */}
                                            <div className={clsx(
                                                "absolute -top-16 flex flex-col items-center transition-all duration-700",
                                                isActive ? "scale-110 opacity-100" : "scale-100 opacity-30"
                                            )}>
                                                <div className={clsx(
                                                    "font-mono-technical text-[10px] tracking-[0.4em] font-bold transition-colors",
                                                    isActive ? "text-cyan-film" : "text-smoke/40"
                                                )}>
                                                    {node.label}
                                                </div>
                                                <div className={clsx(
                                                    "h-6 w-px bg-gradient-to-b transition-all duration-700 mt-2",
                                                    isActive ? "from-cyan-film to-transparent h-10" : "from-cyan-film/20 to-transparent"
                                                )} />
                                            </div>

                                            {/* Signal Lead */}
                                            <div className={clsx(
                                                "w-[1px] bg-gradient-to-b from-transparent via-white/10 to-cyan-film/60 transition-all duration-1000",
                                                isActive ? "h-28 opacity-100" : "h-20 opacity-40"
                                            )} />

                                            {/* Celestial Node */}
                                            <div className="relative flex items-center justify-center">
                                                {viewMode === 'DAY' && node.bucket ? (
                                                    <Link href={`/archive/${node.bucket.id}`} className="relative">
                                                        <motion.div
                                                            animate={isActive ? {
                                                                scale: [1, 1.2, 1],
                                                                boxShadow: ["0 0 20px rgba(78,205,196,0.5)", "0 0 40px rgba(78,205,196,1)", "0 0 20px rgba(78,205,196,0.5)"]
                                                            } : { scale: 1 }}
                                                            transition={{ repeat: Infinity, duration: 4 }}
                                                            className={clsx(
                                                                "w-4 h-4 rounded-full border-2 transition-all duration-500 cursor-pointer z-10 relative",
                                                                isActive ? "border-cyan-film bg-cyan-film" : "border-cyan-film/40 bg-transparent"
                                                            )}
                                                        />
                                                        {isActive && (
                                                            <div className="absolute inset-0 bg-cyan-film/40 blur-2xl animate-pulse rounded-full" />
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <motion.div
                                                        onClick={handleNodeClick}
                                                        className={clsx(
                                                            "w-6 h-6 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all duration-500 cursor-pointer z-10 relative",
                                                            isActive ? "border-cyan-film bg-cyan-film/10 shadow-[0_0_30px_rgba(78,205,196,0.3)]" : "border-white/10 bg-darkroom/40"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                            isActive ? "bg-cyan-film shadow-[0_0_10px_rgba(78,205,196,1)] scale-125" : "bg-white/20"
                                                        )} />
                                                        <div className={clsx(
                                                            "absolute -bottom-8 transition-all duration-500 font-mono-technical text-[7px] tracking-widest whitespace-nowrap bg-black/40 px-2 py-0.5 rounded-sm border",
                                                            isActive ? "opacity-100 translate-y-0 border-cyan-film/40 text-cyan-film" : "opacity-0 translate-y-2 border-transparent text-smoke/40"
                                                        )}>
                                                            {node.items.length} SPECTRA
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Info HUD Card */}
                                            <div className={clsx(
                                                "mt-12 w-64 transition-all duration-700 flex flex-col items-center",
                                                isActive ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
                                            )}>
                                                {viewMode === 'DAY' && node.bucket ? (
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
                                                    <div className="space-y-4 flex flex-col items-center">
                                                        <div className="h-px w-8 bg-white/10" />
                                                        <p className="text-[8px] font-mono-technical text-smoke/40 uppercase tracking-[0.4em]">Celestial_Cluster</p>
                                                        <p className="text-sm font-display text-celluloid/80 italic">{node.items.length} Recorded Spectra</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Interstellar Trail */}
                                        {index < timelineData.length - 1 && (
                                            <div className={clsx(
                                                "w-56 mt-[112px] h-[1px] transition-all duration-1000",
                                                isActive ? "bg-gradient-to-r from-cyan-film to-cyan-film/10 opacity-40" : "bg-white/5 opacity-10"
                                            )} />
                                        )}
                                    </div>
                                )
                            })}

                            {/* End Void Indicator */}
                            <div className="flex items-center">
                                <div className="w-96 mt-[112px] h-px bg-gradient-to-r from-cyan-film/40 to-transparent opacity-10" />
                                <div className="mt-[112px] ml-12 flex items-center gap-4">
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
            </div>

            {/* Bottom HUD Seeker */}
            <div className="shrink-0 w-full px-12 pb-12 relative z-30">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Progress HUD */}
                    <div className="relative h-[2px] w-full bg-white/5 overflow-visible rounded-full">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-cyan-film/60 to-cyan-film shadow-[0_0_15px_rgba(78,205,196,0.5)] rounded-full"
                            style={{ width: `${scrollProgress * 100}%` }}
                        />
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                            style={{ left: `${scrollProgress * 100}%` }}
                        >
                            <div className="w-6 h-6 flex items-center justify-center border border-cyan-film/40 rounded-full bg-darkroom/80 backdrop-blur-md shadow-[0_0_20px_rgba(78,205,196,0.3)]">
                                <div className="w-1 h-1 bg-cyan-film shadow-[0_0_10px_rgba(78,205,196,1)] rounded-full" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ x: -8 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-6 group"
                            onClick={() => containerRef.current?.scrollBy({ left: -600, behavior: 'smooth' })}
                        >
                            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-cyan-film/30 transition-all bg-white/5">
                                <ChevronLeft size={18} className="text-smoke/40 group-hover:text-cyan-film transition-colors" />
                            </div>
                            <div className="hidden md:flex flex-col items-start opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-[7px] font-mono-technical text-cyan-film/60 uppercase tracking-[0.4em]">Signal_Back</span>
                                <span className="text-[10px] font-display text-smoke uppercase tracking-widest">Previous_Sector</span>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ x: 8 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-6 group"
                            onClick={() => containerRef.current?.scrollBy({ left: 600, behavior: 'smooth' })}
                        >
                            <div className="hidden md:flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-[7px] font-mono-technical text-cyan-film/60 uppercase tracking-[0.4em]">Signal_Next</span>
                                <span className="text-[10px] font-display text-smoke uppercase tracking-widest">Advance_Sector</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-cyan-film/30 transition-all bg-white/5">
                                <ChevronRight size={18} className="text-smoke/40 group-hover:text-cyan-film transition-colors" />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}
