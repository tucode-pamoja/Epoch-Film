'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import convert from 'heic-convert'

export async function getBucket(id: string) {
  console.log('[getBucket] Fetching bucket with id:', id)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buckets')
    .select(`
      *, 
      users!user_id(nickname, profile_image_url), 
      original_bucket:buckets!original_bucket_id(id, title, user_id, users!user_id(nickname, profile_image_url))
    `)
    .eq('id', id)
    .single()

  if (error) {
    // If no row found, return null silently
    if (error.code === 'PGRST116') return null

    console.error('Error fetching bucket:', error.message, error.details, error.hint)
    return null
  }

  // Fetch remake count
  const { count: remakeCount } = await supabase
    .from('buckets')
    .select('*', { count: 'exact', head: true })
    .eq('original_bucket_id', id)

  return { ...data, remake_count: remakeCount || 0 }
}

export async function createBucket(formData: FormData) {
  console.log('[CREATE_BUCKET_ACTION] Received form data:',
    Object.fromEntries(formData.entries())
  )
  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const importance = formData.get('importance') as string
  const tagsJson = formData.get('tags') as string

  let tags: string[] = []
  try {
    tags = tagsJson ? JSON.parse(tagsJson) : []
  } catch (e) {
    console.error('Failed to parse tags', e)
  }

  const sceneType = formData.get('sceneType') as string
  const targetDate = sceneType === 'YEARLY' ? new Date(`${new Date().getFullYear()}-12-31`).toISOString() : null

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!title || !category) {
    redirect('/archive/new?error=제목과 카테고리를 입력해주세요.')
  }

  const routineFrequency = formData.get('routineFrequency') as string
  const routineDaysRaw = formData.getAll('routineDays')
  const routineDays = routineDaysRaw.map(day => parseInt(day as string))

  const { error } = await supabase.from('buckets').insert({
    user_id: user.id,
    title,
    category,
    importance: parseInt(importance || '3'),
    description,
    tags, // Add tags here
    is_public: true, // Default to public for now or add to form
    is_pinned: false,
    target_date: targetDate, // Set target_date based on type
    is_routine: sceneType === 'ROUTINE',
    routine_frequency: sceneType === 'ROUTINE' ? routineFrequency : null,
    routine_days: sceneType === 'ROUTINE' && routineFrequency === 'WEEKLY' ? routineDays : null,
  })

  if (error) {
    console.error('Error creating bucket:', error)
    redirect(`/archive/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  await updateQuestProgress('CREATE_BUCKET')

  const redirectTab = sceneType === 'ROUTINE' ? 'ROUTINES' : sceneType === 'YEARLY' ? 'YEAR' : 'LIFE'
  redirect(`/?tab=${redirectTab}`)
}

export async function deleteBucket(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify ownership before delete
  const { data: bucket, error: fetchError } = await supabase
    .from('buckets')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !bucket) throw new Error('Scene not found')
  if (bucket.user_id !== user.id) throw new Error('Forbidden')

  const { error: deleteError } = await supabase
    .from('buckets')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Delete error:', deleteError)
    throw new Error('Failed to scrap production')
  }

  revalidatePath('/')
  revalidatePath('/archive')
  revalidatePath('/explore')

  return { success: true }
}

export async function saveMemory(bucketId: string, formData: FormData) {
  const supabase = await createClient()

  console.log(`[SAVE_MEMORY_START] Bucket ID: ${bucketId}`);

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.', code: 'UNAUTHORIZED' }
  }

  // Authority Check: Owner or Accepted Cast Member
  const { data: bucket, error: authError } = await supabase
    .from('buckets')
    .select('user_id')
    .eq('id', bucketId)
    .single()

  if (authError || !bucket) {
    return { success: false, error: '시나리오를 찾을 수 없습니다.', code: 'NOT_FOUND' }
  }

  const isOwner = bucket.user_id === user.id
  let isAcceptedCast = false

  if (!isOwner) {
    const { data: castMember } = await supabase
      .from('bucket_casts')
      .select('is_accepted')
      .eq('bucket_id', bucketId)
      .eq('user_id', user.id)
      .single()

    isAcceptedCast = !!castMember?.is_accepted
  }

  if (!isOwner && !isAcceptedCast) {
    return { success: false, error: '이 시나리오에 기록을 추가할 권한이 없습니다.', code: 'FORBIDDEN' }
  }

  const caption = formData.get('caption') as string
  const imageFile = formData.get('image') as File | null
  const locationLat = formData.get('location_lat') as string
  const locationLng = formData.get('location_lng') as string
  const capturedAt = formData.get('captured_at') as string

  let imageUrl: string | null = null
  const currentBucketId = bucketId

  // Handle Image Upload if present
  if (imageFile && imageFile.size > 0) {
    // Check file size (max 50MB for processing)
    if (imageFile.size > 50 * 1024 * 1024) {
      return { success: false, error: '파일 용량이 너무 큽니다. (최대 50MB)', code: 'FILE_TOO_LARGE' }
    }

    const fileExt = imageFile.name.split('.').pop()
    let fileName = `${user.id}/${currentBucketId}-${Date.now()}` // Extension will be .webp

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)
    let contentType = imageFile.type

    // Server-side image processing with sharp & heic-convert
    try {
      const isHeic = fileExt?.toLowerCase() === 'heic' ||
        fileExt?.toLowerCase() === 'heif' ||
        contentType === 'image/heic' ||
        contentType === 'image/heif' ||
        contentType === 'application/octet-stream';

      if (isHeic) {
        try {
          console.log(`[IMAGE_PROCESS] Attempting HEIC conversion for user: ${user.id}, size: ${imageFile.size}`);
          const outputBuffer = await convert({
            buffer: buffer as any,
            format: 'JPEG',
            quality: 1
          });
          buffer = Buffer.from(outputBuffer as any);
        } catch (heicError: any) {
          console.error('[HEIC_CONVERSION_FAILED] Error converting HEIC to JPEG. Falling back to sharp directly.', {
            error: heicError.message,
            userId: user.id,
            fileName: imageFile.name
          });
        }
      }

      // Optimize/Process with sharp: WebP conversion & Resizing
      // Using { failOn: 'none' } and ensuring we only take the first page to avoid "Failed to add frame"
      const sharpImage = sharp(buffer, { failOn: 'none', page: 0 })
      sharpImage.rotate()
      sharpImage.flatten({ background: { r: 28, g: 26, b: 24 } })

      sharpImage.resize(1600, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })

      // Convert to WebP
      const processed = await sharpImage.webp({
        quality: 85,
        effort: 6,
        smartSubsample: true
      }).toBuffer()

      buffer = Buffer.from(processed as any)
      contentType = 'image/webp'
      fileName = `${fileName}.webp`

    } catch (imageError: any) {
      console.error('[IMAGE_PROCESSING_CRITICAL] Image pipeline failed:', {
        error: imageError.message,
        userId: user.id
      });
      // Fallback: we'll try to upload original buffer, hoping storage allows it
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('memories')
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('SERVER_UPLOAD_FAILURE:', {
        details: uploadError,
        userId: user.id,
        fileName
      })
      return { success: false, error: '파일 업로드에 실패했습니다.', code: 'STORAGE_UPLOAD_ERROR' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('memories')
      .getPublicUrl(uploadData.path)
    imageUrl = publicUrl
  }

  // Final check: if an image was provided but we have no URL, something went wrong
  if (imageFile && imageFile.size > 0 && !imageUrl) {
    return { success: false, error: '이미지 주소 생성에 실패했습니다.', code: 'URL_GENERATION_FAILED' }
  }

  console.log(`[DB_INSERT_START] Saving memory to bucket: ${currentBucketId}, user: ${user.id}`);

  // Parse location values safely, ensuring NaN never reaches the DB
  const parsedLat = locationLat ? parseFloat(locationLat) : null
  const parsedLng = locationLng ? parseFloat(locationLng) : null
  const safeLat = parsedLat !== null && !Number.isNaN(parsedLat) ? parsedLat : null
  const safeLng = parsedLng !== null && !Number.isNaN(parsedLng) ? parsedLng : null

  const { error } = await supabase.from('memories').insert({
    bucket_id: currentBucketId,
    user_id: user.id,
    media_url: imageUrl,
    caption: caption || '새로운 기록이 추가되었습니다.',
    location_lat: safeLat,
    location_lng: safeLng,
    captured_at: capturedAt || null,
  })

  if (error) {
    console.error('Error saving memory to DB:', {
      error: error.message,
      details: error.details,
      code: error.code,
      userId: user.id,
      bucketId: currentBucketId
    })
    return {
      success: false,
      error: '메모리 저장 중 서버 오류가 발생했습니다. (DB Insert 실패)',
      code: 'DATABASE_INSERT_ERROR',
      details: error.message
    }
  }

  // Auto-set thumbnail if it's the first memory (or if thumbnail is missing)
  if (imageUrl) {
    const { data: bucketData } = await supabase
      .from('buckets')
      .select('thumbnail_url')
      .eq('id', currentBucketId)
      .single()

    if (bucketData && !bucketData.thumbnail_url) {
      console.log(`[AUTO_THUMBNAIL] Setting initial thumbnail for bucket ${currentBucketId}`)
      await supabase
        .from('buckets')
        .update({ thumbnail_url: imageUrl })
        .eq('id', currentBucketId)
    }
  }

  // Revalidate ALL relevant paths for immediate consistency
  revalidatePath(`/archive/${currentBucketId}`)
  revalidatePath('/')
  revalidatePath('/timeline')
  revalidatePath('/')

  await updateQuestProgress('ADD_MEMORY')
  return { success: true }
}

export async function createLetter(formData: FormData) {
  const bucketId = formData.get('bucketId') as string
  const content = formData.get('content') as string
  const openDate = formData.get('openDate') as string

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('letters').insert({
    user_id: user.id,
    bucket_id: bucketId,
    content,
    open_date: openDate,
  })

  if (error) {
    console.error('Error creating letter:', error)
    throw new Error('Failed to create letter')
  }

  revalidatePath(`/archive/${bucketId}`)
}

export async function completeBucket(bucketId: string, formData: FormData) {
  'use server'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  const caption = formData.get('caption') as string
  const imageFile = formData.get('image') as File | null

  let imageUrl: string | null = null

  // Upload image to Supabase Storage if provided
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 50 * 1024 * 1024) {
      return { success: false, error: '파일 용량이 너무 큽니다. (최대 50MB)' }
    }

    const fileExt = imageFile.name.split('.').pop()
    let fileName = `${user.id}/${bucketId}-${Date.now()}`

    // Convert to Buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)
    let contentType = imageFile.type

    // Server-side image processing with sharp & heic-convert
    try {
      const isHeic = fileExt?.toLowerCase() === 'heic' ||
        fileExt?.toLowerCase() === 'heif' ||
        contentType === 'image/heic' ||
        contentType === 'image/heif' ||
        contentType === 'application/octet-stream';

      if (isHeic) {
        try {
          console.log(`[IMAGE_PROCESS] Attempting HEIC conversion in completeBucket for user: ${user.id}, size: ${imageFile.size}`);
          const outputBuffer = await convert({
            buffer: buffer as any,
            format: 'JPEG',
            quality: 1
          });
          buffer = Buffer.from(outputBuffer as any);
        } catch (heicError: any) {
          console.error('[HEIC_CONVERSION_FAILED] Error in completeBucket:', {
            error: heicError.message,
            userId: user.id
          });
        }
      }

      // Optimize/Process with sharp: WebP conversion & Resizing
      // page: 0 ensures we only take the first frame
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

    } catch (imageError: any) {
      console.error('[IMAGE_PROCESSING_CRITICAL] Completion image processing failed:', {
        error: imageError.message,
        userId: user.id
      });
      return { success: false, error: '시네마틱 이미지 생성에 실패했습니다.' }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('memories')
      .upload(fileName, buffer as any, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('SERVER_UPLOAD_FAILURE:', uploadError)
      return { success: false, error: '이미지 업로드에 실패했습니다.' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('memories')
      .getPublicUrl(uploadData.path)
    imageUrl = publicUrl
  }

  // Create memory record ONLY if an image was uploaded
  if (imageUrl) {
    const { error: memoryError } = await supabase.from('memories').insert({
      user_id: user.id,
      bucket_id: bucketId,
      caption: caption || '이 순간을 영원히 기억합니다.',
      media_url: imageUrl,
    })

    if (memoryError) {
      console.error('Memory creation error during completion:', memoryError)
    }
  }

  // Mark bucket as achieved
  const { error: updateError } = await supabase
    .from('buckets')
    .update({ status: 'ACHIEVED' })
    .eq('id', bucketId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Bucket update error:', updateError)
    return { success: false, error: '버킷 상태 업데이트에 실패했습니다.' }
  }

  revalidatePath('/')
  revalidatePath('/')
  revalidatePath('/timeline')
  revalidatePath(`/archive/${bucketId}`)

  await updateQuestProgress('COMPLETE_BUCKET')
  return { success: true }
}

// --- Routine Cycle Completion ---
export async function completeRoutineCycle(bucketId: string) {
  'use server'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('buckets')
    .update({ routine_last_completed_at: new Date().toISOString() })
    .eq('id', bucketId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Routine cycle complete error:', error)
    return { success: false, error: '루틴 완료 기록에 실패했습니다.' }
  }

  revalidatePath('/')
  revalidatePath(`/archive/${bucketId}`)

  return { success: true }
}

import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// AI Provider configuration
// Priority: Groq (free, fast) -> Gemini (backup) -> Smart Fallback
type AIProvider = 'groq' | 'gemini' | 'fallback'

interface AIConfig {
  provider: AIProvider
  available: boolean
}

function getAvailableAI(): AIConfig {
  // Groq is primary (free, fast, generous limits)
  if (process.env.GROQ_API_KEY) {
    return { provider: 'groq', available: true }
  }
  // Gemini as backup
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', available: true }
  }
  // Fallback to templates
  return { provider: 'fallback', available: false }
}

// Groq API call
async function generateWithGroq(bucket: { title: string; category: string; description: string }): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const prompt = `You are an expert life coach and film director helping someone achieve their dream.

Goal: "${bucket.title}"
Category: ${bucket.category}
Description: "${bucket.description || '설명 없음'}"

Please create a detailed, cinematic roadmap to achieve this goal.
The output MUST be valid JSON with the following structure:
{
  "steps": [
    { "step": 1, "title": "Scene 1 Title", "description": "Detailed actionable advice..." },
    { "step": 2, "title": "Scene 2 Title", "description": "..." },
    { "step": 3, "title": "Scene 3 Title", "description": "..." },
    { "step": 4, "title": "Scene 4 Title", "description": "..." },
    { "step": 5, "title": "Scene 5 Title", "description": "..." }
  ],
  "estimated_cost": "Cost estimate in KRW (e.g., 약 50만 원)",
  "timeline": "Estimated time (e.g., 3개월)",
  "recommendations": [
    { "type": "PLACE", "title": "Recommendation Title", "description": "Why it's good..." },
    { "type": "APP", "title": "...", "description": "..." },
    { "type": "TIP", "title": "...", "description": "..." },
    { "type": "FOOD", "title": "...", "description": "..." }
  ]
}

IMPORTANT: Respond ONLY with the JSON. Do not include any markdown formatting like \`\`\`json. Use Korean language for all content. Make the roadmap specific to the goal, not generic.`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile', // Best free model on Groq
    temperature: 0.7,
    max_tokens: 2000,
  })

  return completion.choices[0]?.message?.content || ''
}

