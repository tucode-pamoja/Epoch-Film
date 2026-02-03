'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const [inputObj, setInputObj] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTag = inputObj.trim()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        setInputObj('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 border border-white/10"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-white/40 hover:text-white"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputObj}
        onChange={(e) => setInputObj(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="태그 추가 (Enter 입력)"
        className="w-full h-12 bg-white/10 border border-white/20 text-celluloid placeholder:text-white/30 focus:border-gold-film/60 focus:bg-white/10 focus:ring-0 transition-all rounded-sm px-4 text-sm glass-warm shadow-inner"
      />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
    </div>
  )
}
