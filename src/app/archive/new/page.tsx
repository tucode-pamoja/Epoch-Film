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
      className="w-full h-14 rounded-sm bg-gradient-to-r from-gold-warm to-gold-film text-velvet hover:from-gold-highlight hover:to-gold-warm font-display text-lg shadow-[0_4px_20px_-5px_rgba(212,175,55,0.4)] transition-all transform active:scale-95"
    >
      {pending ? '현상 중... (Developing)' : 'Scene 생성하기 (Create Scene)'}
    </Button>
  )
}

export default function NewBucketPage() {
  const [tags, setTags] = useState<string[]>([])
  const categories = ['TRAVEL', 'GROWTH', 'CAREER', 'Relationship', 'FOOD', 'OTHER']

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} className="bg-void">
      <div style={{ width: '100%', maxWidth: '640px' }} className="space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display text-celluloid">새로운 Scene (New Scene)</h1>
          <p className="text-smoke font-light text-sm">당신의 아카이브에 새로운 꿈을 기록하세요.</p>
        </div>

        <form action={createBucket} className="space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">제목 (TITLE)</label>
              <Input
                name="title"
                required
                placeholder="예: 발리에서 서핑 배우기"
                className="bg-white/10 border-white/20 h-11 rounded-sm text-celluloid placeholder:text-white/30 focus:border-gold-film/60 font-display glass-warm shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">Scene 종류 (TYPE)</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer group">
                  <input type="radio" name="sceneType" value="YEARLY" defaultChecked className="peer sr-only" />
                  <div className="w-full h-11 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[10px] font-mono-technical text-smoke/60 peer-checked:bg-gold-film/10 peer-checked:border-gold-film/40 peer-checked:text-gold-film transition-all hover:bg-white/10">
                    올해의 Scene
                  </div>
                </label>
                <label className="relative cursor-pointer group">
                  <input type="radio" name="sceneType" value="LIFE" className="peer sr-only" />
                  <div className="w-full h-11 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[10px] font-mono-technical text-smoke/60 peer-checked:bg-gold-film/10 peer-checked:border-gold-film/40 peer-checked:text-gold-film transition-all hover:bg-white/10">
                    My Epoch
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">카테고리 (CATEGORY)</label>
              <div className="relative">
                <select
                  name="category"
                  className="w-full h-11 bg-white/10 border-white/20 text-celluloid focus:border-gold-film/60 focus:ring-0 rounded-sm px-4 text-sm appearance-none cursor-pointer glass-warm font-mono-technical shadow-inner"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-darkroom text-celluloid">{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/50">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">설명 (DESCRIPTION)</label>
              <textarea
                name="description"
                rows={4}
                placeholder="꿈에 대한 상세 내용을 적어주세요..."
                className="w-full bg-white/10 border border-white/20 text-celluloid placeholder:text-white/30 focus:border-gold-film/60 focus:bg-white/10 focus:ring-0 transition-all rounded-sm px-4 py-3 text-sm resize-none outline-none glass-warm font-light leading-relaxed shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">태그 (TAGS)</label>
              <TagInput tags={tags} setTags={setTags} />
            </div>

            <input type="hidden" name="importance" value="3" />
          </div>

          <div className="pt-6 space-y-4">
            <SubmitButton />
            <Link href="/archive" className="block text-center text-xs font-mono-technical uppercase tracking-widest text-smoke/70 hover:text-gold-film transition-colors">
              취소 (Cancel)
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