// Gemini API call (backup)
async function generateWithGemini(bucket: { title: string; category: string; description: string }): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are an expert life coach and film director helping someone achieve their dream.

Goal: "${bucket.title}"
Category: ${bucket.category}
Description: "${bucket.description || '설명 없음'}"

Please create a detailed, cinematic roadmap to achieve this goal.
The output MUST be valid JSON with the following structure:
{
  "steps": [
    { "step": 1, "title": "Scene 1 Title", "description": "Detailed actionable advice..." },
    ... (5 steps total)
  ],
  "estimated_cost": "Cost estimate in KRW (e.g., 약 50만 원)",
  "timeline": "Estimated time (e.g., 3개월)",
  "recommendations": [
    { "type": "PLACE" | "FOOD" | "APP" | "TIP", "title": "Recommendation Title", "description": "Why it's good..." }
    ... (4 recommendations)
  ]
}

IMPORTANT: Respond ONLY with the JSON. Do not include any markdown formatting like \`\`\`json. Use Korean language for all content.`

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}

// Fallback roadmap templates based on category
function generateSmartFallback(bucket: { title: string; category: string; description: string }) {
  const categoryTemplates: Record<string, { steps: Array<{ step: number; title: string; description: string }>; recommendations: Array<{ type: string; title: string; description: string }> }> = {
    'TRAVEL': {
      steps: [
        { step: 1, title: '🎬 Scene 1: 여행지 리서치', description: '목적지에 대한 충분한 정보를 수집하세요. 블로그, 유튜브, 여행 커뮤니티를 통해 실제 경험담을 찾아보는 것이 좋습니다.' },
        { step: 2, title: '📋 Scene 2: 예산 및 일정 계획', description: '항공권, 숙소, 현지 교통, 식비, 액티비티 비용을 항목별로 정리하고 여유 예산을 10-20% 추가로 확보하세요.' },
        { step: 3, title: '✈️ Scene 3: 예약 및 준비', description: '항공권과 숙소를 예약하고, 필요한 비자나 여행자 보험을 준비하세요. 현지 SIM카드나 로밍도 미리 알아두세요.' },
        { step: 4, title: '🎒 Scene 4: 패킹 & 체크리스트', description: '계절에 맞는 옷, 필수 의약품, 충전기, 여권 사본 등을 체크리스트로 만들어 하나씩 확인하세요.' },
        { step: 5, title: '🌟 Scene 5: 떠나기!', description: '모든 준비가 끝났다면 이제 출발! 순간순간을 사진과 영상으로 기록하고, 현지인들과의 교류를 즐기세요.' }
      ],
      recommendations: [
        { type: 'APP', title: 'Google Maps / 네이버 지도', description: '오프라인 지도 다운로드 기능으로 데이터 없이도 길찾기 가능' },
        { type: 'TIP', title: '현지 화폐 준비', description: '공항 환전보다 시내 환전소나 ATM이 대체로 환율이 좋습니다' },
        { type: 'APP', title: 'Papago / Google 번역', description: '카메라 번역 기능으로 현지 메뉴판도 쉽게 해석' },
        { type: 'TIP', title: '여행자 보험 필수', description: '해외에서의 의료비는 매우 비쌀 수 있으니 보험 가입은 필수입니다' }
      ]
    },
    'SKILL': {
      steps: [
        { step: 1, title: '🎬 Scene 1: 목표 구체화', description: '배우고 싶은 스킬의 최종 목표를 명확히 정의하세요. "기타 배우기"보다 "좋아하는 노래 3곡 연주하기"처럼 구체적으로.' },
        { step: 2, title: '📚 Scene 2: 학습 자료 탐색', description: '온라인 강의(유데미, 클래스101), 유튜브 튜토리얼, 책 등 자신에게 맞는 학습 방식을 찾아보세요.' },
        { step: 3, title: '⏰ Scene 3: 루틴 만들기', description: '매일 또는 주 3회 등 정해진 시간에 연습하는 습관을 만드세요. 작은 시간이라도 꾸준함이 중요합니다.' },
        { step: 4, title: '🎯 Scene 4: 마일스톤 설정', description: '큰 목표를 작은 단위로 나누세요. 첫 주: 기초, 한 달: 초급, 석 달: 중급 이런 식으로 진행 상황을 체크.' },
        { step: 5, title: '🏆 Scene 5: 실전 & 공유', description: '배운 것을 실제로 사용해보고, 커뮤니티나 친구들과 공유하세요. 피드백은 성장의 촉매제입니다.' }
      ],
      recommendations: [
        { type: 'APP', title: 'Notion / Obsidian', description: '학습 내용을 체계적으로 정리하고 복습하기 좋은 노트 앱' },
        { type: 'TIP', title: '20시간의 법칙', description: '어떤 기술이든 20시간 집중 투자하면 기본기를 익힐 수 있습니다' },
        { type: 'APP', title: 'Forest / Focus To-Do', description: '집중 시간을 관리하고 습관을 만들어주는 생산성 앱' },
        { type: 'TIP', title: '가르치면서 배우기', description: '배운 내용을 블로그에 정리하거나 누군가에게 설명하면 이해도가 깊어집니다' }
      ]
    },
    'HEALTH': {
      steps: [
        { step: 1, title: '🎬 Scene 1: 현재 상태 파악', description: '체중, 체지방률, 기초 체력 등 현재 상태를 측정하고 기록하세요. 시작점을 알아야 변화를 느낄 수 있습니다.' },
        { step: 2, title: '🎯 Scene 2: 현실적 목표 설정', description: 'SMART 원칙으로 목표를 세우세요. 구체적이고, 측정 가능하며, 달성 가능하고, 관련성 있고, 기한이 있는 목표.' },
        { step: 3, title: '📅 Scene 3: 운동 루틴 설계', description: '주 3-5회 운동 계획을 세우세요. 유산소와 근력 운동을 적절히 배합하고, 휴식일도 포함시키세요.' },
        { step: 4, title: '🥗 Scene 4: 식단 관리', description: '운동만큼 중요한 것이 식단입니다. 단백질 섭취를 늘리고, 가공식품을 줄이며, 충분한 수분을 섭취하세요.' },
        { step: 5, title: '📈 Scene 5: 기록 & 조정', description: '매주 진행 상황을 기록하고, 필요하면 계획을 조정하세요. 정체기가 와도 포기하지 마세요!' }
      ],
      recommendations: [
        { type: 'APP', title: 'Nike Training Club', description: '다양한 무료 운동 영상과 프로그램 제공' },
        { type: 'APP', title: 'MyFitnessPal', description: '식단 기록과 칼로리 계산에 유용한 앱' },
        { type: 'TIP', title: '충분한 수면', description: '근육 회복과 다이어트에 7-8시간 수면은 필수입니다' },
        { type: 'TIP', title: '점진적 과부하', description: '매주 조금씩 무게나 횟수를 늘려 몸에 자극을 주세요' }
      ]
    },
    'CULTURE': {
      steps: [
        { step: 1, title: '🎬 Scene 1: 관심 분야 좁히기', description: '문화/예술의 어떤 분야에 관심이 있는지 탐색하세요. 미술, 음악, 영화, 공연 등 구체적으로 정해보세요.' },
        { step: 2, title: '🔍 Scene 2: 정보 수집', description: '관련 전시회, 공연, 페스티벌 일정을 찾아보세요. 네이버 문화, 인터파크, 각 기관 공식 사이트를 활용하세요.' },
        { step: 3, title: '📅 Scene 3: 예약 & 계획', description: '인기 있는 전시나 공연은 조기 매진될 수 있으니 미리 예매하세요. 주변 맛집이나 카페도 함께 알아두면 좋습니다.' },
        { step: 4, title: '📸 Scene 4: 경험하기', description: '단순히 보는 것에 그치지 말고, 오디오 가이드를 활용하거나 도슨트 투어에 참여해 깊이 있게 감상하세요.' },
        { step: 5, title: '✍️ Scene 5: 기록 & 회고', description: '본 것에 대한 감상을 기록하세요. 사진, 짧은 리뷰, 티켓 스크랩 등 나만의 문화 아카이브를 만들어보세요.' }
      ],
      recommendations: [
        { type: 'APP', title: '네이버 문화생활', description: '전시, 공연, 페스티벌 정보를 한눈에 볼 수 있어요' },
        { type: 'TIP', title: '무료 관람일 활용', description: '많은 미술관/박물관이 특정 요일에 무료 입장을 제공합니다' },
        { type: 'APP', title: 'Google Arts & Culture', description: '전 세계 유명 미술관을 가상으로 둘러볼 수 있어요' },
        { type: 'TIP', title: '멤버십 가입', description: '자주 방문한다면 연간 멤버십이 경제적일 수 있습니다' }
      ]
    }
  }

  // Default template for unknown categories
  const defaultTemplate = {
    steps: [
      { step: 1, title: '🎬 Scene 1: 목표 명확히 하기', description: `"${bucket.title}"을(를) 달성하기 위해 먼저 구체적인 목표를 설정하세요. 언제까지, 어느 정도 수준으로 달성하고 싶은지 명확히 해보세요.` },
      { step: 2, title: '📋 Scene 2: 자료 조사', description: '목표와 관련된 정보를 최대한 많이 모으세요. 이미 달성한 사람들의 경험담, 필요한 자원, 예상 비용 등을 파악하세요.' },
      { step: 3, title: '🗓️ Scene 3: 실행 계획 수립', description: '큰 목표를 작은 단계로 나누고, 각 단계별 기한을 정하세요. 달성 가능한 마일스톤을 설정하는 것이 중요합니다.' },
      { step: 4, title: '🚀 Scene 4: 첫 걸음 내딛기', description: '완벽한 준비보다 중요한 것은 시작입니다. 작은 것부터 실행에 옮기고, 진행하면서 계획을 조정하세요.' },
      { step: 5, title: '🏆 Scene 5: 완주 & 기록', description: '목표를 달성하면 그 순간을 기록하세요. 사진, 영상, 글로 남겨두면 나중에 소중한 추억이 됩니다.' }
    ],
    recommendations: [
      { type: 'TIP', title: '작게 시작하기', description: '완벽한 계획보다 작은 실행이 더 중요합니다. 오늘 할 수 있는 가장 작은 행동부터 시작하세요.' },
      { type: 'APP', title: 'Notion / Todoist', description: '목표와 할 일을 체계적으로 관리할 수 있는 생산성 도구' },
      { type: 'TIP', title: '공개적 선언', description: '목표를 주변에 알리면 포기하기 어려워져 달성 확률이 높아집니다' },
      { type: 'TIP', title: '진행 상황 기록', description: '매일 또는 매주 진행 상황을 기록하면 동기부여가 됩니다' }
    ]
  }

  const template = categoryTemplates[bucket.category] || defaultTemplate

  return {
    steps: template.steps,
    estimated_cost: '목표에 따라 상이',
    timeline: '3-6개월 (개인차 있음)',
    recommendations: template.recommendations,
    _fallback: true,
    _message: 'AI 연출가가 잠시 휴식 중입니다. 기본 로드맵을 제공해드릴게요. 나중에 다시 시도하면 맞춤형 로드맵을 받을 수 있어요!'
  }
}

