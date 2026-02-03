'use client'

import { motion } from 'framer-motion'
import { Ticket, Trophy, Crown, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const HALL_OF_FAME_DATA = [
    {
        rank: 1,
        id: 'h1',
        user: { name: 'Dreamer_Sophie', title: 'Visionary Director' },
        bucket: {
            title: '나만의 독립서점 열기',
            category: 'CAREER',
            image: 'https://images.unsplash.com/photo-1507842217121-9e87bd229f2c',
            date: '2025.12.24',
            description: '3년의 준비 끝에, 망원동 골목에 작은 책방을 열었습니다.'
        },
        tickets: 1402
    },
    {
        rank: 2,
        id: 'h2',
        user: { name: 'Adventurer_Jin', title: 'Action Star' },
        bucket: {
            title: '알프스 몽블랑 등반',
            category: 'TRAVEL',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
            date: '2025.08.15',
            description: '내 생애 가장 높은 곳에서, 가장 뜨거운 커피를 마셨다.'
        },
        tickets: 985
    },
    {
        rank: 3,
        id: 'h3',
        user: { name: 'Chef_Min', title: 'Artistic Producer' },
        bucket: {
            title: '미슐랭 1스타 획득',
            category: 'CAREER',
            image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de',
            date: '2026.01.10',
            description: '포기하지 않았던 10년, 접시 위에 피어난 결실.'
        },
        tickets: 856
    }
]

export function HallOfFameClient() {
    return (
        <div className="space-y-16 pb-32 w-full">
            {/* 1st Place - Cinematic Spotlight */}
            <Link href={`/explore/${HALL_OF_FAME_DATA[0].id}`} className="block w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full aspect-[4/5] sm:aspect-video rounded-sm overflow-hidden border border-gold-film/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] group"
                >
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <img
                        src={HALL_OF_FAME_DATA[0].bucket.image}
                        alt={HALL_OF_FAME_DATA[0].bucket.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />

                    {/* Gold Frame Overlay */}
                    <div className="absolute inset-0 border-[3px] border-gold-film/20 m-4 z-20 pointer-events-none" />
                    <div className="absolute top-8 left-0 right-0 text-center z-20 flex flex-col items-center">
                        <Crown className="text-gold-film drop-shadow-glow animate-pulse" size={40} strokeWidth={1.5} />
                        <div className="font-mono-technical text-gold-film tracking-[0.5em] text-xs mt-2 uppercase">Best Picture of the Month</div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 text-center">
                        <h2 className="text-4xl sm:text-5xl font-display text-gold-warm mb-3">{HALL_OF_FAME_DATA[0].bucket.title}</h2>
                        <p className="text-smoke/80 font-light text-sm max-w-2xl mx-auto mb-6 leading-relaxed break-keep">"{HALL_OF_FAME_DATA[0].bucket.description}"</p>

                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-gold-film">
                                <Ticket size={18} fill="currentColor" />
                                <span className="font-mono-technical text-lg font-bold">{HALL_OF_FAME_DATA[0].tickets.toLocaleString()}</span>
                            </div>
                            <div className="h-4 w-px bg-white/20" />
                            <div className="text-sm font-display text-celluloid">Directed by {HALL_OF_FAME_DATA[0].user.name}</div>
                        </div>
                    </div>
                </motion.div>
            </Link>

            {/* 2nd & 3rd Place */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {HALL_OF_FAME_DATA.slice(1).map((item, index) => (
                    <Link href={`/explore/${item.id}`} key={item.id} className="block">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.2) }}
                            className="relative bg-velvet border border-white/5 rounded-sm p-6 flex flex-col items-center text-center group hover:border-white/20 transition-colors h-full"
                        >
                            <div className="absolute top-4 right-4 font-mono-technical text-4xl text-white/5 font-bold z-0">
                                0{item.rank}
                            </div>

                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 mb-4 z-10 relative">
                                <img src={item.bucket.image} alt={item.bucket.title} className="w-full h-full object-cover" />
                            </div>

                            <div className="space-y-2 z-10 relative">
                                <div className="text-[10px] font-mono-technical text-smoke uppercase tracking-widest">{item.bucket.category}</div>
                                <h3 className="text-xl font-display text-celluloid group-hover:text-gold-film transition-colors">{item.bucket.title}</h3>
                                <div className="text-xs text-smoke/60">by {item.user.name}</div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-smoke/80 bg-white/5 px-4 py-2 rounded-full">
                                <Ticket size={14} />
                                <span className="font-mono-technical text-sm">{item.tickets.toLocaleString()} Tickets</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Hall of Fame List (Rank 4-10) Placeholder */}
            <div className="border-t border-white/10 pt-10">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="font-display text-2xl text-celluloid">Honorable Mentions</h3>
                    <div className="font-mono-technical text-[10px] text-smoke">TOP 10</div>
                </div>

                <div className="space-y-4">
                    {[4, 5, 6, 7].map((rank) => (
                        <Link href={`/explore/h${rank}`} key={rank} className="block">
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-sm hover:bg-white/[0.05] transition-colors group">
                                <div className="flex items-center gap-6">
                                    <span className="font-mono-technical text-smoke/50 w-6">0{rank}</span>
                                    <div className="w-10 h-10 bg-darkroom rounded-sm overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm text-celluloid group-hover:text-gold-film transition-colors">Hidden Dream No.{rank}</div>
                                        <div className="text-[10px] text-smoke">Unknown Director</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-smoke/40">
                                    <Ticket size={12} />
                                    <span className="text-xs font-mono-technical">---</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
