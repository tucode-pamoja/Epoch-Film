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
import { CommentSection } from '@/components/archive/comments/CommentSection'
import { ShareButton } from '@/components/archive/ShareButton'
import { saveMemory, updateBucket, updateMemory, deleteMemory, setBucketThumbnail, issueTicket } from '@/app/archive/actions'

interface BucketDetailClientProps {
    bucket: any
    memories: any[]
    letters: any[]
    comments: any[]
    currentUserId: string
    hasIssuedTicket?: boolean
}

export function BucketDetailClient({ bucket, memories, letters, comments, currentUserId, hasIssuedTicket: initialHasIssuedTicket = false }: BucketDetailClientProps) {
    const isOwner = currentUserId === bucket.user_id
    const [activeTab, setActiveTab] = useState<'RECORD' | 'ROADMAP' | 'COMMENTS'>('RECORD')
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
    const [hasAdmitted, setHasAdmitted] = useState(initialHasIssuedTicket)
    const [admitCount, setAdmitCount] = useState(bucket.tickets || 0)
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

    const handleAdmit = async () => {
        if (hasAdmitted) return // Prevent duplicate unless we implement undo

        const previousCount = admitCount
        setHasAdmitted(true)
        setAdmitCount((prev: number) => prev + 1)

        const result = await issueTicket(bucket.id)
        if (!result.success) {
            setHasAdmitted(false)
            setAdmitCount(previousCount)
            alert(result.error || '티켓 발행에 실패했습니다.')
        }
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
                {/* Back Link & Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="group inline-flex items-center gap-2 text-smoke hover:text-gold-film transition-colors">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-mono-technical text-[10px] tracking-widest uppercase">CLOSE_PRODUCTION</span>
                    </Link>
                    <ShareButton title={bucket.title} url={`/archive/${bucket.id}`} />
                </div>
                {/* Cinematic Hero Section - Portrait Poster Style (Fitted & Proportional) */}
                <section className="relative h-[70vh] sm:h-[85vh] aspect-[3/4] sm:aspect-[2/3] w-full max-w-[420px] mx-auto flex flex-col justify-between p-5 sm:p-8 rounded-lg overflow-hidden border border-white/10 shadow-huge group mb-12 sm:mb-24">
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

                    {/* Content Layer - Centered Title & Description */}
                    <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center text-center py-4">
                        <div className="space-y-4 w-full px-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display leading-[1.1] text-white tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] uppercase break-keep">
                                {bucket.title}
                            </h1>

                            <div className="relative px-6 py-3 rounded-xl bg-void/70 backdrop-blur-md border border-white/10 w-full shadow-2xl">
                                <p className="text-xs sm:text-sm md:text-base text-gold-film font-display italic tracking-[0.05em] font-light drop-shadow-md break-keep leading-relaxed">
                                    {bucket.description ? `"${bucket.description}"` : '"A CINEMATIC MASTERPIECE"'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Glass Ticket Component - Re-optimized for Narrow Poster */}
                    <div className="relative z-20 w-full px-2 pb-2">
                        <motion.div
                            className="relative w-full perspective-1000 group/ticket"
                            whileHover={{
                                rotateX: 2,
                                rotateY: -2,
                                scale: 1.01,
                                transition: { duration: 0.4 }
                            }}
                        >
                            <div className="relative flex flex-col shadow-huge overflow-hidden">
                                {/* The Glass Base with Masking */}
                                <div
                                    className="absolute inset-0 bg-white/5 backdrop-blur-3xl border border-white/10"
                                    style={{
                                        WebkitMaskImage: `
                                            radial-gradient(circle 8px at 0 25%, transparent 100%, black 0),
                                            radial-gradient(circle 8px at 100% 25%, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 30% 0, transparent 100%, black 0),
                                            radial-gradient(circle 10px at 30% 100%, transparent 100%, black 0)
                                        `,
                                        WebkitMaskComposite: 'destination-in',
                                        maskComposite: 'intersect',
                                    }}
                                />

                                {/* Ticket Content */}
                                <div className="relative z-10 flex flex-col w-full divide-y divide-dashed divide-white/10">
                                    {/* TOP: DIRECTOR & STATUS */}
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                <User size={10} className="text-gold-film/60" />
                                            </div>
                                            <div className="flex flex-col leading-none">
                                                <p className="font-mono-technical text-[6px] text-smoke/40 tracking-[0.2em] uppercase">Executor</p>
                                                <span className="text-[9px] font-display text-gold-warm tracking-tight">AGENT_{bucket.user_id?.slice(0, 5).toUpperCase() || 'USER'}</span>
                                            </div>
                                        </div>
                                        <div className="px-1 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                                            <span className="text-[6px] font-mono-technical text-smoke/40 uppercase tracking-widest leading-none">SID: {bucket.id?.slice(0, 8) || '0000'}</span>
                                        </div>
                                    </div>

                                    {/* BOTTOM: METADATA GRID */}
                                    <div className="p-4 sm:p-5 grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div className="space-y-1 col-span-2 sm:col-span-1">
                                            <p className="font-mono-technical text-[7px] text-smoke/40 tracking-[0.2em] uppercase opacity-50">Genre / Type</p>
                                            <p className="text-[10px] sm:text-[11px] font-display text-smoke font-medium tracking-widest truncate uppercase">
                                                {bucket.category || 'CINEMA'}
                                                <span className="mx-2 text-white/10">|</span>
                                                <span className="text-gold-film/80">{bucket.target_date ? 'Yearly Scene' : 'My Epoch'}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-mono-technical text-[7px] text-smoke/40 tracking-[0.2em] uppercase opacity-50">Premiere</p>
                                            <p className="text-[10px] sm:text-[11px] font-mono-technical text-celluloid font-bold">{formatDate(bucket?.created_at || new Date().toISOString())}</p>
                                        </div>
                                        <div onClick={handleAdmit} className="space-y-1 cursor-pointer group/stat">
                                            <p className="font-mono-technical text-[7px] text-smoke/40 tracking-[0.2em] uppercase opacity-50">Admit_One</p>
                                            <div className="flex items-center gap-2">
                                                <Ticket size={12} className={`transition-colors ${hasAdmitted ? 'text-gold-film fill-gold-film' : 'text-smoke/40 group-hover/stat:text-gold-film'}`} />
                                                <span className={`text-[11px] font-mono-technical font-bold ${hasAdmitted ? 'text-gold-film' : 'text-smoke/60'}`}>{admitCount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-mono-technical text-[7px] text-smoke/40 tracking-[0.2em] uppercase opacity-50">Manage</p>
                                            <div className="flex items-center gap-2 relative">
                                                <button onClick={() => setIsMoreHorizontalOpen(!isMoreHorizontalOpen)} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                                                    <MoreHorizontal size={14} className="text-smoke/60" />
                                                </button>
                                                <AnimatePresence>
                                                    {isMoreHorizontalOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                                            className="absolute bottom-full right-0 mb-2 w-32 bg-void/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden z-50 shadow-huge pointer-events-auto"
                                                        >
                                                            <button onClick={handleShare} className="w-full px-3 py-2 flex items-center gap-2 text-[10px] text-smoke hover:bg-white/5 transition-colors border-b border-white/5 text-left">
                                                                <Share2 size={10} className="text-gold-film/60" />
                                                                <span>SHARE REEL</span>
                                                            </button>
                                                            {isOwner && (
                                                                <button onClick={() => { setIsMoreHorizontalOpen(false); setIsEditOpen(true); }} className="w-full px-3 py-2 flex items-center gap-2 text-[10px] text-smoke hover:bg-white/5 transition-colors text-left">
                                                                    <Pencil size={10} className="text-gold-film/60" />
                                                                    <span>EDIT PRODUCTION</span>
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Tabs System (Index Look) - Constrained for focused dossier feel */}
                <section className="max-w-4xl mx-auto space-y-0">
                    <div className="flex items-end gap-1 px-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        relative px-4 sm:px-8 py-3 rounded-t-sm transition-all duration-300 group overflow-hidden
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

                    {/* Tab Content Area - Slightly more compact on mobile */}
                    <div className="relative z-20 bg-velvet/80 backdrop-blur-xl border border-white/10 rounded-sm p-4 sm:p-10 shadow-huge film-border min-h-[500px]">
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
                                            <h4 className="text-[10px] sm:text-xs font-mono-technical text-smoke/40 tracking-[0.3em] uppercase underline decoration-gold-film/30 underline-offset-8">Production_Log</h4>
                                        </div>
                                        <Button
                                            onClick={() => setIsAddRecordOpen(true)}
                                            className="h-8 sm:h-10 bg-gold-film/10 hover:bg-gold-film/20 text-gold-film border border-gold-film/30 gap-1 sm:gap-2 px-3 sm:px-4"
                                        >
                                            <Camera size={14} className="sm:w-4 sm:h-4" />
                                            <span className="text-[10px] sm:text-sm">ADD FRAME</span>
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
                                    <RoadmapView bucketId={bucket.id} roadmap={bucket.roadmap} isOwner={isOwner} />
                                </motion.div>
                            )}

                            {activeTab === 'COMMENTS' && (
                                <motion.div
                                    key="comments"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <CommentSection
                                        bucketId={bucket.id}
                                        comments={comments}
                                        currentUserId={currentUserId}
                                    />
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