export async function generateRoadmap(bucketId: string) {
  const supabase = await createClient()

  // 1. Fetch Bucket Details
  const { data: bucket, error: fetchError } = await supabase
    .from('buckets')
    .select('*')
    .eq('id', bucketId)
    .single()

  if (fetchError || !bucket) {
    console.error('Error fetching bucket:', fetchError)
    throw new Error('Failed to fetch bucket details')
  }

  // 2. Get available AI provider
  const aiConfig = getAvailableAI()
  console.log(`[AI Director] Using provider: ${aiConfig.provider}`)

  if (!aiConfig.available) {
    console.warn('No AI API keys configured. Using smart fallback.')
    const fallbackRoadmap = generateSmartFallback(bucket)
    fallbackRoadmap._message = '🎬 AI 연결이 설정되지 않았습니다. 카테고리 기반 기본 로드맵을 제공해드릴게요!'
    await supabase
      .from('buckets')
      .update({ roadmap: fallbackRoadmap })
      .eq('id', bucketId)
    revalidatePath(`/archive/${bucketId}`)
    return
  }

  try {
    let text = ''

    // Try primary provider (Groq)
    if (aiConfig.provider === 'groq') {
      try {
        console.log('[AI Director] Calling Groq API with llama-3.3-70b-versatile...')
        text = await generateWithGroq(bucket)
      } catch (groqError) {
        console.error('[AI Director] Groq failed, trying Gemini...', groqError)
        // Fallback to Gemini if Groq fails
        if (process.env.GEMINI_API_KEY) {
          text = await generateWithGemini(bucket)
        } else {
          throw groqError
        }
      }
    } else if (aiConfig.provider === 'gemini') {
      console.log('[AI Director] Calling Gemini API (gemini-2.0-flash)...')
      text = await generateWithGemini(bucket)
    }

    // Improved JSON extraction: find the first { and the last }
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('AI response did not contain valid JSON')
    }

    const jsonStr = text.substring(firstBrace, lastBrace + 1)
    const roadmapData = JSON.parse(jsonStr)

    // Validate roadmap structure
    if (!roadmapData.steps || !Array.isArray(roadmapData.steps)) {
      throw new Error('AI response structure is invalid')
    }

    // Add AI provider info
    roadmapData._provider = aiConfig.provider
    roadmapData._generatedAt = new Date().toISOString()
    roadmapData._message = '🎬 AI 연출가가 당신의 꿈을 위한 특별한 로드맵을 완성했습니다.'

    // Save to DB
    const { error: updateError } = await supabase
      .from('buckets')
      .update({
        roadmap: roadmapData,
        // Optionally update metadata or tags if AI suggested new ones
      })
      .eq('id', bucketId)

    if (updateError) throw updateError

    console.log('[AI Director] Roadmap generated successfully!')

  } catch (error: unknown) {
    console.error('[AI Director] Generation Error:', error)

    // Check if it's a rate limit error
    const isRateLimitError = error instanceof Error &&
      (error.message.includes('429') ||
        error.message.includes('quota') ||
        error.message.includes('rate') ||
        error.message.includes('limit'))

    // Use smart fallback
    const fallbackRoadmap = generateSmartFallback(bucket)

    if (isRateLimitError) {
      fallbackRoadmap._message = '🎬 AI 연출가가 현재 많은 요청을 처리 중입니다. 잠시 후 다시 시도해주세요!'
    } else {
      fallbackRoadmap._message = '🎬 AI 연결에 일시적인 문제가 발생했습니다. 카테고리 기반 로드맵을 제공해드릴게요!'
    }

    await supabase
      .from('buckets')
      .update({ roadmap: fallbackRoadmap })
      .eq('id', bucketId)
  }

  revalidatePath(`/archive/${bucketId}`)
}

