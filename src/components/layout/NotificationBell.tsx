'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, MessageSquare, Ticket, Trophy, Trash2, CheckCircle2, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { getNotifications, markNotificationAsRead, clearNotifications, respondToCastInvitation } from '@/app/archive/actions'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    const fetchNotifications = useCallback(async () => {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.is_read).length)
    }, [])

    useEffect(() => {
        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    console.log('New notification received!', payload)
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchNotifications, supabase])

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }

    const handleClearAll = async () => {
        try {
            await clearNotifications()
            setNotifications([])
            setUnreadCount(0)
            setIsOpen(false)
        } catch (err) {
            console.error('Failed to clear notifications:', err)
        }
    }

    const handleResponse = async (notificationId: string, bucketId: string, status: 'accepted' | 'rejected') => {
        try {
            const result = await respondToCastInvitation(bucketId, status)
            if (result.success) {
                toast.success(status === 'accepted' ? 'Casting invitation accepted!' : 'Invitation declined')
                // Mark as read after responding
                await handleMarkAsRead(notificationId)
                // Refresh to update UI potentially or redirect?
                // For now just update notification state
            } else {
                toast.error(result.error || 'Failed to respond')
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred')
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'COMMENT': return <MessageSquare size={14} className="text-cyan-film" />
            case 'TICKET': return <Ticket size={14} className="text-gold-film" />
            case 'ACHIEVEMENT': return <Trophy size={14} className="text-purple-400" />
            case 'CASTING': return <Users size={14} className="text-white" />
            default: return <Bell size={14} />
        }
    }

    const getMessage = (n: any) => {
        const actor = n.actor?.nickname || 'Someone'
        const title = n.bucket?.title ? `"${n.bucket.title}"` : 'a scene'

        switch (n.type) {
            case 'COMMENT': return `${actor} left a review on ${title}.`
            case 'TICKET': return `${actor} issued a ticket for ${title}.`
            case 'ACHIEVEMENT': return `New achievement unlocked!`
            case 'CASTING': return `${actor} invited you to co-direct ${title}.`
            default: return 'You have a new notification.'
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-smoke hover:text-white transition-colors group"
            >
                <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gold-film text-void text-[9px] font-bold rounded-full flex items-center justify-center shadow-warm border border-void">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile closing */}
                        <div
                            className="fixed inset-0 z-[90] lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 z-[100] bg-void/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-huge overflow-hidden film-border"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-[10px] font-mono-technical tracking-[0.2em] text-gold-film uppercase">
                                    Notifications
                                </h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-[9px] text-smoke hover:text-red-400 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 size={10} />
                                        CLEAR_ALL
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center opacity-20">
                                        <Bell size={32} className="mb-2" />
                                        <span className="text-[10px] tracking-widest uppercase font-mono-technical">No new signals</span>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                            className={`
                                                p-4 border-b border-white/5 flex gap-4 transition-all cursor-pointer hover:bg-white/5
                                                ${!n.is_read ? 'bg-gold-film/5' : ''}
                                            `}
                                        >
                                            <div className="shrink-0 mt-1">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-white' : 'text-smoke'}`}>
                                                    {getMessage(n)}
                                                </p>

                                                {n.type === 'CASTING' && !n.is_read && (
                                                    <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleResponse(n.id, n.bucket_id, 'accepted')}
                                                            className="px-3 py-1 bg-gold-film text-void text-[10px] font-bold rounded-sm hover:bg-gold-warm transition-colors uppercase tracking-wider"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleResponse(n.id, n.bucket_id, 'rejected')}
                                                            className="px-3 py-1 bg-white/10 text-smoke text-[10px] rounded-sm hover:bg-white/20 transition-colors uppercase tracking-wider"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[9px] text-smoke/50 font-mono-technical">
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ko })}
                                                    </span>
                                                    {!n.is_read && (
                                                        <CheckCircle2 size={12} className="text-gold-film/40" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-2 bg-white/5 text-center">
                                    <span className="text-[8px] text-smoke/40 font-mono-technical uppercase tracking-tighter">
                                        End of transmission
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
