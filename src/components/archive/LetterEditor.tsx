'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, Calendar, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createLetter } from '@/app/archive/actions'
import { Input } from '@/components/ui/Input'

interface LetterEditorProps {
  bucketId: string
  isOpen: boolean
  onClose: () => void
}

export function LetterEditor({ bucketId, isOpen, onClose }: LetterEditorProps) {
  const [content, setContent] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Default to 1 year from now
  useState(() => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setOpenDate(nextYear.toISOString().split('T')[0])
  })

  const handleSubmit = async () => {
    if (!content || !openDate) return

    try {
      setIsSending(true)
      const formData = new FormData()
      formData.append('bucketId', bucketId)
      formData.append('content', content)
      formData.append('openDate', openDate)

      await createLetter(formData)
      onClose()
      setContent('')
    } catch (error) {
      console.error(error)
      alert('Failed to send letter')
    } finally {
      setIsSending(false)
    }
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{ width: '100vw', height: '100vh', zIndex: 20000 }} className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ width: '100%', maxWidth: '500px' }}
            className="relative overflow-hidden rounded-sm bg-velvet border border-white/10 shadow-2xl p-6 film-border"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-smoke hover:text-gold-film transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-sm bg-gold-film/10 text-gold-film border border-gold-film/20">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-xl font-display text-celluloid">미래의 나에게 (To Future Me)</h2>
                <p className="text-[10px] font-mono-technical text-smoke uppercase tracking-wider">이 편지는 지정된 날짜까지 봉인됩니다.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono-technical text-smoke uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar size={12} />
                  개봉 날짜 (Open Date)
                </label>
                <Input
                  type="date"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-celluloid h-12 rounded-sm font-mono-technical text-sm glass-warm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-technical text-smoke uppercase tracking-widest mb-2">메시지 (Message)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="미래의 나에게 전하고 싶은 이야기를 적어보세요..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 text-celluloid placeholder:text-smoke/30 focus:border-gold-film/50 focus:bg-white/5 focus:ring-0 transition-all rounded-sm px-4 py-3 text-sm resize-none outline-none leading-relaxed glass-warm font-light"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSending}
                className="w-full h-14 rounded-sm bg-gold-film text-velvet hover:bg-gold-highlight hover:text-black font-display text-lg flex items-center justify-center gap-2 transition-all shadow-warm"
              >
                {isSending ? '봉인 중...' : '타임 캡슐 봉인하기 (SEAL CAPSULE)'}
                {!isSending && <Send size={18} />}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
