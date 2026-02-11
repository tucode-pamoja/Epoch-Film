'use client'

import { useState, useTransition, useOptimistic, useMemo, useRef } from 'react'
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
    Check,
    Copy,
    Users,
    Loader2,
    Image as ImageIcon,
    Star
} from 'lucide-react'
import Image from 'next/image'
import { CinematicImage } from '@/components/archive/CinematicImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoadmapView } from '@/components/ai/RoadmapView'
import { Button } from '@/components/ui/Button'
import { AddRecordModal } from '@/components/archive/AddRecordModal'
import { CommentSection } from '@/components/archive/comments/CommentSection'
import { ShareButton } from '@/components/archive/ShareButton'
import { RemakeModal } from '@/components/archive/RemakeModal'
import { CastingModal } from '@/components/archive/CastingModal'
import { FlashBulb } from '@/components/layout/FlashBulb'
import { saveMemory, updateBucket, updateMemory, deleteMemory, updateMemoryCaption, updateMemoryImage, setBucketThumbnail, issueTicket, remakeBucket, inviteCast, getMutualFollowers, deleteBucket } from '@/app/archive/actions'
import { toast } from 'sonner'


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
    const userCast = bucket.bucket_casts?.find((c: any) => c.user_id === currentUserId && (c.is_accepted ?? (c.status === 'accepted')))
    const isCast = !!userCast
    // Polyfill role if missing (schema update pending)
    const currentUserRole = userCast?.role || (isCast ? 'ACTOR' : undefined)
    const canContribute = isOwner || (userCast && (currentUserRole === 'CO_DIRECTOR' || currentUserRole === 'ACTOR'))

    const [activeTab, setActiveTab] = useState<'RECORD' | 'FOOTPRINTS' | 'ROADMAP' | 'COMMENTS'>(bucket.is_routine ? 'FOOTPRINTS' : 'RECORD')
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
    const [isMoreHorizontalOpen, setIsMoreHorizontalOpen] = useState(false)
    const [flashTrigger, setFlashTrigger] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isEditRecordOpen, setIsEditRecordOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [hasIssuedTicket, setHasIssuedTicket] = useState(initialHasIssuedTicket)
    const [isPending, startTransition] = useTransition()

    // Optimistic State for Tickets
    const [optimisticTicketState, addOptimisticTicket] = useOptimistic(
        { hasIssued: hasIssuedTicket, count: bucket.tickets || 0 },
        (state, newHasIssued: boolean) => ({
            hasIssued: newHasIssued,
            count: newHasIssued ? state.count + 1 : state.count - 1
        })
    )

    // Optimistic State for Memories
    const [optimisticMemories, addOptimisticMemory] = useOptimistic(
        memories,
        (state, newMemory: any) => [newMemory, ...state]
    )

    // Edit states
    const [editForm, setEditForm] = useState({
        title: bucket.title,
        category: bucket.category,
        description: bucket.description || '',
        isPublic: bucket.is_public ?? true
    })

    const router = useRouter()

    // Casting Modal State (To be implemented)
    const [isCastingModalOpen, setIsCastingModalOpen] = useState(false)
    const [isRemakeModalOpen, setIsRemakeModalOpen] = useState(false)

    const handleRemake = () => {
        setIsRemakeModalOpen(true)
    }

    const confirmRemake = () => {
        startTransition(async () => {
            try {
                const newBucket = await remakeBucket(bucket.id)
                toast.success('시나리오가 성공적으로 리메이크되었습니다.')
                setIsRemakeModalOpen(false)
                router.push(`/archive/${newBucket.id}`)
            } catch (error) {
                console.error(error)
                toast.error('리메이크에 실패했습니다. (콘솔 확인)')
            }
        })
    }

    const handleDeleteBucket = async () => {
        setIsMoreHorizontalOpen(false)
        startTransition(async () => {
            try {
                await deleteBucket(bucket.id)
                toast.success('에포크 필름이 성공적으로 파기되었습니다.')
                router.push('/')
            } catch (error) {
                console.error(error)
                toast.error('필름 파기에 실패했습니다.')
            }
        })
    }


    const handleAdmit = async () => {
        if (optimisticTicketState.hasIssued) return

        startTransition(async () => {
            addOptimisticTicket(true)
            const result = await issueTicket(bucket.id)
            if (!result.success) {
                toast.error(result.error || '티켓 발행에 실패했습니다.')
            } else {
                toast.success('티켓이 발행되었습니다!')
            }
        })
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
                toast.success('링크가 클립보드에 복사되었습니다.')
            }
        } catch (err) {
            console.error('Share failed:', err)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append('title', editForm.title)
                formData.append('category', editForm.category)
                formData.append('description', editForm.description)
                formData.append('isPublic', String(editForm.isPublic))

                await updateBucket(bucket.id, formData)
                setIsEditOpen(false)
                toast.success('Production updated')
                router.refresh()
            } catch (err) {
                toast.error('Update failed')
            }
        })
    }

    const handleDeleteRecord = async (recordId: string) => {
        startTransition(async () => {
            try {
                await deleteMemory(recordId, bucket.id)
                toast.success('Record deleted')
                router.refresh()
            } catch (err) {
                toast.error('Delete failed')
            }
        })
    }

    const handleEditRecordSubmit = async (recordId: string, caption: string) => {
        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append('caption', caption)
                formData.append('bucketId', bucket.id)
                await updateMemory(recordId, formData)
                setIsEditRecordOpen(false)
                toast.success('Record updated')
                router.refresh()
            } catch (err) {
                toast.error('Record update failed')
            }
        })
    }

    const handleSetThumbnail = async (imageUrl: string) => {
        startTransition(async () => {
            try {
                await setBucketThumbnail(bucket.id, imageUrl)
                setFootprintMenuId(null)
                toast.success('대표 이미지가 설정되었습니다')
                router.refresh()
            } catch (err) {
                toast.error('대표 이미지 설정에 실패했습니다')
            }
        })
    }

    // Image update logic for footprints
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [updatingImageMemoryId, setUpdatingImageMemoryId] = useState<string | null>(null)

    const handleImageUpdateClick = (memoryId: string) => {
        setUpdatingImageMemoryId(memoryId)
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !updatingImageMemoryId) return

        const formData = new FormData()
        formData.append('image', file)

        startTransition(async () => {
            try {
                await updateMemoryImage(updatingImageMemoryId, bucket.id, formData)
                toast.success('이미지가 변경되었습니다')
            } catch (err) {
                toast.error('이미지 변경에 실패했습니다')
            } finally {
                setUpdatingImageMemoryId(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        })
    }

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    }

    const DAY_NAMES_KR = ['일', '월', '화', '수', '목', '금', '토']
    const formatDateWithDay = (dateString: string) => {
        const d = new Date(dateString)
        const dayName = DAY_NAMES_KR[d.getDay()]
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${dayName})`
    }

    // Calculate routine streak (combo) based on frequency
    const routineStreak = useMemo(() => {
        if (!bucket.is_routine || memories.length === 0) return 0

        const sorted = [...memories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        if (bucket.routine_frequency === 'DAILY') {
            // DAILY: check consecutive calendar days backward from today
            let streak = 0
            const now = new Date()
            let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            // Check if there's a completion today first
            const hasToday = sorted.some(m => new Date(m.created_at).toDateString() === checkDate.toDateString())
            if (!hasToday) {
                // Check yesterday (allow 1 day grace)
                checkDate.setDate(checkDate.getDate() - 1)
                const hasYesterday = sorted.some(m => new Date(m.created_at).toDateString() === checkDate.toDateString())
                if (!hasYesterday) return 0
            }

            // Walk backward from the check point
            for (let dayOffset = hasToday ? 0 : 1; ; dayOffset++) {
                const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset)
                const hasCompletion = sorted.some(m => new Date(m.created_at).toDateString() === target.toDateString())
                if (hasCompletion) { streak++ } else { break }
            }
            return streak
        }

        if (bucket.routine_frequency === 'WEEKLY') {
            // WEEKLY: group by ISO week, check if each week meets the required number of completions
            const requiredPerWeek = bucket.routine_days?.length || 1

            // Helper: get Monday of the week for a date
            const getWeekStart = (d: Date) => {
                const day = d.getDay()
                const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
                return new Date(d.getFullYear(), d.getMonth(), diff)
            }

            const getWeekKey = (d: Date) => {
                const ws = getWeekStart(d)
                return `${ws.getFullYear()}-${String(ws.getMonth() + 1).padStart(2, '0')}-${String(ws.getDate()).padStart(2, '0')}`
            }

            // Group memories by week
            const weekMap = new Map<string, number>()
            sorted.forEach(m => {
                const key = getWeekKey(new Date(m.created_at))
                weekMap.set(key, (weekMap.get(key) || 0) + 1)
            })

            // Walk backward from current week
            const now = new Date()
            let streak = 0
            let currentWeekStart = getWeekStart(now)

            // Check current week: might be in progress, so check if previous week was met
            const currentWeekKey = getWeekKey(now)
            const currentWeekCount = weekMap.get(currentWeekKey) || 0

            // If current week already meets quota, count it
            if (currentWeekCount >= requiredPerWeek) {
                streak++
            }

            // Walk backward through previous weeks
            for (let weekOffset = 1; weekOffset <= 52; weekOffset++) {
                const weekStart = new Date(currentWeekStart.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000)
                const weekKey = getWeekKey(weekStart)
                const count = weekMap.get(weekKey) || 0
                if (count >= requiredPerWeek) { streak++ } else { break }
            }

            return streak
        }

        if (bucket.routine_frequency === 'MONTHLY') {
            // MONTHLY: check consecutive calendar months
            let streak = 0
            const now = new Date()

            for (let monthOffset = 0; monthOffset <= 12; monthOffset++) {
                const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
                const hasCompletion = sorted.some(m => {
                    const d = new Date(m.created_at)
                    return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear()
                })
                if (hasCompletion) { streak++ } else { break }
            }
            return streak
        }

        return 0
    }, [bucket, memories])

    // Footprint editing state
    const [editingFootprintId, setEditingFootprintId] = useState<string | null>(null)
    const [editingCaption, setEditingCaption] = useState('')
    const [footprintMenuId, setFootprintMenuId] = useState<string | null>(null)

    const handleFootprintEdit = async (memoryId: string) => {
        if (!editingCaption.trim()) return
        startTransition(async () => {
            try {
                await updateMemoryCaption(memoryId, bucket.id, editingCaption.trim())
                setEditingFootprintId(null)
                toast.success('기록이 수정되었습니다')
            } catch {
                toast.error('수정에 실패했습니다')
            }
        })
    }

    const handleFootprintDelete = async (memoryId: string) => {
        if (!confirm('이 발자취를 삭제하시겠습니까?')) return
        startTransition(async () => {
            try {
                await deleteMemory(memoryId, bucket.id)
                setFootprintMenuId(null)
                toast.success('발자취가 삭제되었습니다')
            } catch {
                toast.error('삭제에 실패했습니다')
            }
        })
    }


    const handleRecordSubmit = async (data: {
        image?: File;
        caption: string;
        location_lat?: number | null;
        location_lng?: number | null;
        captured_at?: string | null;
    }) => {
        startTransition(async () => {
            const formData = new FormData()
            if (data.image) formData.append('image', data.image)
            formData.append('caption', data.caption)

            // Append metadata if present
            if (data.location_lat != null) {
                formData.append('location_lat', String(data.location_lat))
            }
            if (data.location_lng != null) {
                formData.append('location_lng', String(data.location_lng))
            }
            if (data.captured_at) {
                formData.append('captured_at', data.captured_at)
            }

            const optimisticId = 'temp-' + Date.now()
            addOptimisticMemory({
                id: optimisticId,
                type: 'MEMORY',
                media_url: data.image ? URL.createObjectURL(data.image) : null,
                caption: data.caption,
                created_at: new Date().toISOString(),
                isOptimistic: true
            })

            try {
                const result = await saveMemory(bucket.id, formData)
                if (result.success) {
                    setFlashTrigger(true)
                    setIsAddRecordOpen(false)
                    toast.success('Frame added to production')
                    router.refresh()
                } else {
                    toast.error(result.error || 'Failed to add frame')
                }
            } catch (error) {
                toast.error('Failed to add frame')
            }
        })
    }

    // Timeline merge (Memories + Letters)
    const timelineItems = [
        ...optimisticMemories.map(m => ({ ...m, type: 'MEMORY' })),
        ...letters.map(l => ({ ...l, type: 'LETTER' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const tabs = [
        ...(!bucket.is_routine ? [{ id: 'RECORD', label: 'THE RECORD', icon: Camera }] : []),
        ...(bucket.is_routine ? [{ id: 'FOOTPRINTS', label: 'FOOTPRINTS', icon: Film }] : []),
        { id: 'ROADMAP', label: 'DIRECTOR\'S CUT', icon: Sparkles },
        { id: 'COMMENTS', label: 'REVIEWS', icon: MessageSquare },
    ]

    return (
        <div className="relative min-h-screen bg-void pb-32 w-full flex flex-col items-center overflow-x-hidden">
            <AnimatePresence>
                {isPending && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
                        key="bucket-pending-overlay"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/80 rounded-full border border-gold-film/20 shadow-lg">
                            <Loader2 className="w-4 h-4 text-gold-film animate-spin" />
                            <span className="font-mono-technical text-[10px] text-gold-film tracking-[0.3em] uppercase">PROCESSING...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    scale: isPending ? 0.98 : 1,
                    filter: isPending ? 'grayscale(0.5)' : 'none'
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center"
            >
                {/* Poster Header Background */}
                <div className="fixed inset-0 z-0 opacity-20 pointer-events-none w-full h-full">
                    {memories[0]?.media_url ? (
                        <CinematicImage
                            src={memories[0].media_url}
                            alt="Poster Background"
                            fill
                            showGrain={false}
                            className="object-cover blur-[80px]"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold-film/10 via-void to-purple-dusk/10" />
                    )}
                </div>

                <div className="relative z-10 max-w-5xl w-full px-6 py-12 space-y-12">
                    {/* Back Link & Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => {
                                if (window.history.length > 1) {
                                    router.back();
                                } else {
                                    router.push('/');
                                }
                            }}
                            className="group inline-flex items-center gap-2 text-smoke hover:text-gold-film transition-colors"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-mono-technical text-[10px] tracking-widest uppercase">CLOSE_PRODUCTION</span>
                        </button>



                        <div className="flex items-center gap-3">
                            {isOwner ? (
                                <button
                                    onClick={() => setIsCastingModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono-technical text-smoke transition-colors tracking-widest"
                                >
                                    <Users size={12} />
                                    CASTING
                                </button>
                            ) : !bucket.original_bucket_id ? (
                                <button
                                    onClick={handleRemake}
                                    className="flex items-center gap-2 px-4 py-2 rounded-sm border border-gold-film/30 bg-gold-film/5 hover:bg-gold-film/10 text-[10px] font-mono-technical text-gold-film transition-colors tracking-widest"
                                >
                                    <Copy size={12} />
                                    REMAKE_SCENE
                                </button>
                            ) : null}
                            <ShareButton title={bucket.title} url={`/archive/${bucket.id}`} />
                        </div>
                    </div>
                    {/* Cinematic Hero Section - Portrait Poster Style (Fitted & Proportional) */}
                    <section className="relative h-[70vh] sm:h-[85vh] aspect-[3/4] sm:aspect-[2/3] w-full max-w-[420px] mx-auto flex flex-col justify-between p-5 sm:p-8 rounded-lg overflow-hidden border border-white/10 shadow-huge group mb-12 sm:mb-24">
                        {/* Hero Background Layer */}
                        <div className="absolute inset-0 z-0">
                            {bucket.thumbnail_url || memories.length > 0 ? (
                                <CinematicImage
                                    src={bucket.thumbnail_url || memories[memories.length - 1].media_url}
                                    alt={bucket.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-darkroom flex items-center justify-center">
                                    <Film className="w-16 h-16 text-white/5" />
                                </div>
                            )}
                        </div>



                        {/* Content Layer - Centered Title & Description */}
                        <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center text-center py-4">
                            <div className="space-y-4 w-full px-4">
                                {bucket.original_bucket_id && (
                                    bucket.original_bucket ? (
                                        <Link
                                            href={`/archive/${bucket.original_bucket_id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-film/10 border border-gold-film/30 rounded-full backdrop-blur-md mb-4 hover:bg-gold-film/20 transition-all group/remake"
                                        >
                                            <Copy size={10} className="text-gold-film" />
                                            <span className="text-[9px] font-mono-technical text-gold-film/80 tracking-widest uppercase group-hover/remake:text-gold-film">
                                                REMAKE FROM: {bucket.original_bucket.users?.nickname || 'BONG JOON-HO'}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                            <AlertTriangle size={10} className="text-red-500" />
                                            <span className="text-[9px] font-mono-technical text-red-500/80 tracking-widest uppercase">
                                                ORIGINAL REEL SCRAPPED
                                            </span>
                                        </div>
                                    )
                                )}
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display leading-[1.1] text-white tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] uppercase break-keep">
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
                                        className="absolute inset-0 bg-black/60 backdrop-blur-2xl border border-white/10"
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
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Link href={`/profile/${bucket.user_id}`} className="flex items-center gap-2 hover:bg-white/5 p-1 -ml-1 pr-2 rounded transition-colors group/executor">
                                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                                        {bucket.users?.profile_image_url ? (
                                                            <img
                                                                src={bucket.users.profile_image_url}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User size={10} className="text-gold-film/60" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col leading-none">
                                                        <p className="font-mono-technical text-[6px] text-white/50 tracking-[0.2em] uppercase group-hover/executor:text-gold-film/60 transition-colors">Director</p>
                                                        <span className="text-[9px] font-display text-gold-warm tracking-tight group-hover/executor:text-gold-film transition-colors">
                                                            {bucket.users?.nickname || `AGENT_${bucket.user_id?.slice(0, 5).toUpperCase()}`}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="px-1 py-0.5 bg-white/10 border border-white/15 rounded-sm">
                                                <span className="text-[6px] font-mono-technical text-white/50 uppercase tracking-widest leading-none">SID: {bucket.id?.slice(0, 8) || '0000'}</span>
                                            </div>
                                        </div>

                                        {/* BOTTOM: METADATA GRID */}
                                        <div className="p-4 sm:p-5 pb-8 grid grid-cols-2 gap-y-4 gap-x-2">
                                            <div className="space-y-1 col-span-2 sm:col-span-1">
                                                <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.2em] uppercase">Genre / Type</p>
                                                <p className="text-[10px] sm:text-[11px] font-display text-white font-medium tracking-widest truncate uppercase">
                                                    {bucket.category || 'CINEMA'}
                                                    <span className="mx-2 text-white/20">|</span>
                                                    <span className="text-gold-film/80">{bucket.is_routine ? 'ROUTINE' : (bucket.target_date ? 'Yearly Scene' : 'My Epoch')}</span>
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.2em] uppercase">Premiere</p>
                                                <p className="text-[10px] sm:text-[11px] font-mono-technical text-celluloid font-bold">{formatDate(bucket?.created_at || new Date().toISOString())}</p>
                                            </div>

                                            <div onClick={handleAdmit} className="space-y-1 cursor-pointer group/stat">
                                                <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.2em] uppercase">Admit_One</p>
                                                <div className="flex items-center gap-2">
                                                    <Ticket size={12} className={`transition-colors ${optimisticTicketState.hasIssued ? 'text-gold-film fill-gold-film' : 'text-smoke/40 group-hover/stat:text-gold-film'}`} />
                                                    <span className={`text-[11px] font-mono-technical font-bold ${optimisticTicketState.hasIssued ? 'text-gold-film' : 'text-smoke/60'}`}>{optimisticTicketState.count.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1 group/remake_stat">
                                                <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.2em] uppercase">Remakes</p>
                                                <div className="flex items-center gap-2">
                                                    <Copy size={11} className="text-smoke/40 group-hover/remake_stat:text-gold-film transition-colors" />
                                                    <span className="text-[11px] font-mono-technical font-bold text-smoke/60 group-hover/remake_stat:text-gold-film transition-colors uppercase">
                                                        {bucket.original_bucket_id ? 'REMAKED' : (bucket.remake_count || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                            {bucket.is_routine && (
                                                <div className="space-y-1">
                                                    <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.2em] uppercase">Production_Cycle</p>
                                                    <p className="text-[10px] sm:text-[11px] font-mono-technical text-cyan-film font-bold">
                                                        {bucket.routine_frequency}
                                                        {bucket.routine_days && bucket.routine_days.length > 0 && (
                                                            <span className="text-smoke/40 ml-1 text-[8px]">
                                                                ({bucket.routine_days.map((d: number) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d]).join('')})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <p className="font-mono-technical text-[7px] text-white/50 tracking-[0.2em] uppercase">Manage</p>
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
                                                                    <>
                                                                        <button onClick={() => { setIsMoreHorizontalOpen(false); setIsEditOpen(true); }} className="w-full px-3 py-2 flex items-center gap-2 text-[10px] text-smoke hover:bg-white/5 transition-colors border-b border-white/5 text-left">
                                                                            <Pencil size={10} className="text-gold-film/60" />
                                                                            <span>EDIT PRODUCTION</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm('정말로 이 필름을 파기하시겠습니까? (삭제된 필름은 복구할 수 없습니다)')) {
                                                                                    handleDeleteBucket();
                                                                                }
                                                                            }}
                                                                            className="w-full px-3 py-2 flex items-center gap-2 text-[10px] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-colors text-left"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                            <span>SCRAP PRODUCTION</span>
                                                                        </button>
                                                                    </>
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
                                            {canContribute && (
                                                <Button
                                                    onClick={() => setIsAddRecordOpen(true)}
                                                    className="h-8 sm:h-10 bg-gold-film/10 hover:bg-gold-film/20 text-gold-film border border-gold-film/30 gap-1 sm:gap-2 px-3 sm:px-4"
                                                >
                                                    <Camera size={14} className="sm:w-4 sm:h-4" />
                                                    <span className="text-[10px] sm:text-sm">ADD FRAME</span>
                                                </Button>
                                            )}
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
                                                                        <div className="group relative aspect-[4/3] rounded-sm overflow-hidden border border-white/5 shadow-deep bg-darkroom focus-within:ring-1 focus-within:ring-gold-film/50">
                                                                            <CinematicImage
                                                                                src={item.media_url}
                                                                                alt={item.caption || 'Memory'}
                                                                                fill
                                                                                unoptimized={true}
                                                                                containerClassName="h-full"
                                                                                className={`object-cover transition-transform duration-700 group-hover:scale-105 ${item.isOptimistic ? 'animate-pulse blur-md grayscale' : ''}`}
                                                                            />

                                                                            {item.isOptimistic && (
                                                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <Loader2 className="w-5 h-5 text-gold-film animate-spin" />
                                                                                        <span className="font-mono-technical text-xs text-gold-film tracking-[0.3em] uppercase animate-pulse">Developing...</span>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-mono-technical text-gold-film/40 tracking-widest uppercase mt-2">화학적 현상 공정 중</span>
                                                                                </div>
                                                                            )}

                                                                            {/* Hover Actions for Records */}
                                                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                                                                {isOwner && (
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            handleSetThumbnail(item.media_url)
                                                                                        }}
                                                                                        className={`p-2 bg-void/80 backdrop-blur-md rounded-full transition-colors border border-white/10 ${bucket.thumbnail_url === item.media_url ? 'text-gold-film bg-gold-film/10 border-gold-film/30' : 'text-smoke/60 hover:text-gold-film'}`}
                                                                                        title="대표 이미지로 설정"
                                                                                    >
                                                                                        <Clapperboard size={14} className={bucket.thumbnail_url === item.media_url ? "animate-pulse" : ""} />
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        setEditingRecord(item)
                                                                                        setIsEditRecordOpen(true)
                                                                                    }}
                                                                                    className="p-2 bg-void/80 backdrop-blur-md rounded-full text-gold-film/60 hover:text-gold-film transition-colors border border-white/10"
                                                                                >
                                                                                    <Pencil size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault()
                                                                                        e.stopPropagation()
                                                                                        toast('정말로 이 기록을 삭제하시겠습니까?', {
                                                                                            action: {
                                                                                                label: '삭제',
                                                                                                onClick: () => handleDeleteRecord(item.id)
                                                                                            },
                                                                                            cancel: {
                                                                                                label: '취소',
                                                                                                onClick: () => { }
                                                                                            }
                                                                                        })
                                                                                    }}
                                                                                    className="p-2 bg-void/80 backdrop-blur-md rounded-full text-red-500/60 hover:text-red-500 transition-colors border border-white/10"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                            {/* Contributor Badge */}
                                                                            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-void/60 backdrop-blur-sm px-2 py-1 rounded-sm border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <div className="w-4 h-4 rounded-full overflow-hidden border border-gold-film/30 relative">
                                                                                    {item.users?.profile_image_url ? (
                                                                                        <Image src={item.users.profile_image_url} alt={item.users.nickname || ''} fill className="object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full bg-gold-film/10 flex items-center justify-center">
                                                                                            <User size={8} className="text-gold-film" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-[8px] font-mono-technical text-smoke/80 tracking-widest uppercase">
                                                                                    Captured by @{item.users?.nickname || 'Unknown'}
                                                                                    {item.user_id === bucket.user_id && (
                                                                                        <span className="ml-2 px-1 py-0.5 rounded-[2px] bg-gold-film/10 border border-gold-film/30 text-[7px] text-gold-film font-mono-technical">
                                                                                            DIRECTOR
                                                                                        </span>
                                                                                    )}
                                                                                    {item.user_id !== bucket.user_id && bucket.bucket_casts?.some((c: any) => c.user_id === item.user_id && c.is_accepted) && (
                                                                                        <span className="ml-2 px-1 py-0.5 rounded-[2px] bg-blue-500/10 border border-blue-500/30 text-[7px] text-blue-400 font-mono-technical">
                                                                                            {bucket.bucket_casts?.find((c: any) => c.user_id === item.user_id)?.role || 'CONTRIBUTOR'}
                                                                                        </span>
                                                                                    )}
                                                                                </span>
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
                                                {canContribute && (
                                                    <Button
                                                        onClick={() => setIsAddRecordOpen(true)}
                                                        className="bg-gold-film text-void hover:bg-gold-warm px-8 font-bold"
                                                    >
                                                        ADD FIRST FRAME
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                                {activeTab === 'FOOTPRINTS' && (
                                    <motion.div
                                        key="footprints"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        {/* Routine Stats Header */}
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <h4 className="text-[10px] sm:text-xs font-mono-technical text-smoke/40 tracking-[0.3em] uppercase underline decoration-gold-film/30 underline-offset-8">Production_Footprints</h4>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono-technical text-[9px] text-smoke/50 tracking-widest uppercase">
                                                    Total: <span className="text-gold-film font-bold">{memories.length}</span>
                                                </span>
                                                {routineStreak >= 2 && (
                                                    <span className="font-mono-technical text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-orange-500/10 border border-orange-500/30 text-orange-400">
                                                        🔥 {routineStreak} COMBO
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {memories.length > 0 ? (
                                            <div className="relative pl-8 border-l border-white/5 space-y-10">
                                                {[...memories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((m, idx) => {
                                                    const footprintNumber = memories.length - idx
                                                    return (
                                                        <div key={m.id} className="relative group">
                                                            {/* Dot with number */}
                                                            <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-[1px] bg-gold-film/30" />
                                                            <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-gold-film/50 bg-void shadow-[0_0_10px_rgba(201,162,39,0.2)] flex items-center justify-center">
                                                                <span className="font-mono-technical text-[6px] text-gold-film/70 font-bold">{footprintNumber}</span>
                                                            </div>

                                                            <div className="flex items-center gap-5">
                                                                <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-darkroom rounded-sm overflow-hidden border border-white/5 relative group-hover:border-gold-film/30 transition-colors">
                                                                    {m.media_url ? (
                                                                        <CinematicImage
                                                                            src={m.media_url}
                                                                            alt={m.caption || ''}
                                                                            fill
                                                                            unoptimized={true}
                                                                            className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Film size={20} className="text-white/5" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 space-y-1.5 min-w-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono-technical text-[8px] text-gold-film/40 tracking-widest">#{String(footprintNumber).padStart(2, '0')}</span>
                                                                            <span className="font-mono-technical text-[9px] text-gold-film/60 tracking-widest">{formatDateWithDay(m.created_at)}</span>
                                                                        </div>

                                                                        {/* Actions Menu */}
                                                                        {isOwner && (
                                                                            <div className="relative">
                                                                                <button
                                                                                    onClick={() => setFootprintMenuId(footprintMenuId === m.id ? null : m.id)}
                                                                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                                                                >
                                                                                    <MoreHorizontal size={16} />
                                                                                </button>
                                                                                {footprintMenuId === m.id && (
                                                                                    <>
                                                                                        <div
                                                                                            className="fixed inset-0 z-40 cursor-default"
                                                                                            onClick={() => setFootprintMenuId(null)}
                                                                                        />
                                                                                        <div className="absolute right-0 top-full mt-1 w-36 bg-black/90 backdrop-blur-md border border-white/10 rounded-sm z-50 shadow-huge overflow-hidden">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation()
                                                                                                    setEditingFootprintId(m.id)
                                                                                                    setEditingCaption(m.caption || '')
                                                                                                    setFootprintMenuId(null)
                                                                                                }}
                                                                                                className="w-full px-3 py-2.5 text-left text-[10px] text-smoke hover:bg-white/10 flex items-center gap-2 border-b border-white/5 transition-colors"
                                                                                            >
                                                                                                <Pencil size={10} className="text-gold-film/70" />
                                                                                                <span>내용 수정</span>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation()
                                                                                                    handleImageUpdateClick(m.id)
                                                                                                    setFootprintMenuId(null)
                                                                                                }}
                                                                                                className="w-full px-3 py-2.5 text-left text-[10px] text-smoke hover:bg-white/10 flex items-center gap-2 border-b border-white/5 transition-colors"
                                                                                            >
                                                                                                <ImageIcon size={10} className="text-gold-film/70" />
                                                                                                <span>사진 변경</span>
                                                                                            </button>
                                                                                            {m.media_url && (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation()
                                                                                                        handleSetThumbnail(m.media_url)
                                                                                                    }}
                                                                                                    className="w-full px-3 py-2.5 text-left text-[10px] text-smoke hover:bg-white/10 flex items-center gap-2 border-b border-white/5 transition-colors"
                                                                                                >
                                                                                                    <Star size={10} className="text-gold-film/70" />
                                                                                                    <span>대표 이미지 설정</span>
                                                                                                </button>
                                                                                            )}
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation()
                                                                                                    handleFootprintDelete(m.id)
                                                                                                }}
                                                                                                className="w-full px-3 py-2.5 text-left text-[10px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                                                            >
                                                                                                <Trash2 size={10} />
                                                                                                <span>기록 삭제</span>
                                                                                            </button>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Caption or Edit Input */}
                                                                    {editingFootprintId === m.id ? (
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <input
                                                                                type="text"
                                                                                value={editingCaption}
                                                                                onChange={(e) => setEditingCaption(e.target.value)}
                                                                                className="flex-1 bg-white/5 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-smoke focus:outline-none focus:border-gold-film/50 transition-colors"
                                                                                autoFocus
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') handleFootprintEdit(m.id)
                                                                                    if (e.key === 'Escape') setEditingFootprintId(null)
                                                                                }}
                                                                            />
                                                                            <button onClick={() => handleFootprintEdit(m.id)} className="p-1.5 bg-gold-film/20 text-gold-film rounded-sm hover:bg-gold-film/30 transition-colors">
                                                                                <Check size={12} />
                                                                            </button>
                                                                            <button onClick={() => setEditingFootprintId(null)} className="p-1.5 text-smoke/50 hover:text-white transition-colors">
                                                                                <X size={12} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-smoke text-sm font-light leading-relaxed line-clamp-2 break-keep">
                                                                            {m.caption || '기록 없이 완료된 루틴입니다.'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-24 text-center">
                                                <p className="text-smoke/30 font-mono-technical text-xs uppercase tracking-widest">아직 발자취가 없습니다</p>
                                                <p className="text-smoke/20 font-mono-technical text-[9px] mt-2">체크 버튼을 눌러 첫 번째 기록을 남겨보세요</p>
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
                                                disabled={isPending}
                                                className="flex-1 px-6 py-4 rounded-lg bg-gold-film text-void hover:bg-gold-warm transition-all duration-300 text-sm font-bold disabled:opacity-50 shadow-[0_0_20px_rgba(201,162,39,0.2)] active:scale-95"
                                            >
                                                {isPending ? 'PRODUCTION UPDATING...' : 'SAVE CHANGES'}
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
                                                disabled={isPending}
                                                className="flex-1 px-6 py-4 rounded-lg bg-gold-film text-void hover:bg-gold-warm transition-all text-sm font-bold disabled:opacity-50"
                                            >
                                                {isPending ? '저장 중...' : '기록 저장'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>



            <RemakeModal
                isOpen={isRemakeModalOpen}
                onClose={() => setIsRemakeModalOpen(false)}
                onConfirm={confirmRemake}
                bucketTitle={bucket.title}
                isPending={isPending}
            />

            <CastingModal
                isOpen={isCastingModalOpen}
                onClose={() => setIsCastingModalOpen(false)}
                bucketId={bucket.id}
            />

            <FlashBulb
                trigger={flashTrigger}
                onComplete={() => setFlashTrigger(false)}
            />
        </div >
    )
}
