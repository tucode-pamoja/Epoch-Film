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
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 text-whitehover:bg-white/10 border border-white/10 hover:border-white/20 transition-all font-normal text-sm"
      >
        <Mail size={16} />
        Write a Letter to Future
      </Button>

      <LetterEditor 
        bucketId={bucketId} 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
      />
    </>
  )
}
