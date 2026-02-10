'use client'

import { motion } from 'framer-motion'
import { Zap, Target, Film, Flame } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LifeDashboardProps {
    userStats: {
        level: number
        xp: number
        nextLevelXp: number
        streak: number
        completedDreams: number
        activeDreams: number
    }
}

export function LifeDashboard({ userStats }: LifeDashboardProps) {
    const xpPercentage = (userStats.xp / userStats.nextLevelXp) * 100

    return (
        <section className="w-full space-y-8 animate-fade-in-up">
            {/* Level & XP Bar */}
            <div className="glass-film border-none film-border rounded-sm p-8 shadow-deep relative overflow-hidden">
                <div className="absolute top-0 right-10 opacity-10 pointer-events-none">
                    <Zap size={120} className="text-gold-film" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="font-mono-technical text-gold-film tracking-[0.3em] text-[10px]">감독 레벨 (DIRECTOR_LEVEL)</div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-8xl font-display text-celluloid leading-none">{userStats.level}</span>
                            <span className="text-smoke font-mono-technical uppercase tracking-widest text-xs">인생의 연출가 (Master of Epochs)</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-xl space-y-3">
                        <div className="flex justify-between font-mono-technical text-[9px] text-smoke uppercase tracking-widest whitespace-nowrap gap-4">
                            <span>경험치 (XP)</span>
                            <span>{userStats.xp} / {userStats.nextLevelXp} XP</span>
                        </div>
                        <div className="h-1.5 w-full bg-darkroom/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-gold-film to-gold-highlight shadow-[0_0_10px_rgba(201,162,39,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    icon={<Flame className="text-orange-film" />}
                    label="CAMERA STREAK"
                    value={`${userStats.streak}일`}
                    subValue="카메라를 계속 돌리세요"
                />
                <StatCard
                    icon={<Target className="text-cyan-film" />}
                    label="COMPLETED SCENES"
                    value={userStats.completedDreams}
                    subValue="아카이브된 최종 편집본"
                />
                <StatCard
                    icon={<Film className="text-gold-film" />}
                    label="ACTIVE PRODUCTION"
                    value={userStats.activeDreams}
                    subValue="현재 프로덕션 진행 중"
                />
                <StatCard
                    icon={<Zap className="text-purple-dusk" />}
                    label="DIRECTOR XP"
                    value={userStats.xp}
                    subValue="감독 커리어 합계"
                />
            </div>
        </section>
    )
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) {
    return (
        <div className="glass-warm border-none film-border rounded-sm p-6 shadow-deep group hover:bg-white/5 transition-colors flex flex-col h-full min-h-[160px]">
            <div className="flex-1">
                <div className="mb-4">
                    <div className="inline-flex p-2 bg-white/5 rounded-sm group-hover:bg-white/10 transition-colors">
                        {icon}
                    </div>
                </div>
                <div className="space-y-1 mb-4">
                    <span className="block font-mono-technical text-[9px] text-smoke tracking-widest uppercase leading-tight">{label}</span>
                    <div className="text-3xl font-display text-celluloid">{value}</div>
                </div>
            </div>
            <p className="text-[10px] text-smoke/50 font-light tracking-wide italic border-t border-white/5 pt-3 mt-auto">{subValue}</p>
        </div>
    )
}
