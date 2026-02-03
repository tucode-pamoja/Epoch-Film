'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Ticket, ArrowLeft, Heart, MessageCircle, Share2, User, Calendar, MapPin } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

// Combined Mock Data from Hall of Fame & Explore
const MOCK_DB: Record<string, any> = {
    // Hall of Fame
    'h1': {
        title: '나만의 독립서점 열기',
        category: 'CAREER',
        image: 'https://images.unsplash.com/photo-1507842217121-9e87bd229f2c',
        date: '2025.12.24',
        user: { name: 'Dreamer_Sophie', title: 'Visionary Director' },
        description: '3년의 준비 끝에, 망원동 골목에 작은 책방을 열었습니다. 처음에는 아무도 오지 않을까 두려웠지만, 이제는 매일 단골 손님들과 책 이야기를 나누는 것이 제 삶의 낙이 되었습니다.',
        tickets: 1402,
        location: 'Seoul, Mangwon-dong',
        comments: 128
    },
    'h2': {
        title: '알프스 몽블랑 등반',
        category: 'TRAVEL',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        date: '2025.08.15',
        user: { name: 'Adventurer_Jin', title: 'Action Star' },
        description: '내 생애 가장 높은 곳에서, 가장 뜨거운 커피를 마셨다. 숨이 턱 끝까지 차오르는 순간, 눈앞에 펼쳐진 설경은 모든 고통을 잊게 해주었습니다.',
        tickets: 985,
        location: 'Chamonix, France',
        comments: 64
    },
    'h3': {
        title: '미슐랭 1스타 획득',
        category: 'CAREER',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de',
        date: '2026.01.10',
        user: { name: 'Chef_Min', title: 'Artistic Producer' },
        description: '포기하지 않았던 10년, 접시 위에 피어난 결실. 매일 새벽 시장을 오가며 흘린 땀방울이 헛되지 않았음을 증명받았습니다.',
        tickets: 856,
        location: 'Seoul, Gangnam',
        comments: 92
    },
    // Explore Feed
    '1': {
        title: '오로라 헌팅 in 아이슬란드',
        category: 'TRAVEL',
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7',
        date: '2024.11.20',
        user: { name: 'Dreamer_01', title: 'Explorer' },
        description: '드디어 꿈꾸던 오로라를 봤습니다. 영하 20도의 추위도 잊게 만드는 장관이었어요. 사진으로는 절대 담길 수 없는 그 초록빛 춤사위를 눈에 담았습니다.',
        tickets: 142,
        location: 'Reykjavik, Iceland',
        comments: 8
    },
    '2': {
        title: '단편 영화 제작하기',
        category: 'CAREER',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728', // Added placeholder for missing image
        date: '2024.09.15',
        user: { name: 'Cinephile_Kim', title: 'Director' },
        description: '첫 번째 단편 영화 "기억의 조각" 크랭크업! 3개월간의 대장정이 마무리되었습니다. 배우분들과 스탭분들 모두 고생 많으셨습니다.',
        tickets: 89,
        location: 'Busan, Korea',
        comments: 12
    },
    '3': {
        title: '도쿄 마라톤 완주',
        category: 'GROWTH',
        image: 'https://images.unsplash.com/photo-1552674605-4694559e5bc7',
        date: '2024.03.05',
        user: { name: 'Runner_Lee', title: 'Athlete' },
        description: '42.195km. 포기하고 싶은 순간이 100번도 넘었지만 끝내 해냈습니다. 피니시 라인을 통과할 때의 그 짜릿함은 평생 잊지 못할 것입니다.',
        tickets: 256,
        location: 'Tokyo, Japan',
        comments: 43
    },
    // Fallback for Honorable Mentions (Generic)
    'h4': { title: 'Hidden Dream No.4', description: 'This is a hidden gem.', tickets: 120, user: { name: 'Unknown', title: 'Dreamer' }, category: 'MYSTERY', image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38' },
    'h5': { title: 'Hidden Dream No.5', description: 'This is a hidden gem.', tickets: 110, user: { name: 'Unknown', title: 'Dreamer' }, category: 'MYSTERY', image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38' },
    'h6': { title: 'Hidden Dream No.6', description: 'This is a hidden gem.', tickets: 100, user: { name: 'Unknown', title: 'Dreamer' }, category: 'MYSTERY', image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38' },
    'h7': { title: 'Hidden Dream No.7', description: 'This is a hidden gem.', tickets: 90, user: { name: 'Unknown', title: 'Dreamer' }, category: 'MYSTERY', image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38' },
}

export default function ExploreDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const [isTicketed, setIsTicketed] = useState(false)

    // Lookup
    const data = MOCK_DB[id]

    if (!data) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center text-smoke">
                <div className="text-center">
                    <h1 className="text-4xl font-display mb-4">404</h1>
                    <p>필름을 찾을 수 없습니다.</p>
                    <Link href="/explore" className="mt-6 inline-block text-gold-film hover:underline">돌아가기</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-void pb-32 overflow-x-hidden selection:bg-gold-film/30">
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] bg-darkroom">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void z-10" />
                <img
                    src={data.image}
                    alt={data.title}
                    className="w-full h-full object-cover opacity-80"
                />
                <button
                    onClick={() => router.back()}
                    className="absolute top-8 left-6 z-50 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-32 relative z-20 space-y-8">
                {/* Title Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-velvet/80 backdrop-blur-xl border border-white/10 p-8 rounded-sm shadow-deep film-border"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-gold-film/10 border border-gold-film/20 text-[10px] font-mono-technical text-gold-film uppercase tracking-widest">
                            {data.category}
                        </span>
                        {data.location && (
                            <span className="flex items-center gap-1 text-[10px] font-mono-technical text-smoke uppercase tracking-widest">
                                <MapPin size={10} />
                                {data.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-mono-technical text-smoke uppercase tracking-widest ml-auto">
                            <Calendar size={10} />
                            {data.date || '2024.01.01'}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-display text-celluloid mb-4 leading-tight">
                        {data.title}
                    </h1>

                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-smoke overflow-hidden">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="text-sm text-celluloid font-bold">{data.user.name}</div>
                            <div className="text-xs text-smoke font-light">{data.user.title}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4 text-smoke font-mono-technical ml-1">
                        <div className="w-1 h-1 rounded-full bg-gold-film" />
                        <h2 className="text-xs tracking-[0.2em] uppercase">The Story</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <p className="text-lg text-smoke/90 font-light leading-relaxed font-serif whitespace-pre-wrap">
                        {data.description}
                    </p>
                </motion.div>

                {/* Action Dock */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="fixed bottom-32 left-0 right-0 px-6 pointer-events-none flex justify-center"
                >
                    <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
                        <button
                            onClick={() => setIsTicketed(!isTicketed)}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <Ticket
                                size={24}
                                className={`transition-all duration-300 ${isTicketed ? 'text-gold-film fill-gold-film scale-110 drop-shadow-glow' : 'text-smoke group-hover:text-gold-film'}`}
                            />
                            <span className="text-[9px] font-mono-technical text-smoke/60">{isTicketed ? (data.tickets + 1).toLocaleString() : data.tickets.toLocaleString()}</span>
                        </button>

                        <div className="w-px h-8 bg-white/10" />

                        <button className="flex flex-col items-center gap-1 group">
                            <MessageCircle size={24} className="text-smoke group-hover:text-cyan-film transition-colors" />
                            <span className="text-[9px] font-mono-technical text-smoke/60">{data.comments}</span>
                        </button>

                        <div className="w-px h-8 bg-white/10" />

                        <button className="flex flex-col items-center gap-1 group">
                            <Share2 size={24} className="text-smoke group-hover:text-white transition-colors" />
                            <span className="text-[9px] font-mono-technical text-smoke/60">Share</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
