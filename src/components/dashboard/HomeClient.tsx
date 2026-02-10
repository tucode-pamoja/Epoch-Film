'use client'

import { Bucket } from '@/types'
import { SceneCard } from '@/components/buckets/SceneCard'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Plus, Film, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CompletionModal } from '@/components/archive/CompletionModal'
import { completeBucket, completeRoutineCycle, saveMemory } from '@/app/archive/actions'
import { clsx } from 'clsx'

export interface HomeClientProps {
    buckets: Bucket[]
}

export function HomeClient({ buckets }: HomeClientProps) {
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') as 'ROUTINES' | 'YEAR' | 'LIFE' | null
    const [activeMainTab, setActiveMainTab] = useState<'ROUTINES' | 'YEAR' | 'LIFE'>(initialTab || 'YEAR')

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && (tab === 'ROUTINES' || tab === 'YEAR' || tab === 'LIFE')) {
            setActiveMainTab(tab as any)
        }
    }, [searchParams])
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRODUCTION' | 'ACHIEVED' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('ALL')
    const [activeIndex, setActiveIndex] = useState(0)
    const [completingBucket, setCompletingBucket] = useState<Bucket | null>(null)
    const carouselRef = useRef<HTMLDivElement>(null)

    const handleCompletionSubmit = async (data: { image?: File; caption: string }) => {
        if (!completingBucket) return

        if (completingBucket.is_routine) {
            // Routine: save memory as footprint + mark cycle complete (not ACHIEVED)
            const formData = new FormData()
            formData.append('caption', data.caption || '루틴 완료 🎬')
            if (data.image) {
                formData.append('image', data.image)
            }
            await saveMemory(completingBucket.id, formData)
            await completeRoutineCycle(completingBucket.id)
        } else {
            // Regular bucket: mark as ACHIEVED
            const formData = new FormData()
            formData.append('caption', data.caption)
            if (data.image) {
                formData.append('image', data.image)
            }
            await completeBucket(completingBucket.id, formData)
        }

        setCompletingBucket(null)
    }

    // Filtered Content
    const displayedBuckets = useMemo(() => {
        let filtered = buckets

        if (activeMainTab === 'ROUTINES') {
            // "Production Routines": Recurring activities
            filtered = buckets.filter(b => b.is_routine === true)

            if (statusFilter === 'DAILY' || statusFilter === 'WEEKLY' || statusFilter === 'MONTHLY') {
                filtered = filtered.filter(b => b.routine_frequency === statusFilter)
            }
        } else if (activeMainTab === 'YEAR') {
            // "올해의 Scenes": Non-routine items with a target_date
            filtered = buckets.filter(b => b.is_routine !== true && b.target_date !== null)

            if (statusFilter === 'PRODUCTION') {
                filtered = filtered.filter(b => b.status !== 'ACHIEVED')
            } else if (statusFilter === 'ACHIEVED') {
                filtered = filtered.filter(b => b.status === 'ACHIEVED')
            }
        } else if (activeMainTab === 'LIFE') {
            // "My Epoch": Non-routine items with no target_date
            filtered = buckets.filter(b => b.is_routine !== true && b.target_date === null)

            if (statusFilter === 'PRODUCTION') {
                filtered = filtered.filter(b => b.status !== 'ACHIEVED')
            } else if (statusFilter === 'ACHIEVED') {
                filtered = filtered.filter(b => b.status === 'ACHIEVED')
            }
        }

        return filtered
    }, [buckets, activeMainTab, statusFilter])

    const showAddCard = statusFilter !== 'ACHIEVED'
    const totalCarouselItems = displayedBuckets.length + (showAddCard ? 1 : 0)
    const totalRealBuckets = displayedBuckets.length

    // Navigation logic with strict clamping
    const navigateTo = useCallback((index: number) => {
        const target = Math.max(0, Math.min(index, totalCarouselItems - 1))
        setActiveIndex(target)
    }, [totalCarouselItems])

    // Reset when navigation/filter changes
    useEffect(() => {
        setActiveIndex(0)
    }, [activeMainTab, statusFilter])

    // Safety sync
    useEffect(() => {
        if (activeIndex >= totalCarouselItems && totalCarouselItems > 0) {
            setActiveIndex(totalCarouselItems - 1)
        }
    }, [totalCarouselItems, activeIndex])

    // Wheel navigation
    useEffect(() => {
        const el = carouselRef.current
        if (!el) return

        let isWheeling = false
        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault()
                if (isWheeling) return

                const threshold = 30
                if (e.deltaX > threshold && activeIndex < totalCarouselItems - 1) {
                    navigateTo(activeIndex + 1)
                    isWheeling = true
                    setTimeout(() => { isWheeling = false }, 250)
                } else if (e.deltaX < -threshold && activeIndex > 0) {
                    navigateTo(activeIndex - 1)
                    isWheeling = true
                    setTimeout(() => { isWheeling = false }, 250)
                }
            }
        };
        el.addEventListener('wheel', handleWheel, { passive: false })
        return () => el.removeEventListener('wheel', handleWheel)
    }, [activeIndex, totalCarouselItems, navigateTo])

    const isAddCardFocused = activeIndex === totalRealBuckets && showAddCard

    // Visual State Logic for Counter
    const sequenceNumber = useMemo(() => {
        if (isAddCardFocused) return '--'
        // Clamp the display number to never exceed real bucket count
        const num = Math.min(activeIndex + 1, totalRealBuckets)
        return num.toString().padStart(2, '0')
    }, [activeIndex, totalRealBuckets, isAddCardFocused])

    // Layout Constants
    const cardWidth = 280
    const gap = 40
    const totalStep = cardWidth + gap

    if (buckets.length === 0) {
        return (
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
                    "시작하기에 가장 좋은 때는 어제였고, 두 번째로 좋은 때는 지금이다."
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 relative select-none">
            {/* 1. Header Navigation */}
            <div className="flex-shrink-0 pt-2 pb-2 space-y-4 z-30">
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                        {['ROUTINES', 'YEAR', 'LIFE'].map((tabId) => (
                            <button
                                key={tabId}
                                onClick={() => setActiveMainTab(tabId as any)}
                                className={clsx(
                                    "px-8 py-2 rounded-full text-[10px] md:text-xs font-display transition-all duration-300",
                                    activeMainTab === tabId ? 'bg-gold-film text-velvet font-bold scale-105 shadow-huge' : 'text-smoke/40 hover:text-smoke/70'
                                )}
                            >
                                {tabId === 'ROUTINES' ? 'ROUTINES' : tabId === 'YEAR' ? '올해의 신' : '마이 에포크'}
                            </button>
                        ))}
                    </div>
                    <Link
                        href="/archive/new"
                        className="w-10 h-10 rounded-full bg-gold-film/10 border border-gold-film/30 flex items-center justify-center text-gold-film hover:bg-gold-film hover:text-velvet transition-all duration-300"
                    >
                        <Plus size={20} />
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-8">
                    {(activeMainTab === 'ROUTINES'
                        ? ['ALL', 'DAILY', 'WEEKLY', 'MONTHLY']
                        : ['ALL', 'PRODUCTION', 'ACHIEVED']
                    ).map((subId) => (
                        <button
                            key={subId}
                            onClick={() => setStatusFilter(subId as any)}
                            className={clsx(
                                "font-mono-technical text-[9px] tracking-[0.2em] uppercase transition-all relative py-1",
                                statusFilter === subId ? 'text-gold-film font-bold' : 'text-smoke/40 hover:text-smoke/70'
                            )}
                        >
                            {subId === 'ALL' ? '전체 (ALL)' :
                                subId === 'PRODUCTION' ? '제작 중 (PRODUCTION)' :
                                    subId === 'ACHIEVED' ? '완료됨 (ACHIEVED)' :
                                        subId === 'DAILY' ? '매일 (DAILY)' :
                                            subId === 'WEEKLY' ? '매주 (WEEKLY)' : '매월 (MONTHLY)'}
                            {statusFilter === subId && (
                                <motion.div layoutId="sub-pill" className="absolute bottom-0 left-0 right-0 h-px bg-gold-film/60" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Main Cinematic Workspace */}
            <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-visible">
                <div
                    ref={carouselRef}
                    className="w-full flex-1 flex items-center justify-start overflow-visible pb-48"
                    style={{ paddingLeft: 'calc(50% - 140px)' }}
                >
                    <motion.div
                        className="flex gap-10 items-center h-[50vh] min-h-[420px] cursor-grab active:cursor-grabbing"
                        animate={{ x: -(activeIndex * totalStep) }}
                        transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
                        drag="x"
                        dragConstraints={{ left: -(totalCarouselItems - 1) * totalStep, right: 0 }}
                        onDragEnd={(_, { offset, velocity }) => {
                            const swipe = offset.x + velocity.x * 0.5
                            if (swipe < -50 && activeIndex < totalCarouselItems - 1) navigateTo(activeIndex + 1)
                            else if (swipe > 50 && activeIndex > 0) navigateTo(activeIndex - 1)
                        }}
                    >
                        {totalCarouselItems === 0 ? (
                            <div className="w-[280px] flex flex-col items-center justify-center gap-6 opacity-20">
                                <Film size={48} strokeWidth={1} />
                                <div className="space-y-1 text-center">
                                    <p className="text-[10px] tracking-[0.4em] uppercase">No Scenes Found</p>
                                    <p className="text-[8px] tracking-widest text-smoke/60">기록된 장면이 없습니다.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {displayedBuckets.map((bucket, index) => (
                                    <div
                                        key={bucket.id}
                                        className="w-[280px] flex-shrink-0 h-full flex items-center justify-center"
                                        onClick={() => navigateTo(index)}
                                    >
                                        <SceneCard
                                            bucket={bucket}
                                            isFocused={activeIndex === index}
                                            onComplete={() => setCompletingBucket(bucket)}
                                        />
                                    </div>
                                ))}

                                {showAddCard && (
                                    <div
                                        className="w-[280px] flex-shrink-0 h-full flex items-center justify-center"
                                        onClick={() => navigateTo(totalRealBuckets)}
                                    >
                                        <Link
                                            href="/archive/new"
                                            className={clsx(
                                                "group aspect-[3/4] w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-700",
                                                isAddCardFocused
                                                    ? "border-gold-film/50 bg-gold-film/5 scale-105 opacity-100 shadow-huge"
                                                    : "border-white/10 bg-white/5 scale-100 opacity-20 blur-[1px]"
                                            )}
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-all">
                                                <Plus size={32} className="text-smoke group-hover:text-gold-film transition-colors" />
                                            </div>
                                            <span className="mt-6 font-display text-[10px] tracking-[0.3em] uppercase text-smoke group-hover:text-gold-film">Add New Scene</span>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* 3. SCENE Counter - Fixed for visibility */}
            {totalRealBuckets > 0 && (
                <div className="fixed bottom-[108px] left-0 right-0 flex flex-col items-center gap-5 z-[100] pointer-events-none">
                    <div className="flex justify-center gap-3 pointer-events-auto">
                        {[...Array(totalRealBuckets)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => navigateTo(i)}
                                className={clsx(
                                    "h-0.5 transition-all duration-500 rounded-full shadow-huge",
                                    activeIndex === i ? "w-12 bg-gold-film" : "w-1.5 bg-white/20"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-mono-technical text-[10px] tracking-[0.3em] text-gold-film/40">SCENE</span>
                        <div className="font-mono text-sm tracking-[0.5em] text-gold-film flex items-center gap-3">
                            <span className="font-bold">{sequenceNumber}</span>
                            <span className="opacity-20">/</span>
                            <span className="opacity-40">{totalRealBuckets.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>
            )}

            <CompletionModal
                isOpen={!!completingBucket}
                onClose={() => setCompletingBucket(null)}
                onComplete={handleCompletionSubmit}
                bucketTitle={completingBucket?.title || ''}
            />
        </div>
    )
}
