'use client'

import { useState } from 'react'
import { LetterEditor } from './LetterEditor'
import { Button } from '@/components/ui/Button'
import { Mail } from 'lucide-react'

export function LetterAction({ bucketId }: { bucketId: string }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsEditorOpen(true)}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-sm bg-velvet text-smoke hover:bg-white/5 hover:text-gold-film border border-white/5 hover:border-gold-film/30 transition-all font-mono-technical uppercase tracking-widest text-[10px] whitespace-nowrap"
      >
        <Mail size={14} className="mr-1" />
        미래로 편지 보내기 (Write Letter)
      </Button>

      <LetterEditor
        bucketId={bucketId}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </>
  )
}
