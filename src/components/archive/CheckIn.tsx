'use client'

import { useState, useRef } from 'react'
import { Upload, X, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { saveMemory } from '@/app/archive/actions'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CheckInProps {
  bucketId: string
}

export function CheckIn({ bucketId }: CheckInProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${bucketId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(filePath)

      // 3. Save metadata to DB via Server Action
      const formData = new FormData()
      formData.append('bucketId', bucketId)
      formData.append('mediaUrl', publicUrl)
      formData.append('mediaType', 'IMAGE')
      
      await saveMemory(formData)
      
      // Cleanup
      setFile(null)
      setPreview(null)
      router.refresh()

    } catch (error) {
      console.error('Error uploading:', error)
      alert('Failed to upload memory. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary" />
        Capture the Moment
      </h3>

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/[0.02] cursor-pointer transition-all"
        >
          <div className="flex flex-col items-center gap-3 text-white/30 group-hover:text-white/60 transition-colors">
            <Upload className="w-8 h-8" />
            <span className="text-sm">Tab to upload photo</span>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50">
            <Image 
              src={preview} 
              alt="Preview" 
              fill 
              className="object-contain"
            />
            <button 
              onClick={() => {
                setFile(null)
                setPreview(null)
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full h-12 rounded-xl bg-primary text-black hover:bg-primary/90 font-medium"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Memory...
              </span>
            ) : (
              'Save to Archive'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
