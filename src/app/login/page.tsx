'use client'

import { login, signup, signInWithGoogle, signInWithKakao } from './actions'
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

          {/* Social Login Section */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="text-center mb-5">
              <span className="font-mono-technical text-[9px] text-smoke tracking-widest">소셜 계정으로 로그인 (SOCIAL LOGIN)</span>
            </div>

            <div className="space-y-3">
              {/* Google Login */}
              <form action={signInWithGoogle}>
                <button
                  type="submit"
                  className="w-full h-12 rounded-sm bg-white hover:bg-gray-100 text-gray-800 font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Google로 계속하기</span>
                </button>
              </form>

              {/* Kakao Login */}
              <form action={signInWithKakao}>
                <button
                  type="submit"
                  className="w-full h-12 rounded-sm bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#191919"
                      d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 00-.656-.678l-1.928 1.866V9.282a.472.472 0 00-.944 0v2.557a.471.471 0 000 .222v2.218a.472.472 0 00.944 0v-1.845l.378-.364 1.82 2.509a.472.472 0 00.764-.554l-1.848-2.965zm-3.583-1.655a.472.472 0 00-.472.472v4.278a.472.472 0 00.472.472h1.944a.472.472 0 100-.944h-1.472V9.877a.472.472 0 00-.472-.472zm-2.722 3.005a.472.472 0 100 .944h1.88a.472.472 0 100-.944h-1.88zm0-1.416a.472.472 0 100 .944h1.88a.472.472 0 100-.944h-1.88zm0-1.472a.472.472 0 100 .944h1.88a.472.472 0 100-.944h-1.88zm-4.153-1.389v4.416c0 .26.21.472.471.472h.236v.472c0 .26.21.471.472.471a.47.47 0 00.332-.137l1.417-1.418c.088-.087.208-.136.332-.136h1.18a.472.472 0 100-.944h-1.18a.944.944 0 00-.665.276l-.944.944V8.605a.472.472 0 00-.943 0v.528h-.236a.472.472 0 00-.472.472z"
                    />
                  </svg>
                  <span className="text-sm">카카오로 계속하기</span>
                </button>
              </form>
            </div>
          </div>
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
