'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Telescope, Film, Trophy, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'HOME',
            href: '/',
            icon: Home,
            id: 'home'
        },
        {
            label: 'EXPLORE',
            href: '/explore',
            icon: Telescope,
            id: 'explore'
        },
        {
            label: 'TIMELINE',
            href: '/timeline',
            icon: Film,
            id: 'timeline'
        },
        {
            label: 'AWARDS',
            href: '/hall-of-fame',
            icon: Trophy,
            id: 'hall-of-fame'
        },
        {
            label: 'DIRECTOR',
            href: '/profile',
            icon: User,
            id: 'profile'
        }
    ]

    // Determine active tab
    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname?.startsWith(path)) return true
        return false
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pb-8 pt-2 px-4 pointer-events-none">
            <nav className="pointer-events-auto relative flex items-center bg-void/40 backdrop-blur-3xl border border-white/10 rounded-full px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Thin Inner Highlight */}
                <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

                <div className="flex items-center gap-1 sm:gap-2 relative">
                    {navItems.map((item) => {
                        const active = isActive(item.href)

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    "relative group flex flex-col items-center justify-center min-w-[64px] sm:min-w-[80px] h-12 sm:h-14 transition-all duration-500",
                                    active ? "text-gold-film" : "text-smoke hover:text-white"
                                )}
                            >
                                {/* Active Background Highlight */}
                                {active && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-x-1 inset-y-1 bg-white/5 rounded-full border border-white/5 shadow-inner"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-0.5">
                                    <item.icon
                                        size={active ? 20 : 18}
                                        strokeWidth={active ? 2 : 1.5}
                                        className={cn(
                                            "transition-all duration-500",
                                            active ? "drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]" : "opacity-60 group-hover:opacity-100"
                                        )}
                                    />

                                    <span className={cn(
                                        "font-mono-technical text-[7px] tracking-[0.2em] transition-all duration-500",
                                        active ? "text-gold-film/80 opacity-100" : "opacity-0 group-hover:opacity-40"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>

                                {/* Active Bottom Dot (Subtle) */}
                                {active && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-gold-film shadow-[0_0_10px_#C9A227]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
