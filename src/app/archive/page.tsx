import BucketList from '@/components/buckets/BucketList'
import { Button } from '@/components/ui/Button'
import { Suspense } from 'react'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { LifeDashboard } from '@/components/dashboard/LifeDashboard'
import { QuestList } from '@/components/dashboard/QuestList'
import { getUserStats, getActiveQuests } from './actions'

export default async function ArchivePage() {
  const stats = await getUserStats()
  const quests = await getActiveQuests()

  // Define default stats in case fetched stats are null/undefined
  const defaultStats = {
    level: 1,
    xp: 0,
    nextLevelXp: 500,
    streak: 0,
    completedDreams: 0,
    activeDreams: 0
  }

  return (
    <div className="min-h-screen bg-void p-6 sm:p-12 overflow-x-hidden selection:bg-gold-film/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-darkroom to-transparent pointer-events-none" />
      <div className="fixed top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gold-film/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-20">
        <header className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-8 animate-fade-in-up">
          <div className="space-y-4">
            <div className="font-mono-technical text-gold-film/60 tracking-[0.4em] mb-2 uppercase text-[10px]">제작 센터 (Production Center)</div>
            <h1 className="text-7xl font-display tracking-tight text-celluloid">
              My Epoch
            </h1>
            <p className="text-smoke font-light tracking-wide italic leading-relaxed w-full max-w-none">
              "당신의 삶은 당신이 제작할 가장 중요한 영화입니다."
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/hall-of-fame">
              <Button
                variant="outline"
                className="rounded-sm border-white/10 bg-white/5 text-smoke hover:text-celluloid"
                size="md"
              >
                <Trophy size={16} className="mr-2" />
                명예의 전당 (Hall of Fame)
              </Button>
            </Link>
            <Button
              href="/archive/new"
              className="rounded-sm px-10"
              size="md"
            >
              + 새 필름 추가 (New Reel)
            </Button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: Dashboard & Sequences */}
          <div className="lg:col-span-8 space-y-20">
            <section>
              <LifeDashboard userStats={stats || defaultStats} />
            </section>

            <section className="space-y-12">
              <Suspense fallback={<div className="text-smoke font-mono-technical animate-pulse">데이터를 불러오는 중... (LOADING_SEQUENCES)</div>}>
                <BucketList />
              </Suspense>
            </section>
          </div>

          {/* Sidebar: Quests & Activity */}
          <div className="lg:col-span-4 space-y-12">
            <section className="sticky top-12">
              <QuestList quests={quests || []} />

              <div className="mt-12 p-8 bg-darkroom/50 rounded-sm border border-white/5 film-border">
                <h3 className="font-mono-technical text-[10px] text-smoke tracking-widest uppercase mb-4">제작 노트 (Studio_Note)</h3>
                <p className="text-xs text-smoke/60 leading-relaxed font-light italic">
                  "작은 순간들을 포착하는 것을 잊지 마세요. 그것들은 종종 최종 편집본에서 가장 중요한 장면이 됩니다."
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