export async function updateBucket(bucketId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const isPublic = formData.get('isPublic') === 'true'

  const { error } = await supabase
    .from('buckets')
    .update({
      title,
      category,
      description,
      is_public: isPublic,
    })
    .eq('id', bucketId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating bucket:', error)
    throw new Error('Failed to update project')
  }

  revalidatePath(`/archive/${bucketId}`)
  revalidatePath('/')
}

export async function updateMemory(memoryId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const caption = formData.get('caption') as string
  const bucketId = formData.get('bucketId') as string

  const { error } = await supabase
    .from('memories')
    .update({ caption })
    .eq('id', memoryId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating memory:', error)
    throw new Error('Failed to update record')
  }

  if (bucketId) revalidatePath(`/archive/${bucketId}`)
}

export async function deleteMemory(memoryId: string, bucketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting memory detail:', error)
    throw new Error(`Failed to delete record: ${error.message}`)
  }

  revalidatePath(`/archive/${bucketId}`)
}

export async function updateMemoryCaption(memoryId: string, bucketId: string, caption: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('memories')
    .update({ caption })
    .eq('id', memoryId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating memory caption:', error)
    throw new Error(`Failed to update caption: ${error.message}`)
  }

  revalidatePath(`/archive/${bucketId}`)
}

