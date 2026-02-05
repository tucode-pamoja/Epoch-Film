'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Camera, FastForward } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import confetti from 'canvas-confetti'

interface CompletionModalProps {
    isOpen: boolean
    onClose: () => void
    onComplete: (data: { image?: File; caption: string }) => Promise<void>
    bucketTitle: string
}

export function CompletionModal({ isOpen, onClose, onComplete, bucketTitle }: CompletionModalProps) {
    const [caption, setCaption] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isConverting, setIsConverting] = useState(false)
    const [conversionError, setConversionError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setConversionError(null)
            let fileToProcess = file

            const isHeic = file.type === 'image/heic' ||
                file.type === 'image/heif' ||
                file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif')

            if (isHeic) {
                setIsConverting(true)
                try {
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
                } catch (err: any) {
                    console.warn('Client-side HEIC conversion failed, will fallback to server-side conversion:', err)
                    setConversionError('브라우저에서 이미지 미리보기를 생성할 수 없지만, 업로드 시 자동으로 변환됩니다.')
                } finally {
                    setIsConverting(false)
                }
            }

            setImageFile(fileToProcess)
            const url = URL.createObjectURL(fileToProcess)
            setImagePreview(url)
        }
    }

    const triggerConfetti = () => {
        const duration = 2000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) return clearInterval(interval)
            const particleCount = 40 * (timeLeft / duration)
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
        }, 250)
    }

    const handleSubmit = async (isSkip = false) => {
        setIsSubmitting(true)
        try {
            await onComplete({
                image: isSkip ? undefined : (imageFile || undefined),
                caption: isSkip ? '기록 없이 완료된 장면입니다.' : (caption.trim() || '이 순간을 영원히 기억합니다.'),
            })

            triggerConfetti()

            setTimeout(() => {
                onClose()
                setCaption('')
                setImageFile(null)
                setImagePreview(null)
            }, 2500)
        } catch (error) {
            console.error('Failed to complete bucket:', error)
            alert('완료 처리 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="completion-modal-root"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        overflowY: 'auto',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            backdropFilter: 'blur(8px)',
                            zIndex: -1
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            width: '100%',
                            maxWidth: '440px',
                            backgroundColor: '#1C1A18',
                            border: '1px solid rgba(201, 162, 39, 0.3)',
                            borderRadius: '4px',
                            padding: '24px',
                            position: 'relative',
                            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Compact Film Sprockets */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', backgroundColor: '#0A0908', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 12px' }}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1px' }} />
                            ))}
                        </div>

                        <button onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', color: 'rgba(92, 85, 82, 0.6)', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                            <X size={18} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '12px' }}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 162, 39, 0.1)', marginBottom: '12px' }}>
                                <Sparkles style={{ color: '#C9A227' }} size={24} />
                            </motion.div>
                            <h2 style={{ margin: '0 0 4px 0', fontFamily: '"Gowun Batang", serif', fontSize: '20px', color: '#E8D5A3' }}>이 순간을 기록하세요</h2>
                            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(92, 85, 82, 0.6)' }}>"{bucketTitle}" 완료</p>
                        </div>

                        {/* Shrunken Image Upload Area */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '13px', color: '#F7F2E9' }}>추억의 사진 (선택)</label>
                            </div>
                            {imagePreview ? (
                                <div style={{ position: 'relative', height: '100px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#141210' }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => (e.currentTarget.style.opacity = '0')}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: -1, opacity: 0.2 }}>
                                        <Camera size={20} />
                                    </div>
                                    {!isSubmitting && !isConverting && (
                                        <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '2px', padding: '2px 6px', fontSize: '9px', cursor: 'pointer' }}>REMOVE</button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '4px', cursor: isConverting ? 'wait' : 'pointer', transition: 'all 0.3s', opacity: isConverting ? 0.5 : 1 }}>
                                        <Camera style={{ color: 'rgba(92, 85, 82, 0.4)', marginRight: '10px' }} size={20} />
                                        <span style={{ fontSize: '11px', color: 'rgba(92, 85, 82, 0.6)', letterSpacing: '0.1em' }}>
                                            {isConverting ? 'CONVERTING...' : 'SELECT PHOTO'}
                                        </span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={isConverting} style={{ display: 'none' }} />
                                    </label>
                                    {isConverting && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(201, 162, 39, 0.3)', borderTopColor: '#C9A227', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                            {conversionError && (
                                <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px' }}>{conversionError}</p>
                            )}
                        </div>

                        {/* Caption Input */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#F7F2E9', marginBottom: '6px' }}>소감 기록</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="이 순간의 감정을 남겨보세요..."
                                style={{ width: '100%', height: '70px', backgroundColor: '#141210', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '10px 14px', color: '#F7F2E9', fontSize: '13px', resize: 'none', outline: 'none' }}
                                maxLength={200}
                            />
                        </div>

                        {/* Actions Row */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={onClose} style={{ flex: 1, height: '38px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(92, 85, 82, 0.8)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>취소</button>
                            <button onClick={() => handleSubmit(true)} disabled={isSubmitting} style={{ flex: 1, height: '38px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#smoke', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <FastForward size={14} /> 생략
                            </button>
                            <button onClick={() => handleSubmit(false)} disabled={isSubmitting || isConverting} style={{ flex: 2, height: '38px', backgroundColor: '#C9A227', border: 'none', color: '#0A0908', borderRadius: '4px', cursor: (isSubmitting || isConverting) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', opacity: (isSubmitting || isConverting) ? 0.7 : 1 }}>
                                {isSubmitting ? '진행 중...' : '기록 완료'}
                            </button>
                        </div>

                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12px', backgroundColor: '#0A0908', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 12px' }}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1px' }} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
