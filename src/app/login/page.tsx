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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative w-full max-w-[400px] backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-8 sm:p-12 rounded-3xl shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative w-20 h-20 mb-6 group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/logo.jpg"
              alt="Epoch Film Logo"
              fill
              className="object-contain relative z-10"
              priority
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-white/40 font-light">
            Enter your details to access the archive
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/10 text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="group">
              <label htmlFor="email" className="sr-only">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                className="h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-0 transition-all rounded-xl"
              />
            </div>
            <div className="group">
              <label htmlFor="password" className="sr-only">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                minLength={6}
                className="h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-0 transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <Button 
              formAction={login} 
              className="w-full h-12 rounded-xl bg-primary text-black hover:bg-primary/90 font-semibold text-sm transition-all shadow-[0_4px_20px_-5px_rgba(212,175,55,0.4)]"
            >
              Sign In
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#15151A] px-2 text-white/20">Or continue with</span>
              </div>
            </div>
            
            <Button
              formAction={signup}
              variant="outline"
              className="w-full h-12 rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 text-sm font-medium transition-all"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-center text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer">
        Forgot your password?
      </p>
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
