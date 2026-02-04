
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { HomeClient } from '@/components/dashboard/HomeClient'
import { getUserStats } from './archive/actions'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: buckets } = await supabase
    .from('buckets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const stats = await getUserStats()

  return (
    <div className="min-h-screen bg-void p-6 sm:p-12 overflow-x-hidden selection:bg-gold-film/30">
      <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-darkroom to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10 space-y-12 pt-8">
        <header className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] mb-2 uppercase text-[10px]">제작 센터 (Production Center)</div>
          <h1 className="text-5xl sm:text-7xl font-display tracking-tight text-celluloid">
            My Epoch
          </h1>
        </header>

        <main>
          <HomeClient
            buckets={buckets || []}
            userStats={stats || { level: 1, xp: 0, nextLevelXp: 500, streak: 0, completedDreams: 0, activeDreams: 0 }}
          />
        </main>
      </div>
    </div>
  )
}
