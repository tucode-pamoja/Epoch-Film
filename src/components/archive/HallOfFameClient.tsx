'use client'

import { motion } from 'framer-motion'
import { Ticket, Trophy, Crown, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface HallOfFameClientProps {
    initialBuckets: any[]
}

export function HallOfFameClient({ initialBuckets }: HallOfFameClientProps) {
    if (!initialBuckets || initialBuckets.length === 0) {
        return (
            <div className="text-center py-32 bg-darkroom/30 rounded-sm border border-white/5 backdrop-blur-xl">
                <Sparkles className="mx-auto mb-6 text-gold-film/20 animate-pulse" size={48} />
                <p className="text-smoke font-display italic tracking-wide">"아직 첫 번째 시나리오를 기다리고 있습니다."</p>
                <div className="mt-4 font-mono-technical text-[9px] text-smoke/40 tracking-[0.3em] uppercase">No masterpieces found in focus.</div>
            </div>
        )
    }

    const first = initialBuckets[0]
    const runnersUp = initialBuckets.slice(1, 3)
    const honorableMentions = initialBuckets.slice(3)

    return (
        <div className="space-y-16 pb-32 w-full">
            {/* 1st Place - Cinematic Spotlight */}
            <Link href={`/archive/${first.id}`} className="block w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full aspect-[4/5] sm:aspect-video rounded-sm overflow-hidden border border-gold-film/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] group"
                >
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <img
                        src={first.thumbnail_url || 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7'}
                        alt={first.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />

                    {/* Gold Frame Overlay */}
                    <div className="absolute inset-0 border-[3px] border-gold-film/20 m-4 z-20 pointer-events-none" />
                    <div className="absolute top-8 left-0 right-0 text-center z-20 flex flex-col items-center">
                        <Crown className="text-gold-film drop-shadow-glow animate-pulse" size={40} strokeWidth={1.5} />
                        <div className="font-mono-technical text-gold-film tracking-[0.5em] text-xs mt-2 uppercase">Best Picture of the Month</div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 text-center">
                        <h2 className="text-4xl sm:text-5xl font-display text-gold-warm mb-3">{first.title}</h2>
                        <p className="text-smoke/80 font-light text-sm max-w-2xl mx-auto mb-6 leading-relaxed break-keep truncate">
                            {first.description || "The journey of documentation has begun."}
                        </p>

                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-gold-film">
                                <Ticket size={18} fill="currentColor" />
                                <span className="font-mono-technical text-lg font-bold">{first.tickets?.toLocaleString() || 0}</span>
                            </div>
                            <div className="h-4 w-px bg-white/20" />
                            <div className="text-sm font-display text-celluloid">Directed by {first.users?.nickname || 'Unknown'}</div>
                        </div>
                    </div>
                </motion.div>
            </Link>

            {/* 2nd & 3rd Place */}
            {runnersUp.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {runnersUp.map((item, index) => (
                        <Link href={`/archive/${item.id}`} key={item.id} className="block">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.2) }}
                                className="relative bg-velvet border border-white/5 rounded-sm p-6 flex flex-col items-center text-center group hover:border-white/20 transition-colors h-full"
                            >
                                <div className="absolute top-4 right-4 font-mono-technical text-4xl text-white/5 font-bold z-0">
                                    0{index + 2}
                                </div>

                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 mb-4 z-10 relative bg-darkroom">
                                    <img src={item.thumbnail_url || '/placeholder-poster.jpg'} alt={item.title} className="w-full h-full object-cover" />
                                </div>

                                <div className="space-y-2 z-10 relative">
                                    <div className="text-[10px] font-mono-technical text-smoke uppercase tracking-widest">{item.category}</div>
                                    <h3 className="text-xl font-display text-celluloid group-hover:text-gold-film transition-colors">{item.title}</h3>
                                    <div className="text-xs text-smoke/60">by {item.users?.nickname || 'Unknown'}</div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-smoke/80 bg-white/5 px-4 py-2 rounded-full">
                                    <Ticket size={14} />
                                    <span className="font-mono-technical text-sm">{item.tickets?.toLocaleString() || 0} Tickets</span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Hall of Fame List (Rank 4+) */}
            {honorableMentions.length > 0 && (
                <div className="border-t border-white/10 pt-10">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="font-display text-2xl text-celluloid">Honorable Mentions</h3>
                        <div className="font-mono-technical text-[10px] text-smoke">ARCHIVE</div>
                    </div>

                    <div className="space-y-4">
                        {honorableMentions.map((item, index) => (
                            <Link href={`/archive/${item.id}`} key={item.id} className="block">
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-sm hover:bg-white/[0.05] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <span className="font-mono-technical text-smoke/50 w-6">{(index + 4).toString().padStart(2, '0')}</span>
                                        <div className="w-10 h-10 bg-darkroom rounded-sm overflow-hidden">
                                            {item.thumbnail_url ? (
                                                <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm text-celluloid group-hover:text-gold-film transition-colors">{item.title}</div>
                                            <div className="text-[10px] text-smoke">{item.users?.nickname || 'Unknown Director'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-smoke/40">
                                        <Ticket size={12} />
                                        <span className="text-xs font-mono-technical">{item.tickets?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
