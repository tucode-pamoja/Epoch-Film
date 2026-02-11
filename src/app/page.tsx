
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { HomeClient } from '@/components/dashboard/HomeClient'
import { StarField } from '@/components/layout/StarField'
import { Suspense } from 'react'

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
    .select(`
      *, 
      users!user_id(nickname, profile_image_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-void selection:bg-gold-film/30 flex flex-col">
      <StarField />

      {/* Main Workspace - No Vertical Scroll */}
      <div className="relative z-10 flex-1 overflow-hidden px-6 sm:px-12 flex flex-col pt-4">
        <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-film border-t-transparent rounded-full animate-spin" /></div>}>
            <HomeClient
              buckets={buckets || []}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
