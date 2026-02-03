'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Ticket,
    MessageSquare,
    Share2,
    Heart,
    Calendar,
    User,
    Sparkles,
    Camera,
    ChevronRight,
    ArrowLeft,
    Film,
    MoreHorizontal,
    Pencil,
    Eye,
    EyeOff,
    Globe,
    X,
    Trash2,
    Lock,
    AlertTriangle,
    Clapperboard,
    Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoadmapView } from '@/components/ai/RoadmapView'
import { Button } from '@/components/ui/Button'
import { AddRecordModal } from '@/components/archive/AddRecordModal'
import { saveMemory, updateBucket, updateMemory, deleteMemory, setBucketThumbnail } from '@/app/archive/actions'

interface BucketDetailClientProps {
    bucket: any
    memories: any[]
    letters: any[]
    currentUserId: string
}

export function BucketDetailClient({ bucket, memories, letters, currentUserId }: BucketDetailClientProps) {
    const isOwner = currentUserId === bucket.user_id
    const [activeTab, setActiveTab] = useState<'RECORD' | 'ROADMAP' | 'COMMENTS'>('RECORD')
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
    const [hasAdmitted, setHasAdmitted] = useState(false)
    const [admitCount, setAdmitCount] = useState(1248)
    const [isMoreHorizontalOpen, setIsMoreHorizontalOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isEditRecordOpen, setIsEditRecordOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)

    // Edit states
    const [editForm, setEditForm] = useState({
        title: bucket.title,
        category: bucket.category,
        description: bucket.description || '',
        isPublic: true // Default
    })

    const router = useRouter()

    const handleAdmit = () => {
        setHasAdmitted(!hasAdmitted)
        setAdmitCount(prev => hasAdmitted ? prev - 1 : prev + 1)
    }

    const handleShare = async () => {
        setIsMoreHorizontalOpen(false)
        const shareData = {
            title: bucket.title,
            text: bucket.description,
            url: window.location.href,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData).catch(err => {
                    if (err.name !== 'AbortError' && err.name !== 'InvalidStateError') throw err
                })
            } else {
                await navigator.clipboard.writeText(window.location.href)
                alert('링크가 클립보드에 복사되었습니다.')
            }
        } catch (err) {
            console.error('Share failed:', err)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const formData = new FormData()
            formData.append('title', editForm.title)
            formData.append('category', editForm.category)
            formData.append('description', editForm.description)
            formData.append('isPublic', String(editForm.isPublic))

            await updateBucket(bucket.id, formData)
            setIsEditOpen(false)
            router.refresh()
        } catch (err) {
            console.error('Update failed:', err)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteRecord = async (recordId: string) => {
        if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return
        try {
            await deleteMemory(recordId, bucket.id)
            router.refresh()
        } catch (err) {
            console.error('Delete failed:', err)
        }
    }

    const handleEditRecordSubmit = async (recordId: string, caption: string) => {
        setIsUpdating(true)
        try {
            const formData = new FormData()
            formData.append('caption', caption)
            formData.append('bucketId', bucket.id)
            await updateMemory(recordId, formData)
            setIsEditRecordOpen(false)
            router.refresh()
        } catch (err) {
            console.error('Record update failed:', err)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleSetThumbnail = async (imageUrl: string) => {
        try {
            await setBucketThumbnail(bucket.id, imageUrl)
            router.refresh()
        } catch (err) {
            console.error('Set thumbnail failed:', err)
        }
    }

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    }

    const handleRecordSubmit = async (data: { image?: File; caption: string }) => {
        const formData = new FormData()
        if (data.image) formData.append('image', data.image)
        formData.append('caption', data.caption)

        await saveMemory(bucket.id, formData)
    }

    // Timeline merge (Memories + Letters)
    const timelineItems = [
        ...memories.map(m => ({ ...m, type: 'MEMORY' })),
        ...letters.map(l => ({ ...l, type: 'LETTER' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const tabs = [
        { id: 'RECORD', label: 'THE RECORD', icon: Camera },
        { id: 'ROADMAP', label: 'DIRECTOR\'S CUT', icon: Sparkles },
        { id: 'COMMENTS', label: 'REVIEWS', icon: MessageSquare },
    ]

    return (
        <div className="relative min-h-screen bg-void text-celluloid selection:bg-gold-film/30 overflow-x-hidden w-full flex flex-col items-center">
            {/* Poster Header Background */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none w-full h-full">
                {memories[0]?.media_url ? (
                    <Image
                        src={memories[0].media_url}
                        alt="Poster Background"
                        fill
                        className="object-cover blur-[80px]"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold-film/10 via-void to-purple-dusk/10" />
                )}
            </div>

            <div className="relative z-10 max-w-5xl w-full px-6 py-12 space-y-12">
                {/* Back Link */}
                <Link href="/" className="group inline-flex items-center gap-2 text-smoke hover:text-gold-film transition-colors">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono-technical text-[10px] tracking-widest uppercase">CLOSE_PRODUCTION</span>
                </Link>

                {/* Cinematic Hero Section - Portrait Poster Style */}
                <section className="relative aspect-[3/4] md:aspect-[2/3] max-w-5xl mx-auto flex flex-col justify-between p-8 sm:p-20 rounded-md overflow-hidden border border-white/10 shadow-huge group mb-24">
                    {/* Hero Background Layer */}
                    <div className="absolute inset-0 z-0">
                        {bucket.thumbnail_url || memories.length > 0 ? (
                            <>
                                <Image
                                    src={bucket.thumbnail_url || memories[memories.length - 1].media_url}
                                    alt={bucket.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                {/* Background Dimming & Vignette for Text Readability */}
                                <div className="absolute inset-0 bg-void/30" />
                                <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" />
                                <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-void to-transparent" />
                                {/* Film Grain Overlay */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-darkroom flex items-center justify-center">
                                <Film className="w-16 h-16 text-white/5" />
                            </div>
                        )}
                    </div>

                    {/* Content Layer - Main Title Area */}
                    <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <div className="space-y-8 max-w-5xl px-4 flex-grow flex flex-col justify-center">
                            <h1 className="text-5xl md:text-7xl lg:text-[8rem] font-display leading-[1.1] text-white tracking-[-0.04em] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] uppercase break-keep">
                                {bucket.title}
                            </h1>

                            <div className="relative px-8 py-3 rounded-2xl bg-void/60 backdrop-blur-md border border-white/10 max-w-3xl mx-auto shadow-2xl">
                                <p className="text-base md:text-xl lg:text-2xl text-gold-film font-display italic tracking-[0.05em] font-light drop-shadow-md break-keep leading-relaxed">
                                    {bucket.description ? `"${bucket.description}"` : '"A CINEMATIC MASTERPIECE"'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Glass Ticket Component - Anchored to Bottom */}
                    <div className="relative z-20 w-full max-w-4xl mx-auto flex justify-center pb-8 pt-12">
                        <motion.div
                            className="relative max-w-4xl w-full perspective-1000 group/ticket"
                            whileHover={{
                                rotateX: 3,
                                rotateY: -3,
                                scale: 1.02,
                                transition: { duration: 0.5, ease: "easeOut" }
                            }}
                        >
                            {/* Main Glass Ticket Body Wrapper (No Mask here to prevent clipping dropdowns) */}
                            <div className="relative flex flex-col sm:flex-row min-h-[160px] shadow-huge">
                                {/* The Glass Base with Masking */}
                                <div
                                    className="absolute inset-0 bg-white/5 backdrop-blur-3xl border border-white/10"
                                    style={{
                                        WebkitMaskImage: `
                                            radial-gradient(circle 10px at 0 25%, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 0 50%, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 0 75%, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 100% 25%, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 100% 50%, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 100% 75%, transparent 100%, black 0),
                                            radial-gradient(circle 12px at 30% 0, transparent 100%, black 0),
                                            radial-gradient(circle 12px at 30% 100%, transparent 100%, black 0)
                                        `,
                                        WebkitMaskComposite: 'destination-in',
                                        maskComposite: 'intersect',
                                    }}
                                />

                                {/* Content stays inside but above the mask */}
                                <div className="relative z-10 flex flex-col sm:flex-row w-full">
                                    {/* LEFT SECTION: DIRECTOR_CREDIT */}
                                    <div className="w-full sm:w-[30%] p-8 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-dashed border-white/10 relative">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="font-mono-technical text-[8px] text-smoke/40 tracking-[0.4em] uppercase">Executive Producer</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                                        <User size={16} className="text-gold-film/60" />
                                                    </div>
                                                    <div className="flex flex-col leading-none">
                                                        <span className="text-sm font-display text-gold-warm tracking-tight">AGENT_{bucket.user_id.slice(0, 5).toUpperCase()}</span>
                                                        <span className="text-[9px] font-mono-technical text-smoke/30 uppercase mt-1 tracking-tighter">Verified Studio Member</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                                                <span className="text-[8px] font-mono-technical text-smoke/40 uppercase tracking-widest leading-none">SID: {bucket.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT SECTION: FILM_METADATA */}
                                    <div className="flex-1 p-8 grid grid-cols-2 sm:grid-cols-4 gap-8 items-center bg-white/[0.01]">
                                        {/* Genre */}
                                        <div className="space-y-1">
                                            <p className="font-mono-technical text-[8px] text-smoke/40 tracking-[0.3em] uppercase opacity-50">Genre</p>
                                            <p className="text-sm font-display text-smoke font-medium tracking-widest truncate uppercase pt-1">{bucket.category || 'CINEMA'}</p>
                                        </div>

                                        {/* Premiere */}
                                        <div className="space-y-1">
                                            <p className="font-mono-technical text-[8px] text-smoke/40 tracking-[0.3em] uppercase opacity-50">Premiere</p>
                                            <p className="text-sm font-mono-technical text-celluloid font-bold pt-1">{formatDate(bucket?.created_at || new Date().toISOString())}</p>
                                        </div>

                                        {/* Admit One (Ticket) */}
                                        <div
                                            onClick={handleAdmit}
                                            className="flex flex-col items-center sm:items-start group/stat cursor-pointer hover:translate-y-[-2px] transition-transform select-none"
                                        >
                                            <p className="font-mono-technical text-[8px] text-smoke/40 tracking-[0.3em] uppercase mb-2 opacity-50">Admit_One</p>
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`p-1.5 rounded-sm transition-colors ${hasAdmitted ? 'bg-gold-film/10' : 'bg-transparent'}`}
                                                >
                                                    <Ticket
                                                        size={16}
                                                        className={`transition-colors ${hasAdmitted ? 'text-gold-film fill-gold-film' : 'text-smoke/40 group-hover/stat:text-gold-film'}`}
                                                    />
                                                </motion.div>
                                                <span className={`text-lg font-mono-technical font-bold tracking-tighter leading-none transition-colors ${hasAdmitted ? 'text-gold-film' : 'text-smoke/60 group-hover/stat:text-smoke'}`}>
                                                    {admitCount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* More Actions Menu */}
                                        <div className="relative flex flex-col items-center sm:items-start group/action select-none">
                                            <p className="font-mono-technical text-[8px] text-smoke/40 tracking-[0.3em] uppercase mb-2 opacity-50">Manage_Reel</p>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsMoreHorizontalOpen(!isMoreHorizontalOpen)}
                                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 group/more"
                                                    title="더 보기"
                                                >
                                                    <MoreHorizontal size={16} className="text-smoke/60 group-hover/more:text-smoke" />
                                                </button>

                                                {/* More Menu Dropdown */}
                                                <AnimatePresence>
                                                    {isMoreHorizontalOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-void/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden z-50 shadow-huge"
                                                        >
                                                            {/* Share is always available */}
                                                            <button
                                                                onClick={handleShare}
                                                                className="w-full px-4 py-3 flex items-center gap-3 text-xs text-smoke hover:bg-white/5 transition-colors border-b border-white/5"
                                                            >
                                                                <Share2 size={14} className="text-gold-film/60" />
                                                                <span>공유하기</span>
                                                            </button>

                                                            {/* Second option depends on ownership */}
                                                            {isOwner ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setIsMoreHorizontalOpen(false)
                                                                        setIsEditOpen(true)
                                                                    }}
                                                                    className="w-full px-4 py-3 flex items-center gap-3 text-xs text-smoke hover:bg-white/5 transition-colors"
                                                                >
                                                                    <Pencil size={14} className="text-gold-film/60" />
                                                                    <span>편집하기</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setIsMoreHorizontalOpen(false)
                                                                        alert('신고 기능은 준비 중입니다.')
                                                                    }}
                                                                    className="w-full px-4 py-3 flex items-center gap-3 text-xs text-red-400 hover:bg-white/5 transition-colors"
                                                                >
                                                                    <AlertTriangle size={14} className="text-red-400/60" />
                                                                    <span>신고하기</span>
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Glass Surface Highlight */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none opacity-0 group-hover/ticket:opacity-100 transition-opacity duration-700" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Tabs System (Index Look) */}
                <section className="space-y-0">
                    <div className="flex items-end gap-1 px-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        relative px-8 py-3 rounded-t-sm transition-all duration-300 group overflow-hidden
                                        ${isActive
                                            ? 'bg-velvet border-t border-l border-r border-gold-film/30 text-gold-film shadow-[0_-5px_20px_rgba(201,162,39,0.1)]'
                                            : 'bg-white/5 border-t border-l border-r border-white/5 text-smoke/60 hover:text-smoke hover:bg-white/10'
                                        }
                                    `}
                                    style={{
                                        transform: isActive ? 'translateY(0)' : 'translateY(4px)',
                                        zIndex: isActive ? 20 : 10
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={isActive ? 'text-gold-film' : 'text-smoke/40'} />
                                        <span className="font-mono-technical text-[10px] tracking-widest font-bold uppercase">{tab.label}</span>
                                    </div>
                                    {/* Skew effect for "Index" look */}
                                    <div className={`absolute top-0 right-0 w-4 h-full bg-inherit origin-bottom translate-x-1/2 skew-x-12 ${isActive ? 'border-r border-gold-film/30' : 'border-r border-white/5'}`} />
                                    <div className={`absolute top-0 left-0 w-4 h-full bg-inherit origin-bottom -translate-x-1/2 -skew-x-12 ${isActive ? 'border-l border-gold-film/30' : 'border-l border-white/5'}`} />
                                </button>
                            )
                        })}
                    </div>

                    {/* Tab Content Area */}
                    <div className="relative z-20 bg-velvet/80 backdrop-blur-xl border border-white/10 rounded-sm p-8 sm:p-12 shadow-huge film-border min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'RECORD' && (
                                <motion.div
                                    key="record"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-12"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-mono-technical text-smoke/40 tracking-[0.3em] uppercase underline decoration-gold-film/30 underline-offset-8">Production_Log</h4>
                                        </div>
                                        <Button
                                            onClick={() => setIsAddRecordOpen(true)}
                                            className="bg-gold-film/10 hover:bg-gold-film/20 text-gold-film border border-gold-film/30 gap-2"
                                        >
                                            <Camera size={16} />
                                            <span>ADD FRAME</span>
                                        </Button>
                                    </div>
                                    {timelineItems.length > 0 ? (
                                        <div className="space-y-16 relative">
                                            {/* Vertical Timeline Bar */}
                                            <div className="absolute left-0 sm:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden sm:block" />

                                            {timelineItems.map((item, idx) => {
                                                const isEven = idx % 2 === 0
                                                return (
                                                    <div key={item.id} className={`flex flex-col sm:flex-row items-center gap-8 group/item ${isEven ? 'sm:flex-row-reverse' : ''}`}>
                                                        <div className="flex-1 w-full space-y-4 relative">
                                                            {item.type === 'MEMORY' ? (
                                                                <div className="space-y-4">
                                                                    <div className="group relative aspect-[4/3] rounded-sm overflow-hidden border border-white/5 shadow-deep bg-darkroom">
                                                                        <Image src={item.media_url} alt={item.caption || 'Memory'} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />

                                                                        {/* Hover Actions for Records */}
                                                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                                                            {isOwner && (
                                                                                <button
                                                                                    onClick={() => handleSetThumbnail(item.media_url)}
                                                                                    className={`p-2 bg-void/80 backdrop-blur-md rounded-full transition-colors border border-white/10 ${bucket.thumbnail_url === item.media_url ? 'text-gold-film bg-gold-film/10 border-gold-film/30' : 'text-smoke/60 hover:text-gold-film'}`}
                                                                                    title="대표 이미지로 설정"
                                                                                >
                                                                                    <Clapperboard size={14} className={bucket.thumbnail_url === item.media_url ? "animate-pulse" : ""} />
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingRecord(item)
                                                                                    setIsEditRecordOpen(true)
                                                                                }}
                                                                                className="p-2 bg-void/80 backdrop-blur-md rounded-full text-gold-film/60 hover:text-gold-film transition-colors border border-white/10"
                                                                            >
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteRecord(item.id)}
                                                                                className="p-2 bg-void/80 backdrop-blur-md rounded-full text-red-500/60 hover:text-red-500 transition-colors border border-white/10"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-8 bg-purple-dusk/5 border border-purple-dusk/20 rounded-sm italic text-smoke font-light leading-relaxed relative group">
                                                                    {item.content}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Center Dot */}
                                                        <div className="relative z-10 hidden sm:block">
                                                            <div className="w-4 h-4 rounded-full border-2 border-gold-film bg-void shadow-[0_0_15px_rgba(201,162,39,0.4)]" />
                                                        </div>

                                                        <div className={`flex-1 w-full flex flex-col ${isEven ? 'items-start sm:items-start' : 'items-end sm:items-end'} text-center sm:text-left`}>
                                                            <span className="font-mono-technical text-[10px] text-gold-film/60 tracking-widest">{formatDate(item.created_at)}</span>
                                                            <div className={`mt-4 w-full ${isEven ? 'text-left' : 'text-right'}`}>
                                                                <div className="flex flex-col gap-2">
                                                                    <p className="text-smoke text-sm sm:text-base font-display italic leading-relaxed whitespace-normal break-words">
                                                                        {item.type === 'MEMORY'
                                                                            ? (item.caption || '장면이 기록되었습니다.')
                                                                            : (item.content?.slice(0, 100) || '자아성찰이 기록되었습니다.')
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-smoke/20">
                                                <Camera size={24} />
                                            </div>
                                            <div>
                                                <p className="text-smoke italic font-light">아직 이 장면에 기록된 프레임이 없습니다.</p>
                                                <p className="text-[10px] font-mono-technical text-smoke/30 uppercase tracking-widest mt-2">No sequences captured in the production log yet.</p>
                                            </div>
                                            <Button
                                                onClick={() => setIsAddRecordOpen(true)}
                                                className="bg-gold-film text-void hover:bg-gold-warm px-8 font-bold"
                                            >
                                                ADD FIRST FRAME
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'ROADMAP' && (
                                <motion.div
                                    key="roadmap"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <RoadmapView bucketId={bucket.id} roadmap={bucket.roadmap} />
                                </motion.div>
                            )}

                            {activeTab === 'COMMENTS' && (
                                <motion.div
                                    key="comments"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-8"
                                >
                                    <div className="p-8 border border-white/5 rounded-sm bg-white/[0.02] flex items-center justify-center min-h-[200px]">
                                        <div className="text-center space-y-4">
                                            <MessageSquare className="w-12 h-12 text-smoke/20 mx-auto" />
                                            <p className="text-smoke italic font-light">리뷰 시스템 준비 중입니다...</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div >

            <AddRecordModal
                isOpen={isAddRecordOpen}
                onClose={() => setIsAddRecordOpen(false)}
                onAdd={handleRecordSubmit}
                bucketTitle={bucket.title}
            />

            {/* Edit Project Modal */}
            <AnimatePresence>
                {isEditOpen && (
                    <div className="fixed inset-0 z-[999]" style={{ display: 'block', width: '100vw', height: '100vh' }}>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditOpen(false)}
                            className="fixed inset-0 bg-void/90 backdrop-blur-md"
                        />

                        {/* Content Centering Wrapper */}
                        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-void border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
                                style={{
                                    width: 'min(580px, 95vw)',
                                    minWidth: '300px',
                                    maxHeight: '90vh'
                                }}
                            >
                                <form onSubmit={handleEditSubmit} className="p-8 space-y-8 overflow-y-auto">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-3xl font-display text-celluloid tracking-tight">프로젝트 정보 수정</h2>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditOpen(false)}
                                                className="p-2 hover:bg-white/5 rounded-full text-smoke/40 hover:text-smoke transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <p className="text-smoke/40 font-mono-technical text-[10px] tracking-widest uppercase">Production Settings</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono-technical uppercase tracking-widest text-smoke/60">프로젝트 제목</label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-smoke focus:outline-none focus:border-gold-film/30 transition-colors"
                                                placeholder="목표의 제목을 입력하세요"
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono-technical uppercase tracking-widest text-smoke/60">카테고리</label>
                                            <div className="relative">
                                                <select
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-smoke focus:outline-none focus:border-gold-film/30 transition-colors appearance-none"
                                                >
                                                    <option value="TRAVEL">TRAVEL</option>
                                                    <option value="SKILL">SKILL</option>
                                                    <option value="HEALTH">HEALTH</option>
                                                    <option value="CULTURE">CULTURE</option>
                                                    <option value="CAREER">CAREER</option>
                                                    <option value="OTHER">OTHER</option>
                                                </select>
                                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke/20 rotate-90 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono-technical uppercase tracking-widest text-smoke/60">상세 설명</label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-smoke focus:outline-none focus:border-gold-film/30 transition-colors min-h-[120px] resize-none font-light leading-relaxed"
                                                placeholder="목표에 대해 설명해주세요"
                                            />
                                        </div>

                                        {/* Visibility Setting */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-mono-technical uppercase tracking-widest text-smoke/60">공개 설정</label>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm({ ...editForm, isPublic: true })}
                                                    className={`flex-1 p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${editForm.isPublic ? 'bg-gold-film/10 border-gold-film/30 text-gold-film' : 'bg-white/5 border-white/10 text-smoke/40 opacity-50 hover:opacity-80'}`}
                                                >
                                                    <Globe size={20} />
                                                    <span className="text-xs font-mono-technical uppercase tracking-widest">Public</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm({ ...editForm, isPublic: false })}
                                                    className={`flex-1 p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${!editForm.isPublic ? 'bg-gold-film/10 border-gold-film/30 text-gold-film' : 'bg-white/5 border-white/10 text-smoke/40 opacity-50 hover:opacity-80'}`}
                                                >
                                                    <Lock size={20} />
                                                    <span className="text-xs font-mono-technical uppercase tracking-widest">Private</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditOpen(false)}
                                            className="flex-1 px-6 py-4 rounded-lg bg-white/5 border border-white/10 text-smoke/60 hover:text-smoke hover:bg-white/10 transition-colors text-sm font-medium"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="flex-1 px-6 py-4 rounded-lg bg-gold-film text-void hover:bg-gold-warm transition-all duration-300 text-sm font-bold disabled:opacity-50 shadow-[0_0_20px_rgba(201,162,39,0.2)] active:scale-95"
                                        >
                                            {isUpdating ? 'PRODUCTION UPDATING...' : 'SAVE CHANGES'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Record Modal */}
            <AnimatePresence>
                {isEditRecordOpen && editingRecord && (
                    <div className="fixed inset-0 z-[999]" style={{ display: 'block', width: '100vw', height: '100vh' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditRecordOpen(false)}
                            className="fixed inset-0 bg-void/90 backdrop-blur-md"
                        />
                        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-void border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
                                style={{
                                    width: 'min(500px, 95vw)',
                                    minWidth: '300px'
                                }}
                            >
                                <div className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-display text-celluloid tracking-tight">기록 수정</h2>
                                            <button
                                                onClick={() => setIsEditRecordOpen(false)}
                                                className="p-2 hover:bg-white/5 rounded-full text-smoke/40 hover:text-smoke transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <p className="text-smoke/40 font-mono-technical text-[10px] tracking-widest uppercase">Update Directorial Notes</p>
                                    </div>

                                    {editingRecord.media_url && (
                                        <div className="relative aspect-video rounded-sm overflow-hidden border border-white/10">
                                            <Image src={editingRecord.media_url} alt="Frame" fill className="object-cover opacity-50" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono-technical uppercase tracking-widest text-smoke/60">기록 내용</label>
                                            <textarea
                                                defaultValue={editingRecord.caption || editingRecord.content || ''}
                                                id="record-caption"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-smoke focus:outline-none focus:border-gold-film/30 transition-colors min-h-[120px] resize-none font-light leading-relaxed"
                                                placeholder="내용을 입력하세요"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsEditRecordOpen(false)}
                                            className="flex-1 px-6 py-4 rounded-lg bg-white/5 border border-white/10 text-smoke/60 hover:text-smoke hover:bg-white/10 transition-colors text-sm"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={() => {
                                                const caption = (document.getElementById('record-caption') as HTMLTextAreaElement).value
                                                handleEditRecordSubmit(editingRecord.id, caption)
                                            }}
                                            disabled={isUpdating}
                                            className="flex-1 px-6 py-4 rounded-lg bg-gold-film text-void hover:bg-gold-warm transition-all text-sm font-bold disabled:opacity-50"
                                        >
                                            {isUpdating ? '저장 중...' : '기록 저장'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    )
}
