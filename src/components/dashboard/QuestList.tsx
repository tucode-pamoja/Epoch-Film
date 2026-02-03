'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Star, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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

function QuestCard({ quest }: { quest: Quest }) {
    const percentage = (quest.progress / quest.requirement_count) * 100

    return (
        <div className={`group relative glass-warm border-none film-border rounded-sm p-5 shadow-deep transition-all ${quest.is_completed ? 'opacity-60' : 'hover:bg-white/5'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="mt-1">
                        {quest.is_completed ? (
                            <CheckCircle2 className="text-cyan-film w-5 h-5" />
                        ) : (
                            <Circle className="text-smoke w-5 h-5" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-display text-celluloid group-hover:text-gold-warm transition-colors">
                            {quest.title}
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