export async function updateMemoryImage(memoryId: string, bucketId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const imageFile = formData.get('image') as File
  if (!imageFile) {
    throw new Error('No image provided')
  }

  // Check file size (max 50MB)
  if (imageFile.size > 50 * 1024 * 1024) {
    throw new Error('File too large (max 50MB)')
  }

  let buffer = Buffer.from(await imageFile.arrayBuffer())
  let contentType = imageFile.type
  const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
  let fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}`

  // Processing pipeline
  try {
    const isHeic = fileExt === 'heic' || fileExt === 'heif' ||
      contentType === 'image/heic' || contentType === 'image/heif' ||
      contentType === 'application/octet-stream'

    if (isHeic) {
      console.log(`[UPDATE_IMAGE] Converting HEIC for memory ${memoryId}`)
      try {
        const outputBuffer = await convert({
          buffer: buffer as any,
          format: 'JPEG',
          quality: 1
        })
        buffer = Buffer.from(outputBuffer as any)
      } catch (e) {
        console.error('[UPDATE_IMAGE] HEIC conversion failed, trying sharp directly')
      }
    }

    const sharpLoader = sharp(buffer, { failOn: 'none', page: 0 })
    sharpLoader.rotate()
    sharpLoader.resize(1600, null, { withoutEnlargement: true, fit: 'inside' })
    const processed = await sharpLoader.webp({ quality: 85 }).toBuffer()
    buffer = processed as any
    contentType = 'image/webp'
    fileName = `${fileName}.webp`
  } catch (err: any) {
    console.error('[UPDATE_IMAGE] Processing error:', err.message)
    // Fallback: keep original buffer if it matches extension or is common image type
    if (!fileName.endsWith('.webp')) {
      fileName = `${fileName}.${fileExt || 'jpg'}`
    }
  }

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('memories')
    .upload(fileName, buffer, {
      contentType: contentType,
      upsert: true
    })

  if (uploadError) {
    console.error('Error uploading memory image:', uploadError)
    throw new Error('Image upload failed')
  }

  const { data: { publicUrl } } = supabase.storage
    .from('memories')
    .getPublicUrl(uploadData.path)

  // Update memory record
  const { error: updateError } = await supabase
    .from('memories')
    .update({ media_url: publicUrl })
    .eq('id', memoryId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Error updating memory image:', updateError)
    throw new Error(`Failed to update image: ${updateError.message}`)
  }

  revalidatePath(`/archive/${bucketId}`)
}

export async function setBucketThumbnail(bucketId: string, imageUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('buckets')
    .update({ thumbnail_url: imageUrl })
    .eq('id', bucketId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error setting thumbnail detail:', error)
    throw new Error(`Failed to set representative image: ${error.message}`)
  }

  revalidatePath(`/archive/${bucketId}`)
  revalidatePath('/archive')
}

export async function getUserStats(targetUserId?: string) {
  const supabase = await createClient()
  let userId = targetUserId

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const { data: buckets } = await supabase
    .from('buckets')
    .select('status, created_at')
    .eq('user_id', userId)

  const completed = buckets?.filter(b => b.status === 'ACHIEVED').length || 0
  const active = buckets?.filter(b => b.status === 'ACTIVE').length || 0

  const { data: profile } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single()

  // Follower count (Robust method)
  const { count: followerCount, error: countError } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (countError) {
    console.error(`[getUserStats] Error fetching follower count for ${userId}:`, countError)
  }

  const baseXp = profile?.xp || 0
  const totalXp = baseXp + (completed * 100)
  const currentLevel = Math.floor(totalXp / 500) + 1
  const nextLevelXp = currentLevel * 500

  // ... memories and streak logic ...

  const { data: memories } = await supabase
    .from('memories')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  let streak = 0
  if (memories && memories.length > 0) {
    const dates = [...new Set(memories.map(m => new Date(m.created_at).toDateString()))]
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (dates[0] === today || dates[0] === yesterday) {
      streak = 1
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i])
        const d2 = new Date(dates[i + 1])
        const diff = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 3600 * 24)
        if (diff <= 1.5) {
          streak++
        } else {
          break
        }
      }
    }
  }

  // Following count
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return {
    level: currentLevel,
    xp: totalXp,
    nextLevelXp,
    streak,
    completedDreams: completed,
    activeDreams: active,
    followerCount: Number(followerCount || 0),
    followingCount: Number(followingCount || 0)
  }
}

export async function getUserBuckets(targetUserId?: string) {
  const supabase = await createClient()
  let userId = targetUserId
  let isOwnProfile = false

  const { data: { user } } = await supabase.auth.getUser()

  if (!userId) {
    if (!user) return []
    userId = user.id
    isOwnProfile = true
  } else {
    isOwnProfile = user?.id === userId
  }

  let query = supabase
    .from('buckets')
    .select(`
      *,
      users!user_id(nickname, profile_image_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // If viewing another user's profile, only show public buckets
  if (!isOwnProfile) {
    query = query.eq('is_public', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user buckets:', error.message, error.details || '', error.hint || '')
    return []
  }

  return data || []
}

export async function getPublicUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, profile_image_url, level, xp')
    .eq('id', userId)
    .single()

  if (error) return null

  // Transform to match Auth User structure somewhat for compatibility or return simpler object
  return {
    id: data.id,
    user_metadata: {
      full_name: data.nickname,
      avatar_url: data.profile_image_url
    },
    email: 'private@epoch.film' // Hide email
  }
}

