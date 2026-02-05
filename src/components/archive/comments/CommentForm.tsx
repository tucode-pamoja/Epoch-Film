'use client'

import { useState } from 'react'
import { createComment } from '@/app/archive/actions'
import { Button } from '@/components/ui/Button'
import { Send } from 'lucide-react'

interface CommentFormProps {
    bucketId: string
    parentId?: string
    onSuccess?: () => void
    placeholder?: string
    autoFocus?: boolean
}

export function CommentForm({ bucketId, parentId, onSuccess, placeholder = "의견을 남겨주세요...", autoFocus = false }: CommentFormProps) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const result = await createComment(bucketId, content.trim(), parentId)
            if (result.success) {
                setContent('')
                if (onSuccess) onSuccess()
            } else {
                alert(result.error)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative group">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                rows={parentId ? 2 : 3}
                className="w-full bg-void/30 border border-white/10 rounded-sm p-4 text-sm text-white placeholder:text-smoke/40 focus:outline-none focus:border-gold-film/40 transition-all resize-none pr-12"
            />
            <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${content.trim() && !isSubmitting
                        ? 'text-gold-film bg-gold-film/10 hover:bg-gold-film/20'
                        : 'text-white/10'
                    }`}
            >
                <Send size={18} />
            </button>
        </form>
    )
}
