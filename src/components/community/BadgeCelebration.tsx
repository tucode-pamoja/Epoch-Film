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

      const interval: any = setInterval(function() {
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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.2)] p-8 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-primary shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Trophy size={48} />
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Badge Unlocked!
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-primary font-bold text-lg mb-4"
          >
            {badge.label}
          </motion.p>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 mb-8"
          >
            {badge.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              onClick={handleClose}
              className="w-full rounded-full bg-white text-black hover:bg-white/90 font-bold"
            >
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