export async function getActiveQuests() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return []
    }

    // Ensure user_quests exist for all active quests
    const { data: allQuests, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)

    if (questError) {
      // Suppress detailed log for expected missing table error
      console.warn('[getActiveQuests] Quests table access failed (likely missing table or RLS). Returning empty list.')
      return []
    }

    if (!allQuests || allQuests.length === 0) return []

    // Get current user progress
    const { data: userQuests, error: userQuestError } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_id', user.id)

    if (userQuestError) {
      console.warn('[getActiveQuests] User quests fetch failed:', userQuestError.message)
      return []
    }

    // Map progress to quests
    return allQuests.map(quest => {
      const userQuest = userQuests?.find(uq => uq.quest_id === quest.id)
      return {
        ...quest,
        progress: userQuest?.progress || 0,
        is_completed: userQuest?.status === 'COMPLETED' || userQuest?.status === 'CLAIMED',
        is_claimed: userQuest?.status === 'CLAIMED'
      }
    })
  } catch (e) {
    console.error('[getActiveQuests] Unexpected error:', e)
    return []
  }
}

export async function updateQuestProgress(type: string, amount: number = 1) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: activeQuests } = await supabase
    .from('quests')
    .select('*')
    .eq('requirement_type', type)
    .eq('is_active', true)

  if (!activeQuests) return

  for (const quest of activeQuests) {
    // Upsert progress
    const { data: existing } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('quest_id', quest.id)
      .single()

    if (existing) {
      if (existing.status !== 'ACTIVE') continue

      const newProgress = existing.progress + amount
      const isNowCompleted = newProgress >= quest.requirement_count

      await supabase
        .from('user_quests')
        .update({
          progress: newProgress,
          status: isNowCompleted ? 'COMPLETED' : 'ACTIVE',
          completed_at: isNowCompleted ? new Date().toISOString() : null
        })
        .eq('id', existing.id)
    } else {
      const isNowCompleted = amount >= quest.requirement_count
      await supabase
        .from('user_quests')
        .insert({
          user_id: user.id,
          quest_id: quest.id,
          progress: amount,
          status: isNowCompleted ? 'COMPLETED' : 'ACTIVE',
          completed_at: isNowCompleted ? new Date().toISOString() : null
        })
    }
  }
}

