'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Bell, Shield, Palette, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateSettings } from '@/app/archive/actions'
import { useRouter } from 'next/navigation'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Initialize settings from user object or defaults
    const [settings, setSettings] = useState(user.settings || {
        notifications: {
            email: true,
            push: true
        },
        privacy: {
            public_profile: true
        },
        theme: 'cinematic'
    })

    const handleToggle = (category: string, field: string) => {
        setSettings((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: !prev[category][field]
            }
        }))
    }

    const handleThemeChange = (theme: string) => {
        setSettings((prev: any) => ({
            ...prev,
            theme
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            const result = await updateSettings(settings)
            if (result.success) {
                toast.success('설정이 성공적으로 저장되었습니다')
                router.refresh()
                onClose()
            } else {
                toast.error(result.error || '설정 저장에 실패했습니다')
            }
        })
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-void/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-darkroom border border-white/10 overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-void/50 shrink-0">
                        <div>
                            <h2 className="text-xs font-mono-technical text-gold-film tracking-[0.3em] uppercase">SYSTEM SETTINGS</h2>
                            <p className="text-[11px] text-smoke/90 mt-1.5 uppercase tracking-wider font-medium">감독님의 시네마틱 경험을 설정하세요.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-smoke/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-12 py-10 space-y-14">
                        {/* Notifications */}
                        <section className="space-y-7">
                            <div className="flex items-center gap-4 text-gold-film/90">
                                <Bell size={18} strokeWidth={1.2} />
                                <h3 className="text-[11px] font-mono-technical uppercase tracking-[0.25em] font-medium">알림 설정</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 ml-8">
                                <SettingsRow
                                    label="이메일 알림"
                                    description="신규 메시지 및 활동 요약을 이메일로 받습니다."
                                    isEnabled={settings.notifications.email}
                                    onToggle={() => handleToggle('notifications', 'email')}
                                />
                                <SettingsRow
                                    label="푸시 알림"
                                    description="브라우저 실시간 푸시 알림을 활성화합니다."
                                    isEnabled={settings.notifications.push}
                                    onToggle={() => handleToggle('notifications', 'push')}
                                />
                            </div>
                        </section>

                        {/* Privacy */}
                        <section className="space-y-7">
                            <div className="flex items-center gap-4 text-gold-film/90">
                                <Shield size={18} strokeWidth={1.2} />
                                <h3 className="text-[11px] font-mono-technical uppercase tracking-[0.25em] font-medium">개인정보 및 보안</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 ml-8">
                                <SettingsRow
                                    label="프로필 공개 여부"
                                    description="다른 사용자가 나의 필모그래피와 콜렉션을 볼 수 있도록 합니다."
                                    isEnabled={settings.privacy.public_profile}
                                    onToggle={() => handleToggle('privacy', 'public_profile')}
                                />
                            </div>
                        </section>

                        {/* Visual Theme */}
                        <section className="space-y-7">
                            <div className="flex items-center gap-4 text-gold-film/90">
                                <Palette size={18} strokeWidth={1.2} />
                                <h3 className="text-[11px] font-mono-technical uppercase tracking-[0.25em] font-medium">시각적 경험 (테마)</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4 ml-8">
                                {[
                                    { id: 'cinematic', label: '시네마틱' },
                                    { id: 'dark', label: '다크' },
                                    { id: 'light', label: '라이트' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => handleThemeChange(t.id)}
                                        className={`relative h-16 text-[10px] font-mono-technical uppercase tracking-widest border transition-all duration-500 overflow-hidden group ${settings.theme === t.id
                                            ? 'bg-gold-film/10 border-gold-film text-gold-film shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]'
                                            : 'bg-void/40 border-white/5 text-smoke/70 hover:border-white/20 hover:text-smoke/90'
                                            }`}
                                    >
                                        {/* Active Indicator Bar */}
                                        {settings.theme === t.id && (
                                            <motion.div
                                                layoutId="activeTheme"
                                                className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-film"
                                            />
                                        )}
                                        <span className="relative z-10">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Footer / Submit */}
                        <div className="pt-12 pb-4 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-16 bg-gold-film hover:bg-gold-film/90 disabled:bg-gold-film/50 text-black font-mono-technical text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-xl"
                            >
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                                {isPending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Save size={18} className="group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <span>설정 저장하기</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

function SettingsRow({ label, description, isEnabled, onToggle }: { label: string, description: string, isEnabled: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.05] hover:border-gold-film/30 transition-all duration-500 group/row rounded-sm">
            <div className="space-y-1.5">
                <span className="text-xs text-smoke/90 font-medium uppercase tracking-wider group-hover/row:text-white transition-colors duration-500 block">
                    {label}
                </span>
                <span className="text-[10px] text-smoke/70 uppercase tracking-tight block font-normal">
                    {description}
                </span>
            </div>
            <Switch isEnabled={isEnabled} onToggle={onToggle} />
        </div>
    )
}

function Switch({ isEnabled, onToggle }: { isEnabled: boolean, onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`relative w-16 h-8 transition-all duration-500 rounded-full border-2 ${isEnabled
                ? 'bg-gold-film/20 border-gold-film shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                : 'bg-void/60 border-white/10'
                }`}
        >
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <span className={`text-[9px] font-mono-technical font-bold transition-all duration-500 ${isEnabled ? 'opacity-100 text-gold-film translate-x-0' : 'opacity-0 -translate-x-2'}`}>ON</span>
                <span className={`text-[9px] font-mono-technical font-bold transition-all duration-500 ${!isEnabled ? 'opacity-100 text-smoke/30 translate-x-0' : 'opacity-0 translate-x-2'}`}>OFF</span>
            </div>
            <motion.div
                animate={{
                    x: isEnabled ? 34 : 4,
                    backgroundColor: isEnabled ? '#D4AF37' : '#222'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="absolute top-1.5 w-4 h-4 rounded-full shadow-2xl z-10"
            />
        </button>
    )
}

