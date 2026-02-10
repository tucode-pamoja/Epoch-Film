'use client'

import { useState, useEffect, useTransition } from 'react'
import { followDirector, unfollowDirector, isFollowingDirector } from '@/app/archive/actions'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
    targetId: string
    currentUserId?: string
    initialIsFollowing?: boolean
    onFollowChange?: (isFollowing: boolean) => void
}

// Module-level cache for follow statuses to ensure global consistency without extra fetches
const globalFollowCache: Record<string, boolean> = {}

export function FollowButton({ targetId, currentUserId, initialIsFollowing, onFollowChange }: FollowButtonProps) {
    // Priority: 1. Cache, 2. Props, 3. Undefined
    const [isFollowing, setIsFollowing] = useState<boolean | undefined>(() => {
        if (globalFollowCache[targetId] !== undefined) return globalFollowCache[targetId]
        return initialIsFollowing
    })
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

    if (currentUserId === targetId) return null

    // Multi-instance synchronization via Custom Events
    useEffect(() => {
        const handleSync = (e: any) => {
            if (e.detail.targetId === targetId) {
                globalFollowCache[targetId] = e.detail.isFollowing
                setIsFollowing(e.detail.isFollowing)
            }
        }
        window.addEventListener('epoch-film:follow-sync', handleSync)

        // Populate cache if prop provided
        if (initialIsFollowing !== undefined) {
            globalFollowCache[targetId] = initialIsFollowing
        }

        // Initial check if not provided and not in cache
        if (isFollowing === undefined) {
            const check = async () => {
                const result = await isFollowingDirector(targetId)
                globalFollowCache[targetId] = result
                setIsFollowing(result)
            }
            check()
        }

        return () => window.removeEventListener('epoch-film:follow-sync', handleSync)
    }, [targetId, initialIsFollowing, isFollowing])

    const dispatchSync = (newState: boolean) => {
        globalFollowCache[targetId] = newState
        const event = new CustomEvent('epoch-film:follow-sync', {
            detail: { targetId, isFollowing: newState }
        })
        window.dispatchEvent(event)
    }

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading || isPending) return

        // Optimistic Update
        const previousState = isFollowing
        const newState = !previousState
        setIsFollowing(newState)
        onFollowChange?.(newState)
        dispatchSync(newState)
        setLoading(true)

        startTransition(async () => {
            try {
                let result;
                if (previousState) {
                    result = await unfollowDirector(targetId)
                    if (result.success) {
                        toast.success('🎬 감독님의 행보를 더 이상 추적하지 않습니다.')
                    } else {
                        // Rollback
                        setIsFollowing(true)
                        onFollowChange?.(true)
                        dispatchSync(true)
                        toast.error(result.error || '팔로우 취소에 실패했습니다.')
                    }
                } else {
                    result = await followDirector(targetId)
                    if (result.success) {
                        toast.success('🎬 감독님의 다음 작품을 기대하세요!')
                    } else {
                        // Rollback
                        setIsFollowing(false)
                        onFollowChange?.(false)
                        dispatchSync(false)
                        toast.error(result.error || '팔로우에 실패했습니다.')
                    }
                }
            } catch (err) {
                console.error('Follow toggle failed:', err)
                setIsFollowing(previousState) // Rollback
                toast.error('통신 오류가 발생했습니다.')
            } finally {
                setLoading(false)
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading || isPending}
            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-sm text-[9px] font-mono-technical tracking-widest uppercase transition-all
                ${isFollowing
                    ? 'bg-white/5 text-smoke border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                    : 'bg-gold-film/10 text-gold-film border border-gold-film/20 hover:bg-gold-film hover:text-velvet'
                }
            `}
        >
            {loading || isPending ? (
                <Loader2 size={10} className="animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus size={10} />
                    SUBSCRIBED
                </>
            ) : (
                <>
                    <UserPlus size={10} />
                    SUBSCRIBE
                </>
            )}
        </button>
    )
}