export async function claimQuestReward(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: userQuest, error: fetchError } = await supabase
    .from('user_quests')
    .select('*, quests(*)')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .single()

  if (fetchError || !userQuest || userQuest.status !== 'COMPLETED') {
    return { success: false, error: '퀘스트가 완료되지 않았거나 이미 보상을 받았습니다.' }
  }

  // Update status to CLAIMED
  await supabase
    .from('user_quests')
    .update({ status: 'CLAIMED', claimed_at: new Date().toISOString() })
    .eq('id', userQuest.id)

  // Add XP to user
  const xpReward = userQuest.quests.xp_reward
  const { data: profile } = await supabase
    .from('users')
    .select('xp')
    .eq('id', user.id)
    .single()

  await supabase
    .from('users')
    .update({ xp: (profile?.xp || 0) + xpReward })
    .eq('id', user.id)
  revalidatePath('/archive')
  return { success: true, xpReward }
}

async function enrichBucketsWithRemakeCount(buckets: any[]) {
  if (!buckets || buckets.length === 0) return buckets
  const supabase = await createClient()
  const bucketIds = buckets.map(b => b.id)

  const { data: counts, error } = await supabase
    .from('buckets')
    .select('original_bucket_id')
    .in('original_bucket_id', bucketIds)

  if (error) return buckets

  const countMap = (counts || []).reduce((acc: any, curr: any) => {
    acc[curr.original_bucket_id] = (acc[curr.original_bucket_id] || 0) + 1
    return acc
  }, {})

  return buckets.map(b => ({
    ...b,
    remake_count: countMap[b.id] || 0
  }))
}

export async function getPublicBuckets(
  page: number = 0,
  limit: number = 12,
  status?: string,
  category?: string,
  searchTerm?: string,
  followingOnly: boolean = false
) {
  const supabase = await createClient()
  const from = page * limit
  const to = from + limit - 1

  // 1. First attempt with real DB schema (is_public column and users join)
  let query = supabase
    .from('buckets')
    .select('*, users!inner(nickname, profile_image_url)')
    .eq('is_public', true)

  if (followingOnly) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    // Join with follows table to get only following users' buckets
    // In Supabase, if we use !inner on a join, it acts like an INNER JOIN filtering the main table
    query = supabase
      .from('buckets')
      .select('*, users!inner(nickname, profile_image_url), follows!inner(follower_id)')
      .eq('is_public', true)
      .eq('follows.follower_id', user.id)
  }

  if (status) query = query.eq('status', status)
  if (category && category !== 'ALL') query = query.eq('category', category)
  if (searchTerm) {
    // Integrated search: title, description, and director nickname
    // Using explicit table alias for clarity in cross-table OR filter
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,users.nickname.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.warn('[DB Sync] Public buckets fetch failed, attempting resilient fallback:', error.message)

    // 2. Resilient Fallback: Separate search for nickname if cross-table OR fails
    let fallbackQuery = supabase
      .from('buckets')
      .select('*, users!inner(nickname, profile_image_url)')
      .eq('is_public', true)

    if (status) fallbackQuery = fallbackQuery.eq('status', status)
    if (category && category !== 'ALL') fallbackQuery = fallbackQuery.eq('category', category)

    if (searchTerm) {
      // If the integrated OR failed, we try a simpler OR on titles, 
      // but we should still try to find it by director if that's what the user typed
      fallbackQuery = fallbackQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,users.nickname.ilike.%${searchTerm}%`)
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fallbackError) {
      console.error('[DB Error] Critical failure in public buckets fallback:', fallbackError.message)
      return []
    }
    return enrichBucketsWithRemakeCount(fallbackData || [])
  }
  return enrichBucketsWithRemakeCount(data || [])
}

export async function getHallOfFameBuckets(page: number = 0, limit: number = 10) {
  const supabase = await createClient()
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('buckets')
    .select('*, users(nickname, profile_image_url)')
    .eq('is_public', true)
    .order('tickets', { ascending: false })
    .range(from, to)

  if (error) {
    console.warn('[DB Sync] Hall of Fame fetch failed, attempting legacy fallback:', error.message)
    const { data: fallbackData } = await supabase
      .from('buckets')
      .select('*, users(nickname, profile_image_url)')
      .range(from, to)
    return enrichBucketsWithRemakeCount(fallbackData || [])
  }
  return enrichBucketsWithRemakeCount(data || [])
}

export async function issueTicket(bucketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  try {
    // 1. Check if already issued
    const { data: existingTicket } = await supabase
      .from('bucket_tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('bucket_id', bucketId)
      .single()

    if (existingTicket) {
      return { success: false, error: '이미 티켓을 발행했습니다.' }
    }

    // 2. Check if user has daily tickets
    // 2. No daily limit check needed (Tickets are like 'Likes')

    // 3. Issue Ticket Operations (Sequential)

    // A. Insert ticket record
    const { error: insertError } = await supabase
      .from('bucket_tickets')
      .insert({ user_id: user.id, bucket_id: bucketId })

    if (insertError) {
      console.error('Ticket insert failed:', insertError)
      return { success: false, error: '티켓 발행 중 오류가 발생했습니다.' }
    }

    // B. Add XP to issuer (Reward for appreciating art)
    // We fetch user XP first to increment safely
    const { data: userData } = await supabase
      .from('users')
      .select('xp')
      .eq('id', user.id)
      .single()

    await supabase
      .from('users')
      .update({
        xp: (userData?.xp || 0) + 5
      })
      .eq('id', user.id)

    // C. Increment bucket ticket count & Get Owner ID
    const { data: bucketData } = await supabase
      .from('buckets')
      .select('user_id, tickets')
      .eq('id', bucketId)
      .single()

    if (bucketData) {
      await supabase
        .from('buckets')
        .update({ tickets: (bucketData.tickets || 0) + 1 })
        .eq('id', bucketId)

      // D. Reward Owner
      const ownerId = bucketData.user_id
      if (ownerId && ownerId !== user.id) {
        const { data: ownerData } = await supabase.from('users').select('xp').eq('id', ownerId).single()
        if (ownerData) {
          await supabase.from('users').update({ xp: (ownerData.xp || 0) + 20 }).eq('id', ownerId)
        }
      }
    }

    // 4. Create notification for the bucket owner
    try {
      if (bucketData && bucketData.user_id && bucketData.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: bucketData.user_id,
          actor_id: user.id,
          bucket_id: bucketId,
          type: 'TICKET'
        })
      }
    } catch (notifError) {
      console.warn('Failed to send notification:', notifError)
    }

    revalidatePath('/explore')
    revalidatePath('/hall-of-fame')
    revalidatePath(`/archive/${bucketId}`)

    return { success: true }

  } catch (error: any) {
    console.error('Ticket issuing error:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

export async function getComments(bucketId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(nickname, profile_image_url)')
    .eq('bucket_id', bucketId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error.message, error.details, error.hint)
    return []
  }
  return data || []
}

export async function createComment(bucketId: string, content: string, parentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      bucket_id: bucketId,
      user_id: user.id,
      content,
      parent_id: parentId
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/archive/${bucketId}`)
  return { success: true, data }
}

