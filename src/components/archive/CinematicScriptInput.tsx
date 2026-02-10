'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Sparkles } from 'lucide-react'

interface CinematicScriptInputProps {
    defaultTitle?: string
    defaultDescription?: string
}

export function CinematicScriptInput({ defaultTitle = '', defaultDescription = '' }: CinematicScriptInputProps) {
    const [title, setTitle] = useState(defaultTitle)
    const [description, setDescription] = useState(defaultDescription)
    const [focusedField, setFocusedField] = useState<'title' | 'description'>('title')

    const titleRef = useRef<HTMLInputElement>(null)
    const descRef = useRef<HTMLTextAreaElement>(null)

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setFocusedField('description')
            descRef.current?.focus()
        }
    }

    return (
        <div className="w-full space-y-8 p-6 bg-darkroom/30 backdrop-blur-sm rounded-sm border-l-2 border-gold-film/20">

            {/* SCENE HEADING (Title) */}
            <div className="relative group space-y-2">
                <label
                    className={clsx(
                        "block text-[10px] font-mono-technical tracking-[0.2em] transition-colors duration-500",
                        focusedField === 'title' ? "text-gold-film" : "text-smoke/60"
                    )}
                >
                    SCENE HEADING (TITLE)
                </label>

                <div className="relative">
                    <input
                        name="title"
                        ref={titleRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onFocus={() => setFocusedField('title')}
                        placeholder="EXT. PARIS - MIDNIGHT"
                        className="w-full bg-transparent border-b border-white/5 py-3 text-xl sm:text-2xl font-mono text-celluloid placeholder-white/10 focus:outline-none focus:border-transparent transition-colors caret-gold-film"
                        autoComplete="off"
                        required
                    />

                    {/* Cinematic Glow Line */}
                    <AnimatePresence>
                        {focusedField === 'title' && (
                            <motion.div
                                layoutId="active-line"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: '100%' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-gold-film via-gold-warm to-transparent shadow-[0_0_15px_rgba(201,162,39,0.5)]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ACTION LINES (Description) */}
            <motion.div
                className="relative group space-y-2"
                animate={{
                    opacity: title.length > 0 || focusedField === 'description' ? 1 : 0.4,
                    y: title.length > 0 || focusedField === 'description' ? 0 : 10
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="flex items-center gap-2">
                    <label
                        className={clsx(
                            "block text-[10px] font-mono-technical tracking-[0.2em] transition-colors duration-500",
                            focusedField === 'description' ? "text-gold-film" : "text-smoke/60"
                        )}
                    >
                        ACTION LINES (DESCRIPTION)
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
                                <span>SUGGESTION: "The protagonist..."</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative pl-4 border-l border-white/5 transition-colors duration-500 group-focus-within:border-white/10">
                    <textarea
                        name="description"
                        ref={descRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={() => setFocusedField('description')}
                        placeholder="Describe the scene..."
                        rows={5}
                        className="w-full bg-transparent text-base font-mono text-celluloid/90 placeholder-white/10 focus:outline-none resize-none caret-gold-film leading-relaxed"
                    />

                    {/* Vertical Focus Indicator */}
                    <AnimatePresence>
                        {focusedField === 'description' && (
                            <motion.div
                                layoutId="active-vertical"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: '100%' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="absolute left-[-1px] top-0 w-[2px] bg-gold-film shadow-[0_0_10px_rgba(201,162,39,0.3)]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
