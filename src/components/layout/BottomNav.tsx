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
            label: '홈 (Home)',
            href: '/',
            icon: Home,
            id: 'home'
        },
        {
            label: '둘러보기 (Explore)',
            href: '/explore',
            icon: Telescope,
            id: 'explore'
        },
        {
            label: '타임라인 (Timeline)',
            href: '/timeline',
            icon: Film,
            id: 'timeline'
        },
        {
            label: '명예의 전당 (Hall of Fame)',
            href: '/hall-of-fame',
            icon: Trophy,
            id: 'hall-of-fame'
        },
        {
            label: '프로필 (Profile)',
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
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pt-2 px-4 pointer-events-none">
            <div className="pointer-events-auto bg-velvet/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 shadow-2xl flex items-center gap-8 md:gap-12 film-border">
                {navItems.map((item) => {
                    const active = isActive(item.href)

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="relative group flex flex-col items-center gap-1"
                        >
                            <div className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                active ? "text-gold-film bg-white/5" : "text-smoke hover:text-celluloid"
                            )}>
                                <item.icon size={24} strokeWidth={active ? 2 : 1.5} />
                            </div>

                            {active && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-gold-film"
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
