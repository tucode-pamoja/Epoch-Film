'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export function StarField() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const stars = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.7 + 0.3,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
        }))
    }, [])

    if (!mounted) return <div className="fixed inset-0 z-0 bg-[#020202]" />

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020202]">
            {/* Dark Space Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-void via-darkroom/80 to-void" />

            {/* Nebula Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-film/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold-film/5 blur-[150px] rounded-full animate-pulse delay-1000" />

            {/* Stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                        boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
                    }}
                    animate={{
                        opacity: [star.opacity, star.opacity * 0.2, star.opacity],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}
