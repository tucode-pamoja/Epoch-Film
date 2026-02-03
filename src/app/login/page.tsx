'use client'

import { login, signup } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-void overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-gold-film/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-cyan-film/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[450px] animate-fade-in-up">
        {/* Cinema Ticket Container */}
        <div className="bg-velvet rounded-sm shadow-deep border-none overflow-hidden film-border pt-12 pb-12 px-8 sm:px-12 relative">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="font-mono-technical text-gold-film/60 tracking-[0.3em] mb-4 text-[10px]">
              접근 제한 구역 (Access Forbidden Area)
            </div>
            <h2 className="text-5xl font-display text-celluloid mb-4">
              The Archive
            </h2>
            <p className="text-[10px] text-smoke font-light uppercase tracking-widest leading-relaxed">
              기록을 열람하기 위해 본인 인증이 필요합니다.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-3 bg-red-950/20 border border-red-900/30 text-[10px] text-red-400 text-center font-mono-technical">
              // 오류: {error === 'Invalid login credentials' ? '잘못된 로그인 정보입니다.' : error.toUpperCase()}
            </div>
          )}

          <form className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="font-mono-technical text-[9px] text-smoke ml-1 tracking-widest">사용자 식별 (EMAIL)</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@domain.com"
                  className="bg-void/50 border-white/5 focus:border-gold-film/40 h-12"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="font-mono-technical text-[9px] text-smoke ml-1 tracking-widest">액세스 키 (PASSWORD)</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="bg-void/50 border-white/5 focus:border-gold-film/40 h-12"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Button
                formAction={login}
                className="w-full h-12 rounded-sm"
                size="lg"
              >
                인증하기 (Authenticate)
              </Button>

              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-white/5" />
                <span className="absolute bg-velvet px-4 font-mono-technical text-[9px] text-smoke">또는 (OR)</span>
              </div>

              <Button
                formAction={signup}
                variant="outline"
                className="w-full h-12 rounded-sm border-white/5 text-smoke hover:text-celluloid"
                size="lg"
              >
                새 프로필 생성
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center font-mono-technical text-[10px] text-smoke hover:text-gold-film/60 transition-colors cursor-pointer tracking-widest">
          액세스 키를 잊어버리셨나요? (RESET_ACCESS_KEY)
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
