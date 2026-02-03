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
    <div className={`relative flex flex-col items-center text-center p-8 rounded-sm shadow-deep transition-all duration-500 film-border ${unlocked
        ? 'bg-velvet border-none group'
        : 'bg-white/[0.02] border border-white/5 opacity-40 grayscale'
      }`}>
      <motion.div
        whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
        className={`w-24 h-24 rounded-sm flex items-center justify-center mb-6 relative overflow-hidden ${unlocked
            ? 'bg-gradient-to-br from-purple-dusk/20 to-gold-film/20 text-purple-dusk border border-purple-dusk/30'
            : 'bg-white/5 text-smoke'
          }`}
      >
        {unlocked && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,104,238,0.2)_0%,transparent_70%)] animate-pulse" />
        )}
        <Icon size={40} className="relative z-10" />
      </motion.div>

      <h3 className={`font-display text-xl mb-2 ${unlocked ? 'text-celluloid' : 'text-smoke'}`}>
        {label}
      </h3>
      <p className="font-light text-xs text-smoke mb-6 leading-relaxed max-w-[150px]">
        {description}
      </p>

      {unlocked && date ? (
        <span className="font-mono-technical text-[9px] text-purple-dusk tracking-widest px-3 py-1 bg-purple-dusk/10 border border-purple-dusk/20">
          DOCUMENTED: {new Date(date).toLocaleDateString()}
        </span>
      ) : (
        <span className="font-mono-technical text-[9px] text-smoke/30 tracking-widest px-3 py-1 border border-white/5">
          STATUS: LOCKED
        </span>
      )}
    </div>
  )
}
