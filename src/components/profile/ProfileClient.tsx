'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Bookmark, Settings, PlayCircle, LogOut, Copy } from 'lucide-react'
import Link from 'next/link'
import { QuestList } from '@/components/dashboard/QuestList'
import clsx from 'clsx'
import { signOut } from '@/app/login/actions'
import { FollowButton } from '@/components/archive/FollowButton'

interface Bucket {
    id: string
    title: string
    thumbnail_url: string | null
    status: string
    category: string
    tickets?: number
    is_routine?: boolean
    routine_frequency?: string | null
    routine_days?: number[] | null
    original_bucket_id?: string | null
}

interface Quest {
    id: string
    title: string
    description: string
    xp_reward: number
    progress: number
    requirement_count: number
    is_completed: boolean
    is_claimed?: boolean
}

interface UserStats {
    level: number
    xp: number
    nextLevelXp: number
    streak: number
    completedDreams: number
    activeDreams: number
    followerCount: number
    followingCount: number
}

interface ProfileClientProps {
    user: any
    stats: UserStats
    buckets: Bucket[]
    quests: Quest[]
    isOwnProfile?: boolean
    currentUserId?: string
}

export function ProfileClient({ user, stats, buckets, quests, isOwnProfile = true, currentUserId }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'SCENES' | 'ROUTINES' | 'QUESTS' | 'SAVED'>('SCENES')
    const [localFollowerCount, setLocalFollowerCount] = useState(stats.followerCount)

    // Sync local state if stats change (e.g. on manual refresh or server revalidation completion)
    useEffect(() => {
        setLocalFollowerCount(stats.followerCount)
    }, [stats.followerCount])

    // Global Follow Sync Listener
    useEffect(() => {
        const handleSync = (e: any) => {
            if (e.detail.targetId === user.id) {
                setLocalFollowerCount(prev => e.detail.isFollowing ? prev + 1 : prev - 1)
            }
        }
        window.addEventListener('epoch-film:follow-sync', handleSync)
        return () => window.removeEventListener('epoch-film:follow-sync', handleSync)
    }, [user.id])

    // Calculate stats for display
    const sceneCount = buckets.length

    // Calculate total audience (tickets issued across all buckets)
    const audienceCount = buckets.reduce((acc, b) => acc + (b.tickets || 0), 0)

    const scriptCount = quests.length

    return (
        <div className="w-full max-w-5xl mx-auto min-h-screen pb-20 pt-8 sm:px-6">

            {/* 1. Director Profile Card */}
            <div className="mx-4 sm:mx-0 relative mb-12">
                {/* Card Background */}
                <div className="absolute inset-0 bg-darkroom/80 backdrop-blur-xl border border-white/5 rounded-sm shadow-huge z-0" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-0 pointer-events-none" />

                <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">

                    {/* Portrait Section (ID Photo Style) */}
                    <div className="shrink-0 relative group">
                        <div className="w-24 h-32 sm:w-32 sm:h-40 bg-black/50 overflow-hidden border border-white/10 shadow-lg relative rounded-[2px] rotate-[-1deg] group-hover:rotate-0 transition-transform duration-500">
                            {user.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt={user.email}
                                    className="w-full h-full object-cover filter sepia-[0.2] contrast-120 group-hover:sepia-0 transition-all duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20">
                                    <Film size={32} />
                                </div>
                            )}
                            {/* Film Perforations Overlay (Pseudo) */}
                            <div className="absolute left-1 top-0 bottom-0 w-[4px] border-r border-dashed border-white/20 opacity-50" />
                        </div>

                        {/* Level Badge */}
                        <div className="absolute -bottom-3 -right-3 bg-gold-film text-void px-3 py-1 text-[10px] font-mono-technical font-bold tracking-widest shadow-lg rotate-[2deg]">
                            DIR. LV.{stats.level}
                        </div>
                    </div>

                    {/* Director Info Section */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h2 className="text-[10px] font-mono-technical text-gold-film/80 tracking-[0.2em] uppercase mb-1">Director Identity</h2>
                                    <h1 className="text-3xl sm:text-4xl font-display text-celluloid tracking-wide">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </h1>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 shrink-0">
                                    {isOwnProfile ? (
                                        <>
                                            <button className="px-5 py-2 bg-white/5 hover:bg-gold-film/10 border border-white/10 hover:border-gold-film/30 text-white/80 hover:text-gold-film text-xs font-mono-technical tracking-widest uppercase transition-all">
                                                Edit Identity
                                            </button>
                                            <button
                                                onClick={() => signOut()}
                                                className="p-2 border border-white/10 hover:border-red-900/30 text-white/40 hover:text-red-400 transition-colors"
                                                title="로그아웃"
                                            >
                                                <LogOut size={16} />
                                            </button>
                                            <button className="p-2 border border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-colors">
                                                <Settings size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <FollowButton
                                            targetId={user.id}
                                            currentUserId={currentUserId}
                                            onFollowChange={(isFollowing) => {
                                                setLocalFollowerCount(prev => isFollowing ? prev + 1 : prev - 1)
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <p className="text-sm font-light text-smoke/70 italic max-w-3xl leading-relaxed">
                                "Documenting the cinematic moments of life. Every memory is a scene waiting to be directed."
                            </p>
                        </div>

                        {/* Production Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-8 py-6 border-t border-dashed border-white/10">
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono-technical text-smoke/40 uppercase tracking-widest">Filmography</span>
                                <div className="text-xl sm:text-2xl font-display text-white">{sceneCount} <span className="text-xs font-sans font-light text-smoke/30">SCENES</span></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono-technical text-smoke/40 uppercase tracking-widest">Audience</span>
                                <div className="text-xl sm:text-2xl font-display text-white">{localFollowerCount.toLocaleString()} <span className="text-xs font-sans font-light text-smoke/30">FANS</span></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono-technical text-smoke/40 uppercase tracking-widest">Directors</span>
                                <div className="text-xl sm:text-2xl font-display text-white">{stats.followingCount?.toLocaleString() || 0} <span className="text-xs font-sans font-light text-smoke/30">SUBS</span></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono-technical text-smoke/40 uppercase tracking-widest">Camera Roll</span>
                                <div className="text-xl sm:text-2xl font-display text-white">{stats.streak} <span className="text-xs font-sans font-light text-smoke/30">DAYS</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Navigation Tabs (Lens Switcher) */}
            <div className="sticky top-0 bg-void/90 backdrop-blur-md z-30 mb-8 border-y border-white/5 mx-[-1px]">
                <div className="max-w-md mx-auto flex justify-center items-center py-2">
                    <TabButton
                        isActive={activeTab === 'SCENES'}
                        onClick={() => setActiveTab('SCENES')}
                        label="FILMOGRAPHY"
                    />
                    <div className="w-px h-3 bg-white/10 mx-4" />
                    <TabButton
                        isActive={activeTab === 'ROUTINES'}
                        onClick={() => setActiveTab('ROUTINES')}
                        label="ROUTINES"
                    />
                    <div className="w-px h-3 bg-white/10 mx-4" />
                    <TabButton
                        isActive={activeTab === 'QUESTS'}
                        onClick={() => setActiveTab('QUESTS')}
                        label="MISSIONS"
                    />
                    <div className="w-px h-3 bg-white/10 mx-4" />
                    <TabButton
                        isActive={activeTab === 'SAVED'}
                        onClick={() => setActiveTab('SAVED')}
                        label="ARCHIVE"
                    />
                </div>
            </div>

            {/* 3. Content Grid (Contact Sheet) */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'SCENES' && (
                        <motion.div
                            key="SCENES"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-3 gap-1 md:gap-4 px-1 md:px-0"
                        >
                            {buckets.filter(b => !b.is_routine).map((bucket, i) => (
                                <Link
                                    href={`/archive/${bucket.id}`}
                                    key={bucket.id}
                                    className="relative aspect-square group bg-darkroom cursor-pointer overflow-hidden border border-white/5"
                                    style={{ transitionDelay: `${i * 50}ms` }}
                                >
                                    {bucket.thumbnail_url ? (
                                        <img
                                            src={bucket.thumbnail_url}
                                            alt={bucket.title}
                                            className="w-full h-full object-cover opacity-70 grayscale-[0.8] group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/5 group-hover:text-white/20 transition-colors">
                                            <Film size={24} />
                                        </div>
                                    )}

                                    {/* Metadata Overlay (On Hover) */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                                        <span className="text-[9px] font-mono-technical text-gold-film tracking-widest uppercase mb-1">{bucket.category}</span>
                                        <h3 className="text-white font-display text-sm tracking-wide line-clamp-1">{bucket.title}</h3>
                                        {bucket.original_bucket_id && (
                                            <div className="flex items-center gap-1 mt-1 text-purple-300">
                                                <Copy size={8} />
                                                <span className="text-[7px] font-mono-technical tracking-widest uppercase">REMAKE</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Dot */}
                                    {bucket.status === 'ACHIEVED' && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                            <div className="border-[2px] border-cyan-film/80 text-cyan-film px-4 py-1.5 -rotate-12 opacity-90 shadow-[0_0_20px_rgba(78,205,196,0.3)] backdrop-blur-[1px] bg-cyan-film/10">
                                                <span className="font-mono-technical text-[12px] sm:text-sm font-bold tracking-[0.25em] uppercase whitespace-nowrap">Completed</span>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            ))}

                            {/* Empty State */}
                            {buckets.filter(b => !b.is_routine).length === 0 && (
                                <div className="col-span-3 py-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-sm">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Film size={24} className="text-white/20" />
                                    </div>
                                    <p className="font-mono-technical text-xs tracking-[0.2em] text-smoke/50 uppercase mb-2">Reel is Empty</p>
                                    <p className="text-smoke/30 text-sm font-light">Start directing your first scene.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'ROUTINES' && (
                        <motion.div
                            key="ROUTINES_GRID"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-3 gap-1 md:gap-4 px-1 md:px-0"
                        >
                            {buckets.filter(b => b.is_routine).map((bucket, i) => (
                                <Link
                                    href={`/archive/${bucket.id}`}
                                    key={bucket.id}
                                    className="relative aspect-square group bg-darkroom cursor-pointer overflow-hidden border border-white/5"
                                    style={{ transitionDelay: `${i * 50}ms` }}
                                >
                                    {bucket.thumbnail_url ? (
                                        <img
                                            src={bucket.thumbnail_url}
                                            alt={bucket.title}
                                            className="w-full h-full object-cover opacity-70 grayscale-[0.8] group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/5 group-hover:text-white/20 transition-colors">
                                            <PlayCircle size={24} />
                                        </div>
                                    )}

                                    {/* Metadata Overlay (On Hover) */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-mono-technical text-cyan-film tracking-widest uppercase">{bucket.routine_frequency}</span>
                                        </div>
                                        <h3 className="text-white font-display text-sm tracking-wide line-clamp-1">{bucket.title}</h3>
                                        {bucket.original_bucket_id && (
                                            <div className="flex items-center gap-1 mt-1 text-purple-300">
                                                <Copy size={8} />
                                                <span className="text-[7px] font-mono-technical tracking-widest uppercase">REMAKE</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}

                            {/* Empty State */}
                            {buckets.filter(b => b.is_routine).length === 0 && (
                                <div className="col-span-3 py-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-sm">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <PlayCircle size={24} className="text-white/20" />
                                    </div>
                                    <p className="font-mono-technical text-xs tracking-[0.2em] text-smoke/50 uppercase mb-2">No Routines Set</p>
                                    <p className="text-smoke/30 text-sm font-light">Establish your daily creative production.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'QUESTS' && (
                        <motion.div
                            key="QUESTS"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-2xl mx-auto px-4"
                        >
                            <QuestList quests={quests} />
                        </motion.div>
                    )}

                    {activeTab === 'SAVED' && (
                        <motion.div
                            key="SAVED"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-32 flex flex-col items-center justify-center text-smoke/30 border border-dashed border-white/5 mx-4"
                        >
                            <Bookmark size={32} className="mb-4 opacity-20" />
                            <p className="font-mono-technical text-xs tracking-widest uppercase">Archive Locked</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function TabButton({ isActive, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-4 py-2 text-[10px] font-mono-technical tracking-[0.2em] uppercase transition-all relative",
                isActive ? "text-gold-film font-bold" : "text-smoke/40 hover:text-white"
            )}
        >
            {label}
            {isActive && (
                <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-film shadow-[0_0_10px_#C9A227]"
                    initial={false}
                />
            )}
        </button>
    )
}
