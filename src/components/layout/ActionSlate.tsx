'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ActionSlateProps {
    isOpen: boolean
    targetUrl: string
    onComplete: () => void
}

export function ActionSlate({ isOpen, targetUrl, onComplete }: ActionSlateProps) {
    const router = useRouter()
    const [isClapped, setIsClapped] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsClapped(false)

            // Define the sequence
            const startTime = Date.now()
            const MIN_DURATION = 1200 // 1.2s minimum for cinematic pacing
            const CLAP_TIME = 600 // Strike moment

            // 1. Strike (Clap) animation
            const clapTimer = setTimeout(() => {
                setIsClapped(true)
            }, CLAP_TIME)

            // 2. Wait for minimum duration + any additional loading if provided
            const animationMinPromise = new Promise(resolve => setTimeout(resolve, MIN_DURATION))

            // We use Promise.all to synchronize the finish line
            Promise.all([animationMinPromise]).then(() => {
                if (targetUrl) {
                    router.push(targetUrl)
                }
                onComplete()
            })

            return () => {
                clearTimeout(clapTimer)
            }
        }
    }, [isOpen, targetUrl, router, onComplete])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100000] flex items-center justify-center bg-void/40 backdrop-blur-sm"
                >
                    {/* The Masking Layer for Transition */}
                    {/* {isClapped && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-void z-[100001]"
                        />
                    )} */}

                    {/* Slate Container */}
                    <motion.div
                        initial={{ y: -500, rotate: -5 }}
                        animate={{ y: 0, rotate: 0 }}
                        exit={{ y: 600, opacity: 0 }}
                        transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        className="relative w-80 sm:w-96 flex flex-col items-center z-[100002]"
                    >
                        {/* Upper Part (Moving Part) */}
                        <motion.div
                            animate={isClapped ? { rotateX: 0, y: 0 } : { rotateX: -45, y: -10 }}
                            transition={{ duration: 0.15, ease: "easeIn" }}
                            className="w-full h-16 bg-neutral-900 border-b-4 border-black rounded-t-sm flex items-center justify-center relative origin-bottom"
                        >
                            <div className="flex gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-10 h-16 bg-white skew-x-[30deg] -translate-x-4 opacity-80" />
                                ))}
                            </div>
                        </motion.div>

                        {/* Content Part (Lower Part) */}
                        <div className="w-full h-48 bg-neutral-900 border-t-2 border-black p-6 flex flex-col justify-between shadow-2xl rounded-b-sm">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-mono-technical text-smoke/40 tracking-[0.2em] uppercase">Prod.</span>
                                    <span className="text-xs font-display text-white tracking-widest uppercase">EPOCH FILM</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-mono-technical text-smoke/40 tracking-[0.2em] uppercase">Roll / Scene</span>
                                    <span className="text-xs font-display text-gold-film tracking-widest">A-01 / NEW</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4">
                                <span className="text-[10px] font-mono-technical text-smoke/60 tracking-[0.4em] uppercase mb-1 underline underline-offset-4 decoration-gold-film/30">Action</span>
                                <span className="text-xl font-display text-celluloid tracking-widest text-center uppercase">READY TO SHOOT</span>
                            </div>

                            <div className="flex justify-between border-t border-white/10 pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-mono-technical text-smoke/40 tracking-[0.2em] uppercase">Date</span>
                                    <span className="text-[10px] font-mono-technical text-white/80">{new Date().toISOString().split('T')[0]}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-mono-technical text-smoke/40 tracking-[0.2em] uppercase">Director</span>
                                    <span className="text-[10px] font-mono-technical text-gold-film/80 uppercase">YOU</span>
                                </div>
                            </div>
                        </div>

                        {/* Flash Effect inside Slate on Clap */}
                        {isClapped && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-x-0 top-0 h-16 bg-white mix-blend-overlay z-10"
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
