'use client'

import { motion } from 'framer-motion'
import { Award, Star, Zap, Target, Bookmark, Crown, Flag, Camera } from 'lucide-react'

// Mock Badges Data
const BADGES = [
    {
        id: 'b1',
        title: 'Beginner Director',
        description: '첫 번째 필름을 생성했습니다.',
        icon: Camera,
        achievedAt: '2024.01.15',
        isAchieved: true,
        rarity: 'COMMON'
    },
    {
        id: 'b2',
        title: 'Achievement Unlocked',
        description: '첫 번째 꿈을 완료했습니다.',
        icon: Flag,
        achievedAt: '2024.03.20',
        isAchieved: true,
        rarity: 'RARE'
    },
    {
        id: 'b3',
        title: 'Consistent Dreamer',
        description: '30일 연속 체크인 달성.',
        icon: Zap,
        achievedAt: null,
        isAchieved: false,
        rarity: 'EPIC',
        progress: 70
    },
    {
        id: 'b4',
        title: 'Golden Age',
        description: '5개의 꿈을 완료했습니다.',
        icon: Crown,
        achievedAt: null,
        isAchieved: false,
        rarity: 'LEGENDARY',
        progress: 40
    },
    {
        id: 'b5',
        title: 'Genre Master',
        description: '3가지 다른 카테고리의 꿈을 완료.',
        icon: Target,
        achievedAt: '2024.06.10',
        isAchieved: true,
        rarity: 'RARE'
    },
    {
        id: 'b6',
        title: 'Collector',
        description: '100개의 티켓을 받았습니다.',
        icon: Bookmark,
        achievedAt: null,
        isAchieved: false,
        rarity: 'EPIC',
        progress: 15
    }
]

export function AwardsClient() {
    return (
        <div className=" pb-32 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {BADGES.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
              relative aspect-square rounded-full border-2 flex flex-col items-center justify-center p-4 text-center group
              ${badge.isAchieved
                                ? 'border-gold-film/50 bg-gold-film/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                : 'border-white/5 bg-white/[0.02] grayscale opacity-70'}
            `}
                    >
                        {/* Rarity Glow */}
                        {badge.isAchieved && (
                            <div className="absolute inset-0 rounded-full bg-gold-film/5 blur-xl group-hover:bg-gold-film/10 transition-colors" />
                        )}

                        <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                ${badge.isAchieved ? 'bg-gold-film text-velvet' : 'bg-white/10 text-white/30'}
                `}>
                            <badge.icon size={32} />
                        </div>

                        <h3 className={`font-display text-sm mb-1 ${badge.isAchieved ? 'text-gold-warm' : 'text-smoke'}`}>
                            {badge.title}
                        </h3>

                        <p className="text-[10px] text-smoke/60 font-light leading-tight px-2 break-keep">
                            {badge.description}
                        </p>

                        {/* Progress Bar for Locked Badges */}
                        {!badge.isAchieved && badge.progress && (
                            <div className="absolute bottom-8 w-1/2  h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-film/50" style={{ width: `${badge.progress}%` }} />
                            </div>
                        )}

                        {/* Date for Achieved */}
                        {badge.isAchieved && (
                            <div className="absolute bottom-8 text-[9px] font-mono-technical text-gold-film/50">
                                {badge.achievedAt}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
