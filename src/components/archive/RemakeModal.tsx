'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface RemakeModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    bucketTitle: string
    isPending: boolean
}

export function RemakeModal({ isOpen, onClose, onConfirm, bucketTitle, isPending }: RemakeModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isPending ? undefined : onClose}
                        className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#030303] border border-gold-film/20 rounded-lg shadow-2xl w-full max-w-xl min-w-[350px] sm:min-w-[500px] pointer-events-auto relative"
                        >
                            <div className="p-8 space-y-8">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gold-film/10 flex items-center justify-center border border-gold-film/20 shrink-0">
                                            <Copy className="w-6 h-6 text-gold-film" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-display text-white tracking-wide">REMAKE SCENE</h3>
                                            <p className="text-xs font-mono-technical text-gold-film/70 tracking-[0.2em] uppercase mt-1">
                                                DUPLICATE ARCHIVE
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-smoke hover:text-white transition-colors disabled:opacity-50 p-2"
                                        disabled={isPending}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="space-y-6">
                                    <p className="text-smoke/90 font-light leading-relaxed text-lg break-keep">
                                        <span className="text-white font-medium">"{bucketTitle}"</span> 시나리오를<br className="hidden sm:block" /> 당신의 아카이브로 리메이크하시겠습니까?
                                    </p>

                                    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
                                        <p className="text-sm text-smoke/70 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gold-film shrink-0" />
                                            <span className="break-keep">제목, 설명, 카테고리가 그대로 복제됩니다.</span>
                                        </p>
                                        <p className="text-sm text-smoke/70 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gold-film shrink-0" />
                                            <span className="break-keep">로드맵(단계) 및 루틴 설정이 복제됩니다.</span>
                                        </p>
                                        <div className="pt-2 pl-4 border-l-2 border-red-500/30 ml-0.5 mt-1">
                                            <p className="text-sm text-red-400/90 italic break-keep">
                                                * 기존의 기록(발자취) 데이터는 포함되지 않으며,<br className="hidden sm:block" /> 새로운 여정을 시작할 수 있도록 초기화됩니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-smoke py-6 text-base tracking-wider"
                                        disabled={isPending}
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        onClick={onConfirm}
                                        className="flex-[2] bg-gold-film text-void hover:bg-gold-warm py-6 font-bold text-base tracking-wider shadow-lg shadow-gold-film/20"
                                        disabled={isPending}
                                    >
                                        {isPending ? 'PROCESSING...' : 'CONFIRM REMAKE'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
