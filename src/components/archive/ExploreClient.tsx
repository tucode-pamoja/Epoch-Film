'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, MessageSquare, Share2, MoreHorizontal, User } from 'lucide-react'
import Image from 'next/image'

// Mock Data for Explore Feed
const PUBLIC_BUCKETS = [
    {
        id: '1',
        user: { name: 'Dreamer_01', avatar: null },
        title: '오로라 헌팅 in 아이슬란드',
        category: 'TRAVEL',
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7', // Placeholder
        description: '드디어 꿈꾸던 오로라를 봤습니다. 영하 20도의 추위도 잊게 만드는 장관이었어요.',
        tickets: 142,
        comments: 8,
        is_ticked: false
    },
    {
        id: '2',
        user: { name: 'Cinephile_Kim', avatar: null },
        title: '단편 영화 제작하기',
        category: 'CAREER',
        image: null,
        description: '첫 번째 단편 영화 "기억의 조각" 크랭크업! 3개월간의 대장정이 마무리되었습니다.',
        tickets: 89,
        comments: 12,
        is_ticked: true
    },
    {
        id: '3',
        user: { name: 'Runner_Lee', avatar: null },
        title: '도쿄 마라톤 완주',
        category: 'GROWTH',
        image: 'https://images.unsplash.com/photo-1552674605-4694559e5bc7',
        description: '42.195km. 포기하고 싶은 순간이 100번도 넘었지만 끝내 해냈습니다.',
        tickets: 256,
        comments: 43,
        is_ticked: false
    }
]

export function ExploreClient() {
    const [feed, setFeed] = useState(PUBLIC_BUCKETS)

    const handleTicket = (id: string) => {
        setFeed(feed.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    tickets: item.is_ticked ? item.tickets - 1 : item.tickets + 1,
                    is_ticked: !item.is_ticked
                }
            }
            return item
        }))
    }

    return (
        <div style={{ width: '100%' }} className="space-y-8 pb-32">
            {feed.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-velvet border border-white/5 rounded-sm overflow-hidden film-border shadow-deep"
                >
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-smoke">
                                <User size={16} />
                            </div>
                            <div>
                                <div className="text-sm text-celluloid font-display">{item.user.name}</div>
                                <div className="text-[10px] text-smoke font-mono-technical uppercase">{item.category}</div>
                            </div>
                        </div>
                        <button className="text-smoke hover:text-celluloid">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-0">
                        {item.image && (
                            <div className="relative aspect-video w-full bg-darkroom">
                                {/* Placeholder for image, using div for now as Next/Image needs configured domains */}
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6 space-y-3">
                            <h3 className="text-xl font-display text-gold-warm">{item.title}</h3>
                            <p className="text-sm text-smoke font-light leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => handleTicket(item.id)}
                                className={`flex items-center gap-2 transition-colors ${item.is_ticked ? 'text-gold-film' : 'text-smoke hover:text-gold-film'}`}
                            >
                                <div className={`p-2 rounded-full ${item.is_ticked ? 'bg-gold-film/10' : 'bg-transparent'}`}>
                                    <Ticket size={20} fill={item.is_ticked ? "currentColor" : "none"} />
                                </div>
                                <span className="text-xs font-mono-technical">
                                    {item.is_ticked ? 'TICKETED' : 'TICKET'} ({item.tickets})
                                </span>
                            </button>

                            <button className="flex items-center gap-2 text-smoke hover:text-cyan-film transition-colors">
                                <div className="p-2">
                                    <MessageSquare size={20} />
                                </div>
                                <span className="text-xs font-mono-technical">{item.comments}</span>
                            </button>
                        </div>

                        <button className="text-smoke hover:text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
