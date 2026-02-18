'use client'

import { useRouter } from 'next/navigation'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Loader2, Save, User } from 'lucide-react'
import Image from 'next/image'
import { updateProfile } from '@/app/archive/actions'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'

interface EditIdentityModalProps {
    isOpen: boolean
    onClose: () => void
    user: {
        id: string
        nickname: string | null
        introduction: string | null
        profile_image_url: string | null
    }
}

export function EditIdentityModal({ isOpen, onClose, user }: EditIdentityModalProps) {
    const DEFAULT_INTRODUCTION = "Documenting the cinematic moments of life. Every memory is a scene waiting to be directed."
    const router = useRouter()
    const [nickname, setNickname] = useState(user.nickname || '')
    const [introduction, setIntroduction] = useState(user.introduction || DEFAULT_INTRODUCTION)
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.profile_image_url)
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfileImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!nickname.trim()) {
            toast.error('Director Name cannot be empty')
            return
        }

        startTransition(async () => {
            const formData = new FormData()
            formData.append('nickname', nickname)
            formData.append('introduction', introduction)
            if (profileImage) {
                formData.append('profile_image', profileImage)
            }

            const result = await updateProfile(formData)

            if (result.success) {
                toast.success('Identity updated successfully')
                router.refresh()
                onClose()
            } else {
                toast.error(result.error || 'Failed to update identity')
            }
        })
    }

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen || !mounted) return null
    if (typeof document === 'undefined') return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                            onClick={onClose}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative transform overflow-hidden rounded-sm bg-[#050505] text-left shadow-2xl transition-all sm:my-8 w-full max-w-3xl border border-white/10"
                        >
                            <div className="p-10 flex flex-col gap-10">
                                {/* Header */}
                                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xs font-mono-technical tracking-[0.2em] text-gold-film uppercase">
                                            Edit Identity
                                        </h2>
                                        <span className="text-[10px] text-zinc-500 font-sans tracking-wide">
                                            Update your director persona.
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-zinc-500 hover:text-white transition-colors -mr-2 -mt-2 p-2"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr,1.5fr] gap-8 items-start">
                                    {/* Left Column: Profile Image */}
                                    <div className="flex flex-col items-center gap-4 pt-1">
                                        <div
                                            className="relative group cursor-pointer w-40 h-40 rounded-full overflow-hidden border border-white/10 ring-1 ring-white/5 hover:ring-gold-film/50 transition-all bg-black shrink-0 shadow-2xl"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt="Profile Preview"
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 160px, 160px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10 group-hover:text-white/30 transition-colors">
                                                    <User size={64} strokeWidth={0.5} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <Camera size={24} className="text-white/90 drop-shadow-lg" strokeWidth={1.5} />
                                                    <span className="text-[9px] font-mono-technical tracking-widest text-white/80 uppercase">Select Photo</span>
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Right Column: Inputs & Submit */}
                                    <div className="flex flex-col gap-6 h-full w-full justify-center">
                                        <div className="flex flex-col gap-5 w-full">
                                            {/* Nickname Input */}
                                            <div className="flex flex-col gap-2 w-full">
                                                <label className="text-[9px] text-gold-film/70 font-mono-technical uppercase tracking-wider pl-1 flex items-center gap-1.5">
                                                    <span className="w-1 h-1 bg-gold-film rounded-full"></span>
                                                    Call Sign (Nickname)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={nickname}
                                                    onChange={(e) => setNickname(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-base font-display text-white placeholder-zinc-700 focus:border-gold-film/50 focus:bg-white/10 focus:outline-none transition-all rounded-sm tracking-wide"
                                                    placeholder="Enter your director name"
                                                />
                                            </div>

                                            {/* Introduction Input */}
                                            <div className="flex flex-col gap-2 w-full">
                                                <label className="text-[9px] text-gold-film/70 font-mono-technical uppercase tracking-wider pl-1 flex items-center gap-1.5">
                                                    <span className="w-1 h-1 bg-gold-film rounded-full"></span>
                                                    Bio (Introduction)
                                                </label>
                                                <textarea
                                                    value={introduction}
                                                    onChange={(e) => setIntroduction(e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-sans text-white/90 placeholder-zinc-700 focus:border-gold-film/50 focus:bg-white/10 focus:outline-none transition-all rounded-sm resize-none leading-relaxed"
                                                    placeholder="Describe your cinematic vision..."
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-1">
                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="w-full bg-gold-film hover:bg-gold-warm text-void font-bold py-3.5 px-6 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.15em] text-xs rounded-sm shadow-xl hover:shadow-gold-film/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                                            >
                                                {isPending ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={16} />
                                                        Update Identity
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
