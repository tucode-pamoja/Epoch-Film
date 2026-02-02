'use client'

import { motion } from 'framer-motion'
import { Award, Star, Compass, Camera, Zap } from 'lucide-react'

interface BadgeProps {
  type: string
  label: string
  description: string
  unlocked: boolean
  date?: string
}

const icons: Record<string, any> = {
  FIRST_REEL: Award,
  TRAVELER: Compass,
  PHOTOGRAPHER: Camera,
  EARLY_BIRD: Zap,
  DREAMER: Star,
}

export function Badge({ type, label, description, unlocked, date }: BadgeProps) {
  const Icon = icons[type] || Star

  return (
    <div className={`relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all duration-300 ${
      unlocked 
        ? 'bg-white/[0.05] border-white/10 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]' 
        : 'bg-white/[0.01] border-white/5 opacity-50 grayscale'
    }`}>
      <motion.div
        whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
          unlocked ? 'bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary' : 'bg-white/5 text-white/20'
        }`}
      >
        <Icon size={32} />
      </motion.div>
      
      <h3 className="text-white font-bold mb-1">{label}</h3>
      <p className="text-xs text-white/40 mb-3">{description}</p>
      
      {unlocked && date && (
        <span className="text-[10px] text-white/30 uppercase tracking-widest px-2 py-1 rounded-full bg-white/5">
          {new Date(date).toLocaleDateString()}
        </span>
      )}
      
      {!unlocked && (
        <span className="text-[10px] text-white/20 uppercase tracking-widest px-2 py-1 rounded-full border border-white/5">
          Locked
        </span>
      )}
    </div>
  )
}
