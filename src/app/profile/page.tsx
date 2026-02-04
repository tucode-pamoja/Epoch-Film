import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserStats } from '../archive/actions'
import { User, Mail, Calendar, Settings, LogOut, ChevronRight, Award, X } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '../login/actions'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const stats = await getUserStats()

    return (
        <div className="min-h-screen bg-void p-6 sm:p-12 overflow-x-hidden selection:bg-gold-film/30">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-darkroom to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 space-y-12 pt-8">
                <header className="flex flex-col items-center text-center space-y-8 animate-fade-in-up">
                    <div className="font-mono-technical text-gold-film/40 tracking-[0.4em] uppercase text-[10px] mb-2">감독 프로필 (Director_Profile)</div>

                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-2 border-gold-film/30 p-1 overflow-hidden shadow-[0_0_50px_rgba(201,162,39,0.15)] group-hover:border-gold-film transition-colors duration-500">
                            <div className="w-full h-full rounded-full bg-darkroom/50 flex items-center justify-center text-smoke/20 overflow-hidden backdrop-blur-sm">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-smoke/10" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2.5 bg-velvet border border-white/10 text-gold-film rounded-full shadow-huge hover:scale-110 transition-transform cursor-pointer">
                            <Settings size={16} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-display text-celluloid tracking-tight">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-smoke/40 font-mono-technical text-[9px] uppercase tracking-widest">
                            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><Mail size={12} className="text-gold-film/40" /> {user.email}</span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"><Calendar size={12} className="text-gold-film/40" /> 가입일: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Card */}
                    <div className="md:col-span-2 glass-film p-10 rounded-sm film-border space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <User size={120} />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <h2 className="font-mono-technical text-gold-film/80 text-[10px] tracking-[0.3em] uppercase underline underline-offset-8">커리어 요약 (Career_Summary)</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 relative z-10">
                            <div className="space-y-2">
                                <div className="text-[9px] font-mono-technical text-smoke/30 uppercase tracking-widest">LEVEL</div>
                                <div className="text-4xl font-display text-celluloid">{stats?.level || 1}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[9px] font-mono-technical text-smoke/30 uppercase tracking-widest">STREAK</div>
                                <div className="text-4xl font-display text-celluloid">{stats?.streak || 0}일</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[9px] font-mono-technical text-smoke/30 uppercase tracking-widest">ACHIEVED</div>
                                <div className="text-4xl font-display text-celluloid">{stats?.completedDreams || 0}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[9px] font-mono-technical text-smoke/30 uppercase tracking-widest">XP</div>
                                <div className="text-4xl font-display text-celluloid">{stats?.xp || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-4">
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
                            <button type="submit" className="w-full p-6 flex items-center justify-between glass-warm rounded-sm border border-white/5 hover:bg-red-950/10 text-smoke/40 hover:text-red-400/80 transition-all group">
                                <div className="flex items-center gap-4">
                                    <LogOut size={20} className="opacity-40 group-hover:opacity-100" />
                                    <span className="font-display text-sm">로그아웃 (Sign_Out)</span>
                                </div>
                                <X size={14} className="opacity-10 group-hover:opacity-40" />
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    )
}
