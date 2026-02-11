'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.02 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // Custom cinematic cubic-bezier
                opacity: { duration: 0.4 }
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    )
}