export async function deleteComment(commentId: string, bucketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/archive/${bucketId}`)
  return { success: true }
}

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:users!actor_id(nickname, profile_image_url),
      bucket:buckets(title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching notifications:', error.message)
    return []
  }
  return data || []
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/', 'layout')
}

export async function clearNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/', 'layout')
}

export async function followDirector(followingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  // High-speed direct attempt
  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: followingId
    })

  if (error) {
    // Fallback: If foreign key error, the user might not be in public.users yet
    if (error.code === '23503') {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        nickname: user.user_metadata?.full_name || user.email?.split('@')[0],
        profile_image_url: user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString()
      })
      // Retry once
      const { error: retryError } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: followingId })

      if (retryError) return { success: false, error: `팔로우 실패: ${retryError.message}` }
    } else {
      console.error('Follow error:', error)
      return { success: false, error: `팔로우 실패: ${error.message}` }
    }
  }

  // Rapid revalidation (only essential paths)
  revalidatePath(`/profile/${followingId}`)
  revalidatePath('/explore')
  return { success: true }
}

export async function unfollowDirector(followingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) {
    console.error('Unfollow error:', error)
    return { success: false, error: `팔로우 취소 실패: ${error.message}` }
  }

  revalidatePath(`/profile/${followingId}`)
  revalidatePath('/explore')
  return { success: true }
}

export async function isFollowingDirector(followingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('follows')
    .select('created_at')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single()

  if (error || !data) return false
  return true
}

// --- Remake & Casting Actions ---

export async function remakeBucket(bucketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch original bucket
  const { data: original, error: fetchError } = await supabase
    .from('buckets')
    .select('*')
    .eq('id', bucketId)
    .single()

  if (fetchError || !original) throw new Error('Original scene not found')

  // 2. Create new bucket based on original
  const { data: newBucket, error: createError } = await supabase
    .from('buckets')
    .insert({
      user_id: user.id,
      title: original.title,
      description: original.description,
      category: original.category,
      status: 'ACTIVE',
      is_pinned: false,
      importance: original.importance,
      tags: original.tags,
      roadmap: original.roadmap,
      thumbnail_url: original.thumbnail_url,
      is_public: true,
      original_bucket_id: original.id,
      is_routine: original.is_routine,
      routine_frequency: original.routine_frequency,
      routine_days: original.routine_days,
      routine_last_completed_at: null, // Reset routine completion
      tickets: 0
    })
    .select()
    .single()

  if (createError) {
    console.error('Remake error detail:', JSON.stringify(createError, null, 2))
    throw new Error(`Failed to remake scene: ${createError.message}`)
  }

  revalidatePath('/archive')
  return newBucket
}

export async function getMutualFollowers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 1. My Followings
  const { data: followings } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (!followings?.length) return []
  const followingIds = followings.map(f => f.following_id)

  // 2. My Followers who are in my followings list (Mutuals)
  // Join with 'users' table to get profile info
  const { data: mutuals, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      users:follows_follower_id_fkey (
        id,
        nickname,
        profile_image_url,
        email
      )
    `)
    .eq('following_id', user.id)
    .in('follower_id', followingIds)

  if (error) {
    console.error('Error fetching mutuals:', error)
    return []
  }

  return mutuals?.map((m: any) => m.users).filter(Boolean) || []
}

export async function inviteCast(bucketId: string, targetUserId: string, role: string = 'ACTOR') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bucket_casts')
    .insert({
      bucket_id: bucketId,
      user_id: targetUserId,
      role: role,
      status: 'pending'
    })

  if (error) {
    if (error.code === '23505') throw new Error('Already casted')
    throw new Error('Failed to send casting call')
  }
  revalidatePath(`/archive/${bucketId}`)
}

export async function respondToCast(bucketId: string, castId: string, status: 'accepted' | 'rejected' | 'changes_requested', message?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bucket_casts')
    .update({
      status,
      message,
      is_accepted: status === 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('id', castId)

  if (error) throw new Error('Failed to respond to casting call')
  revalidatePath(`/archive/${bucketId}`)
  revalidatePath('/archive')
}
