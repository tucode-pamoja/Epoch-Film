'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Star, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { claimQuestReward } from '@/app/archive/actions'

interface Quest {
    id: string
    title: string
    description: string
    xp_reward: number
    progress: number
    requirement_count: number
    is_completed: boolean
}

interface QuestListProps {
    quests: Quest[]
}

export function QuestList({ quests }: QuestListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 font-mono-technical text-smoke">
                <Award className="w-4 h-4 text-gold-film" />
                <h2 className="text-[10px] tracking-widest uppercase">수행 중인 미션 (ACTIVE_QUESTS)</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid gap-4">
                {quests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                ))}
            </div>

            {quests.length === 0 && (
                <div className="p-8 border border-dashed border-white/10 rounded-sm text-center">
                    <p className="text-smoke italic text-xs uppercase tracking-widest">새로운 미션이 곧 추가될 예정입니다.</p>
                </div>
            )}
        </div>
    )
}

function QuestCard({ quest }: { quest: any }) {
    const [isClaiming, setIsClaiming] = useState(false)
    const percentage = (quest.progress / quest.requirement_count) * 100

    const handleClaim = async () => {
        if (isClaiming) return
        setIsClaiming(true)
        try {
            await claimQuestReward(quest.id)
        } catch (error) {
            console.error('Failed to claim reward:', error)
        } finally {
            setIsClaiming(false)
        }
    }

    return (
        <div className={`group relative glass-warm border-none film-border rounded-sm p-5 shadow-deep transition-all ${quest.is_claimed ? 'opacity-40' : 'hover:bg-white/5'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="mt-1">
                        {quest.is_completed ? (
                            <CheckCircle2 className="text-cyan-film w-5 h-5 shadow-[0_0_10px_rgba(78,205,196,0.3)]" />
                        ) : (
                            <Circle className="text-smoke w-5 h-5" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-display text-celluloid group-hover:text-gold-warm transition-colors">
                            {quest.title_ko || quest.title}
                        </h3>
                        <p className="text-xs text-smoke font-light leading-relaxed">
                            {quest.description}
                        </p>
                    </div>
                </div>

                <div className="text-right space-y-1 min-w-[80px]">
                    <div className="flex items-center justify-end gap-1 font-mono-technical text-gold-film text-xs">
                        <Star size={12} fill="currentColor" />
                        <span>+{quest.xp_reward} XP</span>
                    </div>
                    <div className="text-[10px] font-mono-technical text-smoke/50 uppercase">
                        {quest.progress} / {quest.requirement_count}
                    </div>
                </div>
            </div>

            {quest.is_completed && !quest.is_claimed && (
                <div className="mt-4">
                    <Button
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className="w-full bg-gold-film/10 text-gold-film border border-gold-film/30 hover:bg-gold-film hover:text-void rounded-sm py-2 text-[10px] uppercase tracking-widest font-bold"
                    >
                        {isClaiming ? '시네마 보상 처리 중...' : '보상 받기 (CLAIM_REWARD)'}
                    </Button>
                </div>
            )}

            {!quest.is_completed && (
                <div className="mt-4 h-1 w-full bg-darkroom rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-gold-film"
                    />
                </div>
            )}
        </div>
    )
}
