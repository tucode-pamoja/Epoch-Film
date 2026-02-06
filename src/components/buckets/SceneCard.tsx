'use client'

import { Bucket } from '@/types'
import { clsx } from 'clsx'
import { Star, CheckCircle2, Ticket, Share2, Loader2 } from 'lucide-react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SceneCardProps {
  bucket: Bucket
  onComplete?: () => void
  onTogglePin?: () => void
  isPending?: boolean
  isPublic?: boolean
  isFocused?: boolean
}

export function SceneCard({
  bucket,
  onComplete,
  onTogglePin,
  isPending = false,
  isPublic = false,
  isFocused = false
}: SceneCardProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Motion values for 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring animations for smoothness
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  // Transform values for rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])

  // Dynamic spotlight positions
  const spotlightX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])
  const spotlightY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])

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
    if (onTogglePin) {
      onTogglePin()
    }
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
      className={clsx(
        "relative aspect-[3/4] w-full flex flex-col justify-between overflow-hidden rounded-md bg-darkroom cursor-pointer border transition-all duration-700 shadow-huge group/card",
        isFocused
          ? "border-gold-film/50 scale-105 z-30 opacity-100"
          : "border-white/10 scale-100 opacity-40 blur-[1px] z-20 grayscale-[0.8]"
      )}
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {bucket.thumbnail_url ? (
          <>
            <img
              src={bucket.thumbnail_url}
              alt={bucket.title}
              className={clsx(
                "w-full h-full object-cover transition-all duration-1000",
                isFocused ? "scale-105 saturate-100" : "scale-100 saturate-50"
              )}
            />
            {/* Museum Spotlight Overlays */}
            <div className={clsx(
              "absolute inset-0 bg-void transition-opacity duration-1000",
              isFocused ? "opacity-60" : "opacity-80"
            )} />

            {/* Primary Spotlight Beam - Sharpens when focused */}
            <motion.div
              style={{
                background: useTransform(
                  [spotlightX, spotlightY],
                  ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.2) 0%, transparent 60%)`
                )
              }}
              className={clsx(
                "absolute inset-0 transition-opacity duration-1000",
                isFocused ? "opacity-100" : "opacity-30"
              )}
            />

            {/* Pinpoint Focus Light - Active only when focused */}
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                style={{
                  background: useTransform(
                    [spotlightX, spotlightY],
                    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(201,162,39,0.3) 0%, transparent 40%)`
                  )
                }}
                className="absolute inset-0 z-10 pointer-events-none"
              />
            )}

            {/* Theatrical Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />

            {/* Bottom Grounding Glow */}
            <div className={clsx(
              "absolute bottom-0 left-1/4 right-1/4 h-32 blur-[60px] pointer-events-none transition-all duration-1000",
              isFocused ? "bg-gold-film/20 opacity-100" : "bg-gold-film/10 opacity-40"
            )} />

            {/* Film Grain */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('/textures/film-noise.svg')]" />
          </>
        ) : (
          <div className="w-full h-full bg-darkroom/80 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,162,39,0.05)_0%,transparent_70%)]" />
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

      {/* Top Bar - Functional Icons - Reduced padding */}
      <div className="relative z-20 p-4 flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
        {!isPublic && (
          <div className="flex items-center gap-1.5">
            <span className={clsx(
              "font-mono-technical text-[7px] tracking-[0.2em] px-1.5 py-0.5 rounded-sm border uppercase backdrop-blur-md",
              isAchieved ? "bg-cyan-film/20 border-cyan-film/40 text-cyan-film" : "bg-gold-film/20 border-gold-film/40 text-gold-film"
            )}>
              {isAchieved ? 'VERIFIED' : 'IN PRODUCTION'}
            </span>
            <span className="font-mono-technical text-[7px] tracking-[0.2em] px-1.5 py-0.5 rounded-sm border border-white/10 bg-white/5 text-white/40 uppercase backdrop-blur-md">
              {bucket.target_date ? 'YEARLY' : 'MY EPOCH'}
            </span>
          </div>
        )}

        {!isPublic && (
          <div className="flex items-center gap-0.5">
            {!isAchieved && (
              <button
                onClick={handleComplete}
                className="p-1.5 text-white/40 transition-all hover:text-green-400 active:scale-90"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
            <button
              onClick={handlePin}
              disabled={isPending}
              className={clsx(
                "p-1.5 transition-all hover:text-gold-film",
                isPending ? "opacity-30 cursor-wait" : "text-white/30"
              )}
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Star
                  size={16}
                  className={clsx(
                    bucket.is_pinned ? "fill-gold-film text-gold-film" : "fill-transparent"
                  )}
                />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Poster Content - Theatrical Centered Layout - More compact */}
      <div className="relative z-20 flex-grow flex flex-col items-center justify-center px-4 text-center overflow-hidden" style={{ transform: "translateZ(60px)" }}>
        <div className="space-y-2 mb-2">
          <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.3em] uppercase opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
            {bucket.category || 'CINEMA'}
          </p>
          <h3 className="text-xl md:text-2xl font-display leading-[1.1] text-white tracking-[-0.03em] drop-shadow-[0_5px_15px_rgba(0,0,0,1)] uppercase break-keep line-clamp-2">
            {bucket.title}
          </h3>
        </div>

        {bucket.description && (
          <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-1 group-hover/card:translate-y-0">
            <p className="text-[8px] md:text-[9px] text-gold-film/80 italic font-display tracking-wider max-w-[150px] line-clamp-2 drop-shadow-md">
              "{bucket.description}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar - Interaction Info - Tighter padding to ensure visibility */}
      <div className="relative z-20 px-4 py-3 border-t border-white/5 flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 group/stat">
            <Ticket size={11} className="text-gold-film/80 group-hover/stat:text-gold-film transition-colors" />
            <span className="font-mono-technical text-[7px] text-gold-film/60 group-hover/stat:text-gold-film tracking-widest uppercase">
              TICKET ({bucket.tickets || 0}) | {bucket.target_date ? 'YEARLY' : 'MY EPOCH'}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="text-white/20 hover:text-white transition-colors"
        >
          <Share2 size={13} />
        </button>
      </div>
      {/* Film Border Aesthetic */}
      <div className="absolute inset-x-0 top-0 h-4 bg-[url('/textures/film-noise.svg')] opacity-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[url('/textures/film-noise.svg')] opacity-10 pointer-events-none" />
    </motion.div>
  )
}
