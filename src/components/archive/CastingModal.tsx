'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, UserPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createPortal } from 'react-dom'
import { getMutualFollowers, inviteCast } from '@/app/archive/actions'
import { toast } from 'sonner'
import Image from 'next/image'

interface CastingModalProps {
    isOpen: boolean
    onClose: () => void
    bucketId: string
}

export function CastingModal({ isOpen, onClose, bucketId }: CastingModalProps) {
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [mutuals, setMutuals] = useState<any[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, startTransition] = useTransition()

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            loadMutuals()
        }
    }, [isOpen])

    const loadMutuals = async () => {
        setIsLoading(true)
        try {
            const data = await getMutualFollowers()
            setMutuals(data)
        } catch (error) {
            console.error(error)
            toast.error('팔로워 목록을 불러오지 못했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedUserIds)
        if (newSelected.has(userId)) {
            newSelected.delete(userId)
        } else {
            newSelected.add(userId)
        }
        setSelectedUserIds(newSelected)
    }

    const handleInvite = () => {
        if (selectedUserIds.size === 0) return

        startTransition(async () => {
            let successCount = 0
            for (const userId of Array.from(selectedUserIds)) {
                try {
                    await inviteCast(bucketId, userId)
                    successCount++
                } catch (error) {
                    console.error(`Failed to invite ${userId}`, error)
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount}명에게 캐스팅 제안을 보냈습니다.`)
                onClose()
                setSelectedUserIds(new Set())
            } else {
                toast.error('초대 전송에 실패했습니다.')
            }
        })
    }

    const filteredMutuals = mutuals.filter(user =>
        user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-void border border-gold-film/20 rounded-lg shadow-2xl w-full max-w-lg min-w-[300px] overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-display text-white">CASTING CALL</h3>
                                <p className="text-xs text-gold-film/70 tracking-widest uppercase mt-1">INVITE CO-STARS</p>
                            </div>
                            <button onClick={onClose} className="text-smoke hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke/50" size={18} />
                                <input
                                    type="text"
                                    placeholder="배우 검색 (닉네임, 이메일)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white text-sm placeholder:text-smoke/30 focus:outline-none focus:border-gold-film/50 transition-colors"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[300px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-40 text-smoke/50 text-sm">
                                    로딩 중...
                                </div>
                            ) : filteredMutuals.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-smoke/50 text-sm gap-2">
                                    <UserPlus size={32} className="opacity-20" />
                                    <p>초대할 수 있는 친구가 없습니다.</p>
                                    <p className="text-xs text-smoke/30 text-center px-8">맞팔로우(서로 팔로우)한 친구만 초대할 수 있습니다.</p>
                                </div>
                            ) : (
                                filteredMutuals.map(user => {
                                    const isSelected = selectedUserIds.has(user.id)
                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-md transition-all ${isSelected ? 'bg-gold-film/10 border border-gold-film/30' : 'hover:bg-white/5 border border-transparent'}`}
                                        >
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                                                {user.profile_image_url ? (
                                                    <Image src={user.profile_image_url} alt={user.nickname} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-white/40">{user.nickname?.[0]}</div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-gold-film/50 flex items-center justify-center backdrop-blur-[1px]">
                                                        <Check size={16} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className={`text-sm font-medium ${isSelected ? 'text-gold-film' : 'text-white'}`}>{user.nickname}</p>
                                                <p className="text-xs text-smoke/50 truncate w-40">{user.email}</p>
                                            </div>
                                            {isSelected && (
                                                <span className="text-xs text-gold-film font-bold tracking-wider px-2 py-1 bg-gold-film/10 rounded-sm">
                                                    CASTED
                                                </span>
                                            )}
                                        </button>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
                            <Button
                                onClick={handleInvite}
                                disabled={selectedUserIds.size === 0 || isSending}
                                className="w-full py-6 text-base font-bold bg-gold-film text-void hover:bg-gold-warm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? 'SENDING INVITES...' : `SEND INVITATION (${selectedUserIds.size})`}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
