'use client'

import { MessageSquare } from 'lucide-react'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'

interface CommentSectionProps {
    bucketId: string
    comments: any[]
    currentUserId: string
}

export function CommentSection({ bucketId, comments, currentUserId }: CommentSectionProps) {
    // Organize comments into threads (parents and children)
    const parentComments = comments.filter(c => !c.parent_id)
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

    return (
        <section className="space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-gold-film/10 flex items-center justify-center text-gold-film">
                        <MessageSquare size={16} />
                    </div>
                    <div>
                        <h3 className="text-xl font-display text-celluloid">Review & Discussion</h3>
                        <p className="text-[10px] text-smoke/40 font-mono-technical uppercase tracking-[0.2em]">
                            {comments.length} Thoughts Recorded
                        </p>
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className="bg-velvet/50 rounded-sm border border-white/5 p-6">
                <CommentForm bucketId={bucketId} />
            </div>

            {/* List */}
            <div className="space-y-10">
                {parentComments.length > 0 ? (
                    parentComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            bucketId={bucketId}
                            replies={getReplies(comment.id)}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-sm text-smoke/40 font-display italic">"아직 기록된 의견이 없습니다. 첫 번째 리뷰를 남겨보세요."</p>
                        <div className="mt-4 font-mono-technical text-[9px] text-smoke/20 tracking-[0.3em] uppercase">No archives found in this thread.</div>
                    </div>
                )}
            </div>
        </section>
    )
}
