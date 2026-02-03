'use client'

import { Bucket } from '@/types'
import { BucketCard } from '@/components/buckets/BucketCard'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { LifeDashboard } from './LifeDashboard'
import { Plus, Film } from 'lucide-react'
import Link from 'next/link'
import { CinematicTimeline } from '@/components/buckets/CinematicTimeline'
import { CompletionModal } from '@/components/archive/CompletionModal'
import { completeBucket } from '@/app/archive/actions'

interface HomeClientProps {
    buckets: Bucket[]
    userStats: any // Using any for now to match LifeDashboard props
}

export function HomeClient({ buckets, userStats }: HomeClientProps) {
    const [activeTab, setActiveTab] = useState<'YEAR' | 'LIFE' | 'DONE'>('YEAR')
    const [completingBucket, setCompletingBucket] = useState<Bucket | null>(null)

    const handleCompletionSubmit = async (data: { image?: File; caption: string }) => {
        if (!completingBucket) return

        const formData = new FormData()
        formData.append('caption', data.caption)
        if (data.image) {
            formData.append('image', data.image)
        }

        await completeBucket(completingBucket.id, formData)
        setCompletingBucket(null)
    }

    // Filtering Logic
    const currentYear = new Date().getFullYear()

    // 1. This Year: Buckets with target_date in current year OR created this year and not achieved
    const yearBuckets = buckets.filter(b => {
        if (b.status === 'ACHIEVED') return false
        if (b.target_date) {
            return new Date(b.target_date).getFullYear() === currentYear
        }
        // Fallback: Created this year
        return new Date(b.created_at).getFullYear() === currentYear
    })

    // 2. Life: All active buckets (excluding achieved, effectively the backlog)
    const lifeBuckets = buckets.filter(b => b.status !== 'ACHIEVED')

    // 3. Completed: Status is ACHIEVED
    const completedBuckets = buckets.filter(b => b.status === 'ACHIEVED')

    const getDisplayedBuckets = () => {
        switch (activeTab) {
            case 'YEAR': return yearBuckets
            case 'LIFE': return lifeBuckets
            case 'DONE': return completedBuckets
            default: return []
        }
    }

    const displayedBuckets = getDisplayedBuckets()

    const tabs = [
        { id: 'YEAR', label: '올해의 버킷' },
        { id: 'LIFE', label: '인생의 버킷' },
        { id: 'DONE', label: '완료한 버킷' }
    ]

    return (
        <div className="space-y-12 pb-24">
            {/* Dashboard Section */}
            <section className="animate-fade-in-up">
                <LifeDashboard userStats={userStats} />
            </section>

            {/* Timeline Section - Only show if there are completed buckets */}
            {buckets.some(b => b.status === 'ACHIEVED') && (
                <section className="space-y-6">
                    <div className="flex items-center gap-4 font-mono-technical text-smoke ml-1">
                        <Film className="w-4 h-4 text-gold-film" />
                        <h2 className="text-[10px] tracking-widest uppercase">PRODUCTION_TIMELINE</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <CinematicTimeline buckets={buckets} />
                </section>
            )}

            {/* Tabs Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full w-fit mx-auto border border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                px-6 py-2 rounded-full text-sm font-display transition-all
                ${activeTab === tab.id
                                    ? 'bg-gold-film text-velvet shadow-warm font-bold'
                                    : 'text-smoke hover:text-celluloid'
                                }
              `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Section */}
                <div className="min-h-[300px]">
                    {displayedBuckets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-sm bg-white/5 border-dashed">
                            <p className="text-smoke mb-4 font-light">아직 기록된 필름이 없습니다.</p>
                            {activeTab !== 'DONE' && (
                                <Link href="/archive/new" className="px-6 py-3 bg-white/10 hover:bg-gold-film/20 text-gold-film rounded-sm text-sm transition-colors flex items-center gap-2">
                                    <Plus size={16} />
                                    새로운 꿈 기록하기
                                </Link>
                            )}
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {displayedBuckets.map((bucket) => (
                                <BucketCard
                                    key={bucket.id}
                                    bucket={bucket}
                                    onComplete={() => setCompletingBucket(bucket)}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Floating Action Button for Mobile / General */}
            <div className="fixed bottom-24 right-6 z-40 sm:hidden">
                <Link href="/archive/new" className="w-14 h-14 rounded-full bg-gold-film text-velvet shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Plus size={28} />
                </Link>
            </div>

            {/* Desktop Add Button (hidden on mobile since we have FAB) */}
            <div className="hidden sm:flex justify-center mt-8">
                <Link href="/archive/new" className="px-8 py-4 rounded-sm bg-gradient-to-r from-gold-warm/10 to-gold-film/10 border border-gold-film/30 text-gold-film hover:bg-gold-film/20 transition-all font-display">
                    + 새로운 꿈 추가하기 (New Reel)
                </Link>
            </div>
            <CompletionModal
                isOpen={!!completingBucket}
                onClose={() => setCompletingBucket(null)}
                onComplete={handleCompletionSubmit}
                bucketTitle={completingBucket?.title || ''}
            />
        </div>
    )
}
