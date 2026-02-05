'use client'

import { useState } from 'react'
import { Share2, Link, Check, Twitter, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'

interface ShareButtonProps {
    title: string
    url: string
}

export function ShareButton({ title, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${title} | EPOCH FILM`,
                    url: fullUrl
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} | EPOCH FILM`)}&url=${encodeURIComponent(fullUrl)}`
        window.open(twitterUrl, '_blank')
    }

    const shareToFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
        window.open(fbUrl, '_blank')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full border border-white/5 hover:bg-white/5 text-smoke/60 hover:text-gold-film transition-all"
                >
                    <Share2 size={18} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-void/95 backdrop-blur-xl border-white/10 text-smoke p-2">
                <DropdownMenuItem
                    onClick={copyToClipboard}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gold-film/10 focus:bg-gold-film/10 rounded-sm py-3 transition-colors"
                >
                    {copied ? <Check size={16} className="text-green-500" /> : <Link size={16} />}
                    <span className="text-xs font-mono-technical tracking-widest uppercase">
                        {copied ? 'COPIED!' : 'COPY_LINK'}
                    </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={shareToTwitter}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gold-film/10 focus:bg-gold-film/10 rounded-sm py-3 transition-colors"
                >
                    <Twitter size={16} />
                    <span className="text-xs font-mono-technical tracking-widest uppercase text-nowrap">SHARE_ON_X</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={shareToFacebook}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gold-film/10 focus:bg-gold-film/10 rounded-sm py-3 transition-colors"
                >
                    <Facebook size={16} />
                    <span className="text-xs font-mono-technical tracking-widest uppercase text-nowrap">SHARE_ON_FB</span>
                </DropdownMenuItem>

                {typeof navigator !== 'undefined' && (navigator as any).share && (
                    <DropdownMenuItem
                        onClick={handleShare}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gold-film/10 focus:bg-gold-film/10 rounded-sm py-3 border-t border-white/5 mt-2 transition-colors"
                    >
                        <Share2 size={16} />
                        <span className="text-xs font-mono-technical tracking-widest uppercase">SYSTEM_SHARE</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
