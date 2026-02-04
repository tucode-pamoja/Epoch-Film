'use client'

import { Bucket } from '@/types'
import { clsx } from 'clsx'
import { Star, CheckCircle2, Ticket, MessageSquare, Share2 } from 'lucide-react'
import { togglePin } from '@/actions/bucket-actions'
import { completeBucket } from '@/app/archive/actions'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BucketCardProps {
  bucket: Bucket
  onComplete?: () => void
  isPublic?: boolean
}

export function BucketCard({ bucket, onComplete, isPublic = false }: BucketCardProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Motion values for 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring animations for smoothness
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  // Transform values for rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Calculate normalized mouse position (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5
    const mouseY = (e.clientY - rect.top) / height - 0.5

    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await togglePin(bucket.id, bucket.is_pinned)
  }

  const handleComplete = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onComplete) {
      onComplete()
    }
  }

  const handleCardClick = () => {
    router.push(`/archive/${bucket.id}`)
  }

  const formattedDate = mounted
    ? new Date(bucket.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })
    : ''

  const isAchieved = bucket.status === 'ACHIEVED'

  return (
    <motion.div
      layoutId={`card-${bucket.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[2/3] flex flex-col justify-between overflow-hidden rounded-md bg-darkroom cursor-pointer h-full border border-white/10 group/card transition-all duration-500 shadow-huge"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {bucket.thumbnail_url ? (
          <>
            <img
              src={bucket.thumbnail_url}
              alt={bucket.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
            {/* Cinematic Overlays */}
            <div className="absolute inset-0 bg-void/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" />
            {/* Film Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </>
        ) : (
          <div className="w-full h-full bg-darkroom/80 flex items-center justify-center">
            <Star className="w-12 h-12 text-white/5" />
          </div>
        )}
      </div>

      {/* Shine/Reflection Layer */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover/card:opacity-30 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
        }}
      />

      {/* Top Bar - Functional Icons */}
      <div className="relative z-20 p-6 flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
        {!isPublic && (
          <span className={`font-mono-technical text-[8px] tracking-[0.2em] px-2 py-0.5 rounded-sm border uppercase backdrop-blur-md ${isAchieved
            ? 'bg-cyan-film/20 border-cyan-film/40 text-cyan-film shadow-[0_0_10px_rgba(78,205,196,0.2)]'
            : 'bg-gold-film/20 border-gold-film/40 text-gold-film shadow-[0_0_10px_rgba(201,162,39,0.2)]'
            }`}>
            {isAchieved ? 'VERIFIED' : 'IN PRODUCTION'}
          </span>
        )}

        {!isPublic && (
          <div className="flex items-center gap-1">
            {!isAchieved && (
              <button
                onClick={handleComplete}
                className="p-2 text-white/40 transition-all hover:text-green-400 active:scale-90"
              >
                <CheckCircle2 size={18} />
              </button>
            )}
            <button
              onClick={handlePin}
              className="p-2 text-white/30 transition-all hover:text-gold-film"
            >
              <Star
                size={18}
                className={clsx(
                  bucket.is_pinned ? "fill-gold-film text-gold-film" : "fill-transparent"
                )}
              />
            </button>
          </div>
        )}
      </div>

      {/* Main Poster Content - Theatrical Centered Layout */}
      <div className="relative z-20 flex-grow flex flex-col items-center justify-center p-8 text-center" style={{ transform: "translateZ(60px)" }}>
        <div className="space-y-4 mb-4">
          <p className="font-mono-technical text-[9px] text-white/50 tracking-[0.4em] uppercase opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
            {bucket.category || 'CINEMA'}
          </p>
          <h3 className="text-3xl md:text-4xl font-display leading-[0.9] text-white tracking-[-0.04em] drop-shadow-[0_10px_20px_rgba(0,0,0,1)] uppercase break-keep">
            {bucket.title}
          </h3>
        </div>

        {bucket.description && (
          <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-4 group-hover/card:translate-y-0">
            <p className="text-[10px] md:text-xs text-gold-film/80 italic font-display tracking-widest max-w-[200px] line-clamp-2 drop-shadow-md">
              "{bucket.description}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar - Interaction Info */}
      <div className="relative z-20 p-6 pt-5 border-t border-white/5 flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 group/stat">
            <Ticket size={14} className="text-gold-film/80 group-hover/stat:text-gold-film transition-colors" />
            <span className="font-mono-technical text-[9px] text-gold-film/60 group-hover/stat:text-gold-film tracking-widest uppercase">TICKET ({bucket.tickets || 0})</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="text-white/20 hover:text-white transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>
      {/* Film Border Aesthetic */}
      <div className="absolute inset-x-0 top-0 h-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
    </motion.div>
  )
}
