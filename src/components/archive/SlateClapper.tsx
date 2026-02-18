'use client'

import { useFormStatus } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function SlateClapper() {
    const { pending } = useFormStatus()
    const [show, setShow] = useState(false)

    // Delay hiding to ensure clap finishes or to smooth transitions
    useEffect(() => {
        if (pending) setShow(true)
        else {
            const t = setTimeout(() => setShow(false), 1000) // Keep showing for a sec after finish? Or just hide immediately?
            // Actually usually we want it to show WHILE pending or at least CLAP once.
            // If pending is fast, we might miss it. 
            // Better strategy: If pending goes true, show and clap.
            return () => clearTimeout(t)
        }
    }, [pending])

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-[300px] h-[260px]"
                    >
                        {/* Clapper Top (The Arm) */}
                        <motion.div
                            initial={{ rotate: -25 }}
                            animate={{ rotate: 0 }}
                            transition={{
                                delay: 0.3,
                                type: 'spring',
                                stiffness: 500,
                                damping: 15
                            }}
                            style={{ originX: 0, originY: 1 }} // Pivot at bottom left of the arm
                            className="absolute top-0 left-0 w-full h-[50px] bg-[#1a1816] border-2 border-white rounded-sm z-20 overflow-hidden flex"
                        >
                            {/* Chevrons */}
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex-1 h-full bg-white -skew-x-[20deg] border-r border-[#1a1816] translate-x-[-10px] w-[60px]" style={{ backgroundColor: i % 2 === 0 ? 'white' : '#1a1816' }} />
                            ))}
                        </motion.div>

                        {/* Clapper Body (Static Bottom) */}
                        <div className="absolute top-[50px] left-0 w-full h-[210px] bg-[#1a1816] border-2 border-t-0 border-white rounded-b-sm flex flex-col p-4 shadow-2xl">
                            {/* Hinge visuals */}
                            <div className="absolute -top-3 left-0 w-full h-[6px] bg-white transform skew-x-[20deg]" />

                            <div className="flex-1 border-2 border-white/20 p-2 flex flex-col items-center justify-center space-y-4">
                                <div className="text-center">
                                    <div className="text-[10px] font-mono-technical text-white/50 tracking-widest mb-1">PROD.</div>
                                    <div className="text-xl font-display font-bold text-white tracking-wider">EPOCH FILM</div>
                                </div>

                                <div className="w-full h-px bg-white/20" />

                                <div className="flex w-full justify-between gap-4">
                                    <div className="flex-1 text-center">
                                        <div className="text-[10px] font-mono-technical text-white/50 tracking-widest mb-1">SCENE</div>
                                        <div className="text-2xl font-mono text-white">AUTO</div>
                                    </div>
                                    <div className="w-px h-12 bg-white/20" />
                                    <div className="flex-1 text-center">
                                        <div className="text-[10px] font-mono-technical text-white/50 tracking-widest mb-1">TAKE</div>
                                        <div className="text-2xl font-mono text-white">1</div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-white/20" />

                                <div className="text-center">
                                    <div className="text-[10px] font-mono-technical text-white/50 tracking-widest mb-1">DIRECTOR</div>
                                    <div className="text-sm font-mono text-gold-film">YOU</div>
                                </div>
                            </div>
                        </div>

                        {/* Flash Effect on Clap */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ delay: 0.3, duration: 0.1 }} // Sync with clap
                            className="absolute inset-0 bg-white z-50 mix-blend-overlay"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
