'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import { motion, useTransform, useSpring, useMotionValue, MotionValue } from 'framer-motion'

interface StarData {
    id: string
    x: number
    y: number
    size: number
    opacity: number
    parallax: number
    twinkle: number
    color?: string
}

/**
 * Individual Star component to adhere to the Rules of Hooks.
 * Hook calls (useTransform) are now at the top level of this component.
 */
const StarItem = memo(({ star, smoothX, smoothY }: { star: StarData, smoothX: MotionValue<number>, smoothY: MotionValue<number> }) => {
    const x = useTransform(smoothX, [-0.5, 0.5], [star.parallax, -star.parallax])
    const y = useTransform(smoothY, [-0.5, 0.5], [star.parallax, -star.parallax])

    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                backgroundColor: star.color || '#FFFFFF',
                x,
                y,
                boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px ${star.color || 'rgba(255, 255, 255, 0.8)'}` : 'none',
            }}
            animate={{
                opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: star.twinkle,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    )
})

StarItem.displayName = 'StarItem'

/**
 * Nebula layer component to avoid hook violations in the main StarField render.
 */
const NebulaLayer = memo(({ smoothX, smoothY }: { smoothX: MotionValue<number>, smoothY: MotionValue<number> }) => {
    const x = useTransform(smoothX, [-0.5, 0.5], [20, -20])
    const y = useTransform(smoothY, [-0.5, 0.5], [20, -20])

    return (
        <motion.div
            style={{ x, y }}
            className="absolute top-[10%] left-[10%] w-[80%] h-[80%] opacity-30"
        >
            <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-cyan-film/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-gold-film/5 blur-[150px] rounded-full animate-pulse delay-700" />
            <div className="absolute top-[30%] right-[30%] w-[30%] h-[30%] bg-purple-dusk/5 blur-[100px] rounded-full animate-pulse delay-1000" />
        </motion.div>
    )
})

NebulaLayer.displayName = 'NebulaLayer'

export function StarField() {
    const [mounted, setMounted] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth mouse movement for parallax effect
    const smoothX = useSpring(mouseX, { damping: 50, stiffness: 200 })
    const smoothY = useSpring(mouseY, { damping: 50, stiffness: 200 })

    useEffect(() => {
        setMounted(true)
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            // Normalize coordinates to -0.5 to 0.5
            mouseX.set((clientX / innerWidth) - 0.5)
            mouseY.set((clientY / innerHeight) - 0.5)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    const starLayers = useMemo(() => {
        // Deep stars (Far) - slowest parallax
        const layer1 = Array.from({ length: 100 }).map((_, i) => ({
            id: `l1-${i}`,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.3 + 0.1,
            parallax: 5,
            twinkle: Math.random() * 4 + 3,
        }))
        // Mid-range stars
        const layer2 = Array.from({ length: 50 }).map((_, i) => ({
            id: `l2-${i}`,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            parallax: 15,
            twinkle: Math.random() * 3 + 2,
        }))
        // Near stars (Bright) - fastest parallax
        const layer3 = Array.from({ length: 20 }).map((_, i) => ({
            id: `l3-${i}`,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2.5 + 1,
            opacity: Math.random() * 0.8 + 0.4,
            parallax: 30,
            twinkle: Math.random() * 2 + 1,
            color: Math.random() > 0.8 ? '#4ECDC4' : Math.random() > 0.8 ? '#FF6B35' : '#FFFFFF'
        }))
        return [...layer1, ...layer2, ...layer3]
    }, [])

    if (!mounted) return <div className="fixed inset-0 z-0 bg-void" />

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-void">
            {/* Deep Cosmic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(28,26,24,0.3)_0%,var(--color-void)_100%)]" />

            {/* Dynamic Nebulas extracted to NebulaLayer to fix hook violations */}
            <NebulaLayer smoothX={smoothX} smoothY={smoothY} />

            {/* Stars with Per-Layer Parallax - Extracted to StarItem to follow Rules of Hooks */}
            {starLayers.map((star) => (
                <StarItem
                    key={star.id}
                    star={star}
                    smoothX={smoothX}
                    smoothY={smoothY}
                />
            ))}

            {/* Film Grain for Cinematic Atmosphere */}
            <div className="film-grain opacity-[0.15]" />
        </div>
    )
}
