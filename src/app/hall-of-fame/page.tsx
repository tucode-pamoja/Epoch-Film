import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/community/Badge'
import { BadgeCelebration } from '@/components/community/BadgeCelebration'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { simulateAwardBadge } from './actions'

const ALL_BADGES = [
  { type: 'FIRST_REEL', label: 'First Frame', description: 'Created your first bucket list item.' },
  { type: 'DREAMER', label: 'The Dreamer', description: 'Added 10 items to your archive.' },
  { type: 'TRAVELER', label: 'Wanderlust', description: 'Completed a travel category goal.' },
  { type: 'PHOTOGRAPHER', label: 'Shutterbug', description: 'Uploaded 5 Check-in memories.' },
  { type: 'EARLY_BIRD', label: 'Early Bird', description: 'Joined Epoch Film in the first month.' },
]

export default async function HallOfFamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user?.id)

  const unlockedTypes = new Set(achievements?.map(a => a.badge_type))

  return (
    <div className="min-h-screen bg-background text-white p-6 sm:p-12">
      <BadgeCelebration />
      
      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/archive" 
            className="rounded-full bg-white/5 p-3 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Hall of Fame</h1>
            <p className="text-white/40">Your collection of milestones and memories.</p>
          </div>
        </div>
        
        <form action={async () => {
          'use server'
          await simulateAwardBadge('FIRST_REEL')
        }}>
          <Button className="bg-white/10 hover:bg-white/20 text-xs h-8">
            Simulate 'First Frame' Unlock
          </Button>
        </form>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ALL_BADGES.map((badge) => {
             const achievement = achievements?.find(a => a.badge_type === badge.type)
             return (
               <Badge 
                 key={badge.type}
                 {...badge}
                 unlocked={unlockedTypes.has(badge.type)}
                 date={achievement?.earned_at}
               />
             )
          })}
        </div>
      </main>
    </div>
  )
}
