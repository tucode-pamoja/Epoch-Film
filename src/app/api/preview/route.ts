import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import convert from 'heic-convert'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    let buffer: Buffer = Buffer.from(arrayBuffer)

    // Check if HEIC/HEIF
    const fileName = file.name.toLowerCase()
    const contentType = file.type.toLowerCase()
    const isHeic =
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif') ||
      contentType === 'image/heic' ||
      contentType === 'image/heif'

    if (isHeic) {
      try {
        // Convert HEIC to JPEG using heic-convert
        const outputBuffer = await convert({
          buffer: buffer as any,
          format: 'JPEG',
          quality: 0.8
        })
        buffer = Buffer.from(outputBuffer as any)
      } catch (heicError) {
        console.warn('heic-convert failed, trying sharp:', heicError)
        // Fallback to sharp
        try {
          const processed = await sharp(buffer).jpeg({ quality: 80 }).toBuffer()
          buffer = Buffer.from(processed)
        } catch (sharpError) {
          console.error('Both HEIC conversion methods failed:', sharpError)
          return NextResponse.json({ error: 'Failed to convert HEIC image' }, { status: 500 })
        }
      }
    }

    // Resize for preview (max 800px width, maintain aspect ratio)
    const previewResult = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer()
    const previewBuffer = Buffer.from(previewResult)

    // Return as base64 data URL
    const base64 = previewBuffer.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64}`

    return NextResponse.json({
      success: true,
      previewUrl: dataUrl,
      originalSize: file.size,
      previewSize: previewBuffer.length
    })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
