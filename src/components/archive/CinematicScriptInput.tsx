'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Sparkles, Sun, Moon, MapPin, AlignLeft } from 'lucide-react'

interface CinematicScriptInputProps {
    defaultTitle?: string
    defaultDescription?: string
}

export function CinematicScriptInput({ defaultTitle = '', defaultDescription = '' }: CinematicScriptInputProps) {
    const [title, setTitle] = useState(defaultTitle)
    const [description, setDescription] = useState(defaultDescription)
    const [focusedField, setFocusedField] = useState<'title' | 'description' | null>(null)

    const titleRef = useRef<HTMLInputElement>(null)
    const descRef = useRef<HTMLTextAreaElement>(null)

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setFocusedField('description')
            descRef.current?.focus()
        }
    }

    const insertSlug = (slug: string) => {
        const newTitle = title ? `${title} ${slug}` : slug
        setTitle(newTitle)
        titleRef.current?.focus()
    }

    return (
        <div className="w-full relative group/script">
            {/* Visual Paper Stack Effect */}
            <div className="absolute inset-x-2 -bottom-2 h-full bg-white/5 rounded-sm -z-10 transform scale-[0.99]" />
            <div className="absolute inset-x-4 -bottom-4 h-full bg-white/5 rounded-sm -z-20 transform scale-[0.98]" />

            <div className="relative w-full p-6 sm:p-8 bg-[#1a1816] rounded-sm shadow-2xl border-l-[6px] border-l-white/10 overflow-hidden">
                {/* Hole Punches for Binding Script */}
                <div className="absolute left-1 top-0 bottom-0 w-8 flex flex-col justify-between py-12 items-center pointer-events-none opacity-30">
                    <div className="w-3 h-3 rounded-full bg-black/50 shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-black/50 shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-black/50 shadow-inner" />
                </div>

                {/* Script Header / Toolbar */}
                <div className="flex flex-wrap items-center justify-between mb-8 pl-6 border-b border-white/5 pb-4 gap-4">
                    <div className="flex items-center gap-2 opacity-50">
                        <AlignLeft size={14} />
                        <span className="text-[10px] font-mono-technical tracking-widest uppercase">Drafting_Mode v1.0</span>
                    </div>

                    {/* Slug Helper Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <SlugButton label="INT." icon={<MapPin size={10} />} onClick={() => insertSlug('INT.')} />
                        <SlugButton label="EXT." icon={<MapPin size={10} />} onClick={() => insertSlug('EXT.')} />
                        <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
                        <SlugButton label="DAY" icon={<Sun size={10} />} onClick={() => insertSlug('DAY')} />
                        <SlugButton label="NIGHT" icon={<Moon size={10} />} onClick={() => insertSlug('NIGHT')} />
                    </div>
                </div>

                <div className="space-y-10 pl-6">
                    {/* SCENE HEADING (Title) */}
                    <div className="relative group space-y-2">
                        <label className={clsx(
                            "block text-[10px] font-mono-technical tracking-[0.2em] transition-colors duration-500",
                            focusedField === 'title' ? "text-gold-film" : "text-smoke/40"
                        )}>
                            1. SCENE HEADING
                        </label>

                        <div className="relative">
                            <input
                                name="title"
                                ref={titleRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value.toUpperCase())} // Force formatting
                                onKeyDown={handleTitleKeyDown}
                                onFocus={() => setFocusedField('title')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="INT. COFFEE SHOP - DAY"
                                className="w-full bg-transparent border-b border-white/5 py-4 text-xl sm:text-2xl font-[Courier,monospace] font-bold text-celluloid placeholder-white/10 focus:outline-none focus:border-gold-film/30 transition-all caret-gold-film uppercase tracking-wide"
                                autoComplete="off"
                                required
                            />
                        </div>
                    </div>

                    {/* ACTION LINES (Description) */}
                    <div className="relative group space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={clsx(
                                "block text-[10px] font-mono-technical tracking-[0.2em] transition-colors duration-500",
                                focusedField === 'description' ? "text-gold-film" : "text-smoke/40"
                            )}>
                                2. ACTION LINES
                            </label>

                            {/* Auto-Format Suggestion - Only show when empty and focused */}
                            <AnimatePresence>
                                {focusedField === 'description' && description.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-1 text-[9px] text-gold-film/50 font-mono-technical"
                                    >
                                        <Sparkles size={10} />
                                        <span>Use present tense. Be visual.</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <textarea
                                name="description"
                                ref={descRef}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onFocus={() => setFocusedField('description')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="The protagonist sits alone, tracing the rim of a cold cup..."
                                rows={8}
                                className="w-full bg-transparent text-lg font-[Courier,monospace] text-celluloid/80 placeholder-white/5 focus:outline-none resize-none caret-gold-film leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-8 pl-6 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono-technical text-smoke/30">
                    <span>EPOCH_FILM_SYSTEM</span>
                    <span>PAGE 1 OF 1</span>
                </div>
            </div>
        </div>
    )
}

function SlugButton({ label, icon, onClick }: { label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:text-gold-film text-smoke/50 text-[9px] font-mono-technical border border-white/5 rounded-sm transition-all active:scale-95 uppercase tracking-wider"
        >
            {icon}
            {label}
        </button>
    )
}
