'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Film } from 'lucide-react'

interface CinematicImageProps extends Omit<ImageProps, 'onLoad'> {
    containerClassName?: string
    showGrain?: boolean
    aspectRatio?: 'portrait' | 'landscape' | 'square' | 'cinematic' | 'auto'
}

export function CinematicImage({
    src,
    alt,
    containerClassName,
    className,
    showGrain = true,
    aspectRatio = 'auto',
    ...props
}: CinematicImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    const aspectClasses = {
        portrait: 'aspect-[2/3]',
        landscape: 'aspect-video',
        square: 'aspect-square',
        cinematic: 'aspect-[2.35/1]',
        auto: '',
    }

    return (
        <div
            className={clsx(
                "relative w-full h-full overflow-hidden bg-darkroom transition-all duration-700",
                aspectRatio !== 'auto' && aspectClasses[aspectRatio],
                containerClassName,
                !isLoaded && "animate-pulse"
            )}
        >
            <AnimatePresence>
                {!isLoaded && !hasError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-10"
                    >
                        <Film className="w-8 h-8 text-white/5 animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-darkroom/50 border border-white/5">
                    <Film className="w-8 h-8 text-white/10" />
                    <span className="text-[10px] font-mono-technical text-white/20 uppercase tracking-widest">Image_Error</span>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                    animate={isLoaded ? {
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: {
                            opacity: { duration: 1.5, ease: "easeOut" },
                            scale: { duration: 2, ease: [0.22, 1, 0.36, 1] },
                            filter: { duration: 1.2 }
                        }
                    } : {}}
                    className="relative w-full h-full overflow-hidden"
                >
                    <motion.div
                        animate={isLoaded ? {
                            scale: [1, 1.05],
                        } : {}}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear"
                        }}
                        className="w-full h-full"
                    >
                        <Image
                            key={src as string}
                            src={src}
                            alt={alt}
                            unoptimized={true}
                            onLoad={(e) => {
                                // Double check natural width to ensure it's not a broken 0x0 image
                                const target = e.target as HTMLImageElement;
                                if (target.naturalWidth > 0) {
                                    setIsLoaded(true)
                                }
                            }}
                            onError={() => setHasError(true)}
                            className={clsx(
                                "object-cover transition-opacity duration-700",
                                className,
                                isLoaded ? "opacity-100" : "opacity-0"
                            )}
                            {...props}
                        />
                    </motion.div>
                </motion.div>
            )}

            {/* Cinematic Overlays */}
            {isLoaded && !hasError && (
                <>
                    {/* Subtle Internal Vignette */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,9,8,0.4)_100%)] opacity-60" />

                    {/* Film Grain (Optional) */}
                    {showGrain && (
                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay bg-[url('/textures/film-noise.svg')]" />
                    )}

                    {/* Edge Light Leak (Animated) */}
                    <motion.div
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-gold-film/10 via-transparent to-cyan-film/10"
                    />
                </>
            )}
        </div>
    )
}
