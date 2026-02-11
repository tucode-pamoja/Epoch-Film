'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FlashBulbProps {
    trigger: boolean
    onComplete?: () => void
}

export function FlashBulb({ trigger, onComplete }: FlashBulbProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (trigger) {
            setShow(true)
            const timer = setTimeout(() => {
                setShow(false)
                if (onComplete) onComplete()
            }, 300) // Total duration of the effect
            return () => clearTimeout(timer)
        }
    }, [trigger, onComplete])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.1,
                        ease: "easeOut"
                    }}
                    className="fixed inset-0 z-[99999] bg-white pointer-events-none"
                />
            )}
        </AnimatePresence>
    )
}
