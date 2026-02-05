'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Send, Upload, Film, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { extractImageMetadata, ImageMetadata } from '@/utils/media'

interface AddRecordModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (data: {
        image?: File;
        caption: string;
        location_lat?: number | null;
        location_lng?: number | null;
        captured_at?: string | null;
    }) => Promise<void>
    bucketTitle: string
}

export function AddRecordModal({ isOpen, onClose, onAdd, bucketTitle }: AddRecordModalProps) {
    const [caption, setCaption] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isConverting, setIsConverting] = useState(false)
    const [conversionError, setConversionError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setConversionError(null)
            let fileToProcess = file

            // Check if it's a HEIC file (by type or extension)
            const isHeic = file.type === 'image/heic' ||
                file.type === 'image/heif' ||
                file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif')

            if (isHeic) {
                setIsConverting(true)
                try {
                    // Try client-side conversion first
                    console.log('Starting HEIC conversion for:', file.name, 'Size:', file.size);

                    const heic2anyModule = await import('heic2any')
                    const heic2any = heic2anyModule.default || heic2anyModule

                    const result = await (heic2any as any)({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.7
                    })

                    const blob = Array.isArray(result) ? result[0] : result
                    const fileName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg"
                    fileToProcess = new File([blob], fileName, { type: 'image/jpeg' })
                    const url = URL.createObjectURL(fileToProcess)
                    setPreviewUrl(url)
                    console.log('Client-side HEIC conversion successful');
                } catch (clientErr: any) {
                    console.warn('Client-side HEIC conversion failed, trying server-side:', clientErr)

                    // Fallback to server-side preview generation
                    try {
                        const formData = new FormData()
                        formData.append('file', file)

                        const response = await fetch('/api/preview', {
                            method: 'POST',
                            body: formData
                        })

                        if (response.ok) {
                            const data = await response.json()
                            setPreviewUrl(data.previewUrl)
                            console.log('Server-side preview generation successful');
                        } else {
                            throw new Error('Server preview failed')
                        }
                    } catch (serverErr) {
                        console.warn('Server-side preview also failed:', serverErr)
                        // Still allow upload - server will handle conversion
                        setConversionError('미리보기를 생성할 수 없지만, 업로드 시 자동으로 변환됩니다.')
                        // Create a placeholder preview URL anyway
                        setPreviewUrl(null)
                    }
                } finally {
                    setIsConverting(false)
                }
            } else {
                // Non-HEIC image - use direct object URL
                const url = URL.createObjectURL(fileToProcess)
                setPreviewUrl(url)
            }

            setImageFile(fileToProcess)

            // Extract Metadata from original file (better EXIF support if it works)
            try {
                const extracted = await extractImageMetadata(file)
                setMetadata(extracted)
            } catch (err) {
                console.warn('Metadata extraction failed, proceeding without it:', err)
                setMetadata(null)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isConverting || (!caption && !imageFile)) return

        setIsSubmitting(true)
        try {
            await onAdd({
                image: imageFile || undefined,
                caption,
                location_lat: metadata?.location_lat,
                location_lng: metadata?.location_lng,
                captured_at: metadata?.captured_at
            })
            // Reset and close
            setCaption('')
            setImageFile(null)
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
            setMetadata(null)
            onClose()
        } catch (error) {
            console.error('Failed to add record:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999]" style={{ display: 'block', width: '100vw', height: '100vh' }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-void/90 backdrop-blur-md"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    />

                    {/* Content Centering Wrapper */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-velvet border border-white/10 rounded-sm overflow-hidden shadow-huge flex flex-col pointer-events-auto"
                            style={{
                                width: 'min(580px, 95vw)',
                                minWidth: '300px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Header - Reduced padding */}
                            <div className="flex items-center justify-between p-4 px-6 border-b border-white/5 bg-white/2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold-film/10 border border-gold-film/20 flex items-center justify-center">
                                        <Film size={16} className="text-gold-film" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display text-celluloid tracking-tight">새로운 장면 추가</h3>
                                        <p className="text-[9px] font-mono-technical text-smoke/40 uppercase tracking-widest">
                                            "{bucketTitle}" 프로덕션 로그
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full text-smoke/40 hover:text-smoke transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                                {/* Media Upload Area - Reduced Spacing */}
                                <div className="space-y-3">
                                    <label className="block font-mono-technical text-[9px] text-smoke/40 uppercase tracking-[0.2em]">
                                        Visual_Capture (선택 사항)
                                    </label>

                                    <div
                                        onClick={() => !previewUrl && !imageFile && !isConverting && fileInputRef.current?.click()}
                                        className={`
                                            relative aspect-video rounded-sm border-2 border-dashed transition-all duration-300
                                            ${(previewUrl || imageFile)
                                                ? 'border-transparent'
                                                : 'border-white/10 hover:border-gold-film/30 bg-white/[0.02] cursor-pointer'
                                            }
                                            flex flex-col items-center justify-center gap-2 overflow-hidden
                                            ${isConverting ? 'cursor-wait opacity-50' : ''}
                                        `}
                                    >
                                        {/* HEIC Conversion Loading Overlay */}
                                        {isConverting && (
                                            <div className="absolute inset-0 bg-void/60 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                                <div className="w-6 h-6 border-2 border-gold-film/30 border-t-gold-film rounded-full animate-spin" />
                                                <p className="text-[10px] font-mono-technical text-gold-film tracking-widest uppercase animate-pulse">Converting iPhone Photo...</p>
                                            </div>
                                        )}

                                        {previewUrl || imageFile ? (
                                            <>
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.opacity = '0')}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gold-film/10 to-void">
                                                        <div className="w-16 h-16 rounded-full bg-gold-film/20 border border-gold-film/30 flex items-center justify-center mb-3">
                                                            <Camera size={28} className="text-gold-film" />
                                                        </div>
                                                        <p className="text-smoke/60 font-display text-sm">{imageFile?.name}</p>
                                                        <p className="text-[10px] font-mono-technical text-gold-film/60 uppercase tracking-widest mt-2">
                                                            iPhone Photo Ready
                                                        </p>
                                                        <p className="text-[9px] font-mono-technical text-smoke/40 mt-1">
                                                            미리보기 불가 - 업로드 시 자동 변환
                                                        </p>
                                                    </div>
                                                )}
                                                {!isConverting && (
                                                    <div className="absolute inset-0 bg-void/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                fileInputRef.current?.click()
                                                            }}
                                                            className="bg-void/80 hover:bg-void text-xs h-8"
                                                        >
                                                            <Upload size={14} className="mr-2" /> 교체
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setPreviewUrl(null)
                                                                setImageFile(null)
                                                                setConversionError(null)
                                                            }}
                                                            className="bg-red-950/80 hover:bg-red-950 text-red-200 text-xs h-8"
                                                        >
                                                            <Trash2 size={14} className="mr-2" /> 삭제
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-smoke/20 group-hover:text-gold-film/40 transition-colors">
                                                    <Camera size={24} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-smoke/60 font-display text-sm">프레임 업로드</p>
                                                    <p className="text-[9px] font-mono-technical text-smoke/30 uppercase tracking-tighter mt-1">JPG, PNG, HEIC 지원 (최대 10MB)</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {conversionError && (
                                        <div className="p-3 bg-gold-film/10 border border-gold-film/20 rounded-sm">
                                            <p className="text-[10px] text-gold-film/80 font-medium leading-relaxed tracking-tight">
                                                {conversionError}
                                            </p>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Caption Area - Reduced Height */}
                                <div className="space-y-3">
                                    <label className="block font-mono-technical text-[9px] text-smoke/40 uppercase tracking-[0.2em]">
                                        Directorial_Notes (기록)
                                    </label>
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="이 장면의 감정이나 상황을 한 줄의 기록으로 남겨보세요..."
                                        className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-sm p-4 text-smoke placeholder:text-smoke/20 focus:outline-none focus:border-gold-film/30 transition-colors resize-none font-light leading-relaxed text-sm"
                                    />
                                </div>

                                {/* Actions - Reduced Padding */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onClose}
                                        className="border-white/10 hover:bg-white/5 text-xs h-10 px-6"
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || (!caption && !imageFile)}
                                        className="bg-gold-film text-void hover:bg-gold-warm px-8 font-bold text-xs h-10"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                                                처리 중...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Send size={14} />
                                                기록하기
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
