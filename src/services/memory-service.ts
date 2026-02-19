import { SupabaseClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import convert from 'heic-convert'

export interface MemoryPayload {
    bucketId: string
    userId: string
    caption?: string
    imageBuffer?: Buffer
    imageType?: string
    fileName?: string
    locationLat?: number | null
    locationLng?: number | null
    capturedAt?: string | null
}

export async function saveMemoryService(supabase: SupabaseClient, payload: MemoryPayload) {
    const { bucketId, userId, caption, imageBuffer, imageType, fileName: originalFileName, locationLat, locationLng, capturedAt } = payload

    let imageUrl: string | null = null

    // Handle Image Upload if present
    if (imageBuffer && originalFileName) {
        let buffer = imageBuffer
        let contentType = imageType || 'image/jpeg'
        let fileName = `${userId}/${bucketId}-${Date.now()}`

        const fileExt = originalFileName.split('.').pop()?.toLowerCase()

        try {
            const isHeic = fileExt === 'heic' || fileExt === 'heif' || contentType.includes('heic')

            if (isHeic) {
                const outputBuffer = await convert({
                    buffer: buffer as any,
                    format: 'JPEG',
                    quality: 1
                })
                buffer = Buffer.from(outputBuffer as any)
            }

            const sharpImage = sharp(buffer, { failOn: 'none', page: 0 })
            sharpImage.rotate()
            sharpImage.flatten({ background: { r: 28, g: 26, b: 24 } })
            sharpImage.resize(1600, null, { withoutEnlargement: true, fit: 'inside' })

            const processed = await sharpImage.webp({
                quality: 85,
                effort: 6,
                smartSubsample: true
            }).toBuffer()

            buffer = Buffer.from(processed as any)
            contentType = 'image/webp'
            fileName = `${fileName}.webp`
        } catch (err) {
            console.error('[SERVICE_IMAGE_PROCESS_ERROR]', err)
            // Fallback: upload original if processing fails
            if (!fileName.endsWith(fileExt || '')) {
                fileName = `${fileName}.${fileExt || 'jpg'}`
            }
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('memories')
            .upload(fileName, buffer, {
                contentType,
                upsert: true
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(uploadData.path)
        imageUrl = publicUrl
    }

    const { data, error } = await supabase.from('memories').insert({
        bucket_id: bucketId,
        user_id: userId,
        media_url: imageUrl,
        caption: caption || '새로운 기록이 추가되었습니다.',
        location_lat: locationLat,
        location_lng: locationLng,
        captured_at: capturedAt,
    }).select().single()

    if (error) throw error

    // Auto-set thumbnail if missing
    if (imageUrl) {
        const { data: bucketData } = await supabase
            .from('buckets')
            .select('thumbnail_url')
            .eq('id', bucketId)
            .single()

        if (bucketData && !bucketData.thumbnail_url) {
            await supabase
                .from('buckets')
                .update({ thumbnail_url: imageUrl })
                .eq('id', bucketId)
        }
    }

    return data
}
