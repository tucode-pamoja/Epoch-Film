'use client'

import { createBucket } from '../actions'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/ui/TagInput'
import { useState, Suspense } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { CinematicScriptInput } from '@/components/archive/CinematicScriptInput'

function NewBucketForm() {
  const [tags, setTags] = useState<string[]>([])
  const [sceneType, setSceneType] = useState<'YEARLY' | 'LIFE' | 'ROUTINE'>('YEARLY')
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const categories = ['TRAVEL', 'GROWTH', 'CAREER', 'Relationship', 'FOOD', 'OTHER']

  return (
    <div className="w-full space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-display text-celluloid">새로운 Scene (New Scene)</h1>
        <p className="text-smoke font-light text-sm">당신의 아카이브에 새로운 꿈을 기록하세요.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-sm text-red-500 text-xs font-mono-technical uppercase tracking-widest text-center animate-shake">
          {error}
        </div>
      )}

      <form action={createBucket} className="space-y-6">
        <div className="space-y-6">
          {/* Cinematic Script Input (Title & Description) */}
          <CinematicScriptInput />

          <div>
            <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">Scene 종류 (TYPE)</label>
            <div className="grid grid-cols-3 gap-3">
              <label className="relative cursor-pointer group">
                <input type="radio" name="sceneType" value="YEARLY" checked={sceneType === 'YEARLY'} onChange={(e) => setSceneType(e.target.value as any)} className="peer sr-only" />
                <div className="w-full h-11 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[10px] font-mono-technical text-smoke/60 peer-checked:bg-gold-film/10 peer-checked:border-gold-film/40 peer-checked:text-gold-film transition-all hover:bg-white/10">
                  올해의 Scene
                </div>
              </label>
              <label className="relative cursor-pointer group">
                <input type="radio" name="sceneType" value="LIFE" checked={sceneType === 'LIFE'} onChange={(e) => setSceneType(e.target.value as any)} className="peer sr-only" />
                <div className="w-full h-11 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[10px] font-mono-technical text-smoke/60 peer-checked:bg-gold-film/10 peer-checked:border-gold-film/40 peer-checked:text-gold-film transition-all hover:bg-white/10">
                  My Epoch
                </div>
              </label>
              <label className="relative cursor-pointer group">
                <input type="radio" name="sceneType" value="ROUTINE" checked={sceneType === 'ROUTINE'} onChange={(e) => setSceneType(e.target.value as any)} className="peer sr-only" />
                <div className="w-full h-11 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[10px] font-mono-technical text-smoke/60 peer-checked:bg-gold-film/10 peer-checked:border-gold-film/40 peer-checked:text-gold-film transition-all hover:bg-white/10">
                  Production Routine
                </div>
              </label>
            </div>
          </div>

          {sceneType === 'ROUTINE' && (
            <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div>
                <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-3 ml-1">반복 주기 (CYCLE)</label>
                <div className="flex gap-2">
                  {['DAILY', 'WEEKLY', 'MONTHLY'].map(freq => (
                    <label key={freq} className="flex-1 cursor-pointer">
                      <input type="radio" name="routineFrequency" value={freq} checked={freq === frequency} onChange={(e) => setFrequency(e.target.value as any)} className="peer sr-only" />
                      <div className="h-10 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[9px] font-mono-technical text-smoke/40 peer-checked:border-cyan-film/50 peer-checked:bg-cyan-film/5 peer-checked:text-cyan-film transition-all">
                        {freq}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {frequency === 'WEEKLY' && (
                <div>
                  <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-3 ml-1">촬영 요일 (SHOOTING DAYS)</label>
                  <div className="flex justify-between gap-1">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
                      <label key={day} className="flex-1 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="routineDays"
                          value={idx}
                          checked={selectedDays.includes(idx)}
                          onChange={() => {
                            setSelectedDays(prev =>
                              prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
                            )
                          }}
                          className="peer sr-only"
                        />
                        <div className="aspect-square flex flex-col items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[9px] font-mono-technical text-smoke/40 peer-checked:border-gold-film/50 peer-checked:bg-gold-film/10 peer-checked:text-gold-film transition-all group-hover:bg-white/10 overflow-hidden relative">
                          <span className="relative z-10">{day}</span>
                          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gold-film opacity-0 peer-checked:opacity-100" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">카테고리 (CATEGORY)</label>
            <div className="relative">
              <select
                name="category"
                className="w-full h-11 bg-white/10 border-white/20 text-celluloid focus:border-gold-film/60 focus:ring-0 rounded-sm px-4 text-sm appearance-none cursor-pointer glass-warm font-mono-technical shadow-inner"
                required
                defaultValue=""
              >
                <option value="" disabled className="bg-darkroom text-smoke/40">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-darkroom text-celluloid">{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/50">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-[10px] font-mono-technical text-gold-warm/80 uppercase tracking-widest mb-2 ml-1">태그 (TAGS)</label>
            <TagInput tags={tags} setTags={setTags} />
            <input type="hidden" name="tags" value={JSON.stringify(tags)} />
          </div>

          <input type="hidden" name="importance" value="3" />
        </div>

        <div className="pt-6 space-y-4 text-center pb-4">
          <SubmitButton />
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="inline-block text-xs font-mono-technical uppercase tracking-widest text-smoke/70 hover:text-gold-film transition-colors"
          >
            취소 (Cancel)
          </button>
        </div>
      </form>
    </div>
  )
}

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
  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto bg-void">
      <div className="w-full max-w-[640px] mx-auto pt-10 px-6 pb-36">
        <Suspense fallback={<div className="text-gold-film font-mono-technical animate-pulse text-center">LOADING_SCRIPT...</div>}>
          <NewBucketForm />
        </Suspense>
      </div>
    </div>
  )
}
