'use client'

import { useState } from 'react'
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/10 shadow-2xl p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Letter to Future Self</h2>
                <p className="text-sm text-white/40">This letter will be locked until the date you choose.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2 flex items-center gap-2">
                  <Calendar size={14} />
                  Open Date
                </label>
                <Input 
                  type="date" 
                  value={openDate} 
                  onChange={(e) => setOpenDate(e.target.value)}
                  className="bg-white/[0.03] border-white/10 text-white h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear future me..."
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-0 transition-all rounded-xl px-4 py-3 text-sm resize-none outline-none leading-relaxed"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSending}
                className="w-full h-14 rounded-full bg-primary text-black hover:bg-primary/90 font-medium text-lg flex items-center justify-center gap-2"
              >
                {isSending ? 'Sealing...' : 'Seal in Time Capsule'}
                {!isSending && <Send size={18} />}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
