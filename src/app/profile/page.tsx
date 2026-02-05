import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserStats, getActiveQuests } from '../archive/actions'
import { User, Mail, Calendar, Settings, LogOut, ChevronRight, Award, X } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '../login/actions'
import { LifeDashboard } from '@/components/dashboard/LifeDashboard'
import { QuestList } from '@/components/dashboard/QuestList'
import { StarField } from '@/components/layout/StarField'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const stats = await getUserStats()
    const quests = await getActiveQuests()

    const defaultStats = {
        level: 1,
        xp: 0,
        nextLevelXp: 500,
        streak: 0,
        completedDreams: 0,
        activeDreams: 0
    }

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-void selection:bg-gold-film/30 flex flex-col">
            <StarField />

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-darkroom to-transparent pointer-events-none z-0" />

            <div className="relative z-10 flex-1 overflow-hidden px-6 sm:px-12 pt-12 sm:pt-16">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <main className="grid grid-cols-1 lg:grid-cols-3 gap-12 flex-1 overflow-hidden">
                        <div className="lg:col-span-2 space-y-12 overflow-y-auto no-scrollbar pb-32">
                            <section>
                                <LifeDashboard userStats={stats || defaultStats} />
                            </section>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/awards" className="block p-6 glass-warm rounded-sm border border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-gold-film opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Award className="text-gold-film/60 group-hover:text-gold-film transition-colors" size={20} />
                                            <span className="text-smoke/80 font-display text-sm group-hover:text-celluloid">명예의 전당 (Awards)</span>
                                        </div>
                                        <ChevronRight size={16} className="text-smoke/20 group-hover:text-gold-film transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <form action={signOut}>
                                    <button type="submit" className="w-full p-6 h-full flex items-center justify-between glass-warm rounded-sm border border-white/5 hover:bg-red-950/10 text-smoke/40 hover:text-red-400/80 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <LogOut size={20} className="opacity-40 group-hover:opacity-100" />
                                            <span className="font-display text-sm">로그아웃 (Sign_Out)</span>
                                        </div>
                                        <X size={14} className="opacity-10 group-hover:opacity-40" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-1 overflow-y-auto no-scrollbar pb-32">
                            <QuestList quests={quests || []} />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
