'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DropdownMenuProps {
    children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen })
                }
                return child
            })}
        </div>
    )
}

export function DropdownMenuTrigger({ children, asChild, isOpen, setIsOpen }: any) {
    return (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            {children}
        </div>
    )
}

export function DropdownMenuContent({ children, align = 'end', isOpen, setIsOpen }: any) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute z-[100] mt-2 ${align === 'end' ? 'right-0' : 'left-0'} transform origin-top-right`}
                >
                    <div className="bg-void/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-huge film-border overflow-hidden">
                        {React.Children.map(children, (child) => {
                            if (React.isValidElement(child)) {
                                return React.cloneElement(child as React.ReactElement<any>, { setIsOpen })
                            }
                            return child
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export function DropdownMenuItem({ children, onClick, className, setIsOpen }: any) {
    return (
        <div
            onClick={(e) => {
                onClick?.(e)
                setIsOpen(false)
            }}
            className={`px-4 py-2 hover:bg-gold-film/10 cursor-pointer transition-colors ${className}`}
        >
            {children}
        </div>
    )
}
