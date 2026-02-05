'use client'

import { useState } from 'react'
import { User, Reply, Trash2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CommentForm } from './CommentForm'
import { deleteComment } from '@/app/archive/actions'

interface CommentItemProps {
    comment: any
    currentUserId: string
    bucketId: string
    replies?: any[]
}

export function CommentItem({ comment, currentUserId, bucketId, replies = [] }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const isOwner = currentUserId === comment.user_id

    const handleDelete = async () => {
        if (!confirm('의견을 삭제하시겠습니까?')) return
        setIsDeleting(true)
        const result = await deleteComment(comment.id, bucketId)
        if (!result.success) {
            alert(result.error)
            setIsDeleting(false)
        }
    }

    return (
        <div className={`group/comment relative ${isDeleting ? 'opacity-30' : ''}`}>
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full border border-gold-film/10 bg-darkroom flex items-center justify-center shrink-0 overflow-hidden">
                    {comment.users?.profile_image_url ? (
                        <img src={comment.users.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <User size={18} className="text-gold-film/40" />
                    )}
                </div>

                <div className="flex-grow space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-display text-celluloid tracking-widest">
                                {comment.users?.nickname || 'Unknown Director'}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-smoke/40 font-mono-technical uppercase">
                                <Clock size={10} />
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                            </div>
                        </div>

                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1.5 text-smoke/40 hover:text-red-400"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-smoke leading-relaxed break-keep">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className={`flex items-center gap-1.5 text-[10px] font-mono-technical uppercase tracking-wider transition-colors ${isReplying ? 'text-gold-film' : 'text-smoke/30 hover:text-smoke/60'
                                }`}
                        >
                            <Reply size={12} />
                            {isReplying ? '취소' : '답글 달기'}
                        </button>
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="pt-4 animate-fade-in-up">
                            <CommentForm
                                bucketId={bucketId}
                                parentId={comment.id}
                                onSuccess={() => setIsReplying(false)}
                                placeholder="답글을 남겨주세요..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                        <div className="pt-6 space-y-6 border-l border-white/5 pl-6 ml-1">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    bucketId={bucketId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
