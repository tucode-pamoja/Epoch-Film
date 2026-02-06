'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BadgeInfo {
  type: string
  label: string
  description: string
}

const BADGE_DETAILS: Record<string, BadgeInfo> = {
  FIRST_REEL: { type: 'FIRST_REEL', label: 'First Frame', description: 'Created your first bucket list item.' },
  DREAMER: { type: 'DREAMER', label: 'The Dreamer', description: 'Added 10 items to your archive.' },
  TRAVELER: { type: 'TRAVELER', label: 'Wanderlust', description: 'Completed a travel category goal.' },
  PHOTOGRAPHER: { type: 'PHOTOGRAPHER', label: 'Shutterbug', description: 'Uploaded 5 Check-in memories.' },
  EARLY_BIRD: { type: 'EARLY_BIRD', label: 'Early Bird', description: 'Joined Epoch Film in the first month.' },
}

export function BadgeCelebration() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const unlockedType = searchParams.get('unlocked')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (unlockedType && BADGE_DETAILS[unlockedType]) {
      setIsOpen(true)

      // Trigger confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const random = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [unlockedType])

  const handleClose = () => {
    setIsOpen(false)
    router.replace('/hall-of-fame', { scroll: false })
  }

  if (!isOpen || !unlockedType || !BADGE_DETAILS[unlockedType]) return null

  const badge = BADGE_DETAILS[unlockedType]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Cinematic Light Leak Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold-film/10 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1.2, 1, 1.2],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-film/10 blur-[150px] rounded-full"
          />
        </div>

        {/* Film Reel Animation */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-[800px] h-[800px] border-[40px] border-dashed border-white/20 rounded-full flex items-center justify-center"
          >
            <div className="w-[600px] h-[600px] border-[20px] border-dashed border-white/10 rounded-full" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="relative w-full max-w-lg overflow-hidden rounded-md bg-darkroom border border-gold-film/30 shadow-[0_0_100px_rgba(201,162,39,0.2)] p-12 text-center perspective-cinema"
        >
          {/* Film Border Aesthetic */}
          <div className="absolute inset-x-0 top-0 h-6 bg-void flex items-center justify-around px-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-4 h-3 bg-white/5 rounded-sm" />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-6 bg-void flex items-center justify-around px-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-4 h-3 bg-white/5 rounded-sm" />
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10"
          >
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gold-film/10 text-gold-film shadow-[0_0_50px_rgba(201,162,39,0.3)] border border-gold-film/20">
              <Trophy size={64} className="drop-shadow-[0_0_15px_rgba(201,162,39,0.5)]" />
            </div>

            <h2 className="text-sm font-mono-technical tracking-[0.4em] text-gold-film/60 mb-2 uppercase">
              Premier Achievement
            </h2>

            <h1 className="text-4xl font-display font-bold text-white mb-4 tracking-tight uppercase">
              {badge.label}
            </h1>

            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-film/50 to-transparent mx-auto mb-6" />

            <p className="text-lg text-white/70 font-display italic mb-10 max-w-xs mx-auto">
              "{badge.description}"
            </p>

            <Button
              onClick={handleClose}
              className="px-10 py-6 rounded-none bg-gold-film text-void hover:bg-gold-highlight font-mono-technical tracking-widest text-xs transition-all duration-500 shadow-[0_10px_30px_rgba(201,162,39,0.3)]"
            >
              CLOSE PREVIEW
            </Button>
          </motion.div>

          {/* Dust Particles */}
          <div className="dust-layer opacity-40">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="dust-particle" style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 5 + 5}s`, animationDelay: `${Math.random() * 5}s` }} />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
