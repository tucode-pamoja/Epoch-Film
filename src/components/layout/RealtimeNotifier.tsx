'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function RealtimeNotifier({ currentUserId }: { currentUserId: string }) {
    const [notification, setNotification] = useState<{ message: string, type: 'TICKET' | 'CAST' } | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (!currentUserId) return

        // Supabase Realtime 구독 채널 설정
        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // 새로운 데이터가 들어올 때만 감지
                    schema: 'public',
                    table: 'tickets',
                    filter: `receiver_id=eq.${currentUserId}` // '나'에게 온 티켓만 필터링
                },
                (payload) => {
                    // 알림 발생!
                    console.log('New Ticket Received!', payload)
                    setNotification({
                        message: "🎟️ 새로운 관객이 티켓을 보냈습니다!",
                        type: 'TICKET'
                    })

                    // 5초 후 알림 자동 삭제
                    setTimeout(() => setNotification(null), 5000)

                    // 데이터 갱신 (선택 사항)
                    router.refresh()
                }
            )
            .subscribe()

        // 컴포넌트 언마운트 시 구독 해제 (메모리 누수 방지)
        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId, supabase, router])

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 20 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] mt-4"
                >
                    {/* 비주얼 마스터의 HUD 디자인 적용 */}
                    <div className="bg-[#0D0B0A]/90 border border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-full shadow-[0_0_15px_rgba(201,162,39,0.3)] backdrop-blur-md flex items-center gap-3 font-mono text-sm">
                        <span className="animate-pulse">🔴 LIVE</span>
                        <span>{notification.message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
