'use client'

import { createBucket } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TagInput } from '@/components/ui/TagInput'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full h-14 rounded-full bg-primary text-black hover:bg-primary/90 font-medium text-lg shadow-[0_4px_20px_-5px_rgba(212,175,55,0.4)] transition-all"
    >
      {pending ? 'Creating...' : 'Create Reel'}
    </Button>
  )
}

export default function NewBucketPage() {
  const [tags, setTags] = useState<string[]>([])
  const categories = ['TRAVEL', 'GROWTH', 'CAREER', 'Relationship', 'FOOD', 'OTHER']

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">New Reel</h1>
          <p className="text-white/40 font-light">Capture a new dream for your archive.</p>
        </div>

        <form action={createBucket} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5 ml-1">Title</label>
              <Input 
                name="title" 
                required 
                placeholder="e.g. Learn to Surf in Bali" 
                className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5 ml-1">Category</label>
              <div className="relative">
                <select 
                  name="category" 
                  className="w-full h-12 bg-white/[0.03] border border-white/10 text-white focus:border-primary/50 focus:ring-0 rounded-xl px-4 text-sm appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#1A1A20]">{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/30">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5 ml-1">Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Details about your dream..."
                className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-0 transition-all rounded-xl px-4 py-3 text-sm resize-none outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5 ml-1">Tags</label>
              <TagInput tags={tags} setTags={setTags} />
            </div>
            
            <input type="hidden" name="importance" value="3" />
          </div>

          <div className="pt-2 space-y-4">
            <SubmitButton />
            <Link href="/archive" className="block text-center text-sm text-white/30 hover:text-white transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
