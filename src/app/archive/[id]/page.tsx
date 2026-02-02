import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Share2, MoreVertical, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CheckIn } from '@/components/archive/CheckIn'
import { LetterAction } from '@/components/archive/LetterAction'
import { RoadmapView } from '@/components/ai/RoadmapView'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BucketDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch bucket details
  const { data: bucket, error } = await supabase
    .from('buckets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !bucket) {
    notFound()
  }

  // Fetch memories (Check-in shots)
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('bucket_id', id)
    .order('created_at', { ascending: false })

  // Fetch letters (Time Capsule)
  const { data: letters } = await supabase
    .from('letters')
    .select('*')
    .eq('bucket_id', id)
    .order('open_date', { ascending: true })

  return (
    <div className="min-h-screen bg-background text-white p-6 sm:p-12 max-w-5xl mx-auto animate-fade-in-up">
      {/* Header Navigation */}
      <header className="flex items-center justify-between mb-12">
        <Link
          href="/archive"
          className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <div className="rounded-full bg-white/5 p-2 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm font-medium">Back to Archive</span>
        </Link>

        <div className="flex items-center gap-4">
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Bucket Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20">
                {bucket.category}
              </span>
              {bucket.is_pinned && (
                <div className="flex items-center gap-1 text-primary text-xs font-medium">
                  <Star size={12} fill="currentColor" />
                  <span>Selected Sequence</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-white text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
              {bucket.title}
            </h1>

            {bucket.description && (
              <p className="text-lg text-white/60 leading-relaxed font-light">
                {bucket.description}
              </p>
            )}

            {bucket.tags && bucket.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {bucket.tags.map((tag: string) => (
                  <span key={tag} className="text-sm text-white/30">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
          
          {/* AI Roadmap Section */}
          <section>
             <RoadmapView bucketId={bucket.id} roadmap={bucket.roadmap} />
          </section>

          {/* Memories Section */}
          <section>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Memories & Check-ins
            </h2>

            {memories && memories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {memories.map((memory: any) => (
                  <div key={memory.id} className="aspect-square bg-white/5 rounded-2xl overflow-hidden relative group">
                    <Image
                      src={memory.media_url}
                      alt={memory.caption || 'Memory'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <p className="text-white/40 mb-4 font-light">
                  No memories captured yet.
                </p>
                <Button className="rounded-full bg-white text-black hover:bg-white/90">
                  Check-in Now
                </Button>
              </div>
            )}
          </section>

           {/* Time Capsule Section */}
           <section className="pt-8 border-t border-white/5">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white/80">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              Time Capsule
            </h2>

            <div className="grid gap-4">
              {letters && letters.map((letter) => {
                const isOpenable = new Date(letter.open_date) <= new Date()
                return (
                  <div key={letter.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                    <div className={`p-3 rounded-full ${isOpenable ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/20'}`}>
                      <Mail size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">
                        {isOpenable ? 'Letter is ready to read' : 'Locked Letter'}
                      </p>
                      <p className="text-xs text-white/30">
                        {isOpenable ? `Unlocked on ${new Date(letter.open_date).toLocaleDateString()}` : `Unlocks on ${new Date(letter.open_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    {isOpenable && (
                      <Button className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg">
                        Read
                      </Button>
                    )}
                  </div>
                )
              })}

              <LetterAction bucketId={bucket.id} />
            </div>
           </section>
        </div>

            {/* Right Column: Actions & Stats */}
        <div className="space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-6 sticky top-8">
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {bucket.status === 'ACHIEVED' ? 'Completed' : 'In Progress'}
                </span>
                <div className={`w-3 h-3 rounded-full ${bucket.status === 'ACHIEVED' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]'}`} />
              </div>
            </div>

            <CheckIn bucketId={bucket.id} />
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-xs text-white/30 mb-1">Created</p>
                <p className="text-sm font-light">
                  {new Date(bucket.created_at).toLocaleDateString()}
                </p>
              </div>
               <div>
                <p className="text-xs text-white/30 mb-1">Target</p>
                <p className="text-sm font-light">
                  2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
