'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createBucket(formData: FormData) {
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

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!title || !category) {
    // Basic validation, should be handled by client as well
    return
  }

  const { error } = await supabase.from('buckets').insert({
    user_id: user.id,
    title,
    category,
    importance: parseInt(importance),
    description,
    tags, // Add tags here
    status: 'ACTIVE', // Default status
    is_pinned: false,
  })

  if (error) {
    console.error('Error creating bucket:', error)
    redirect('/archive/new?error=Failed to create reel')
  }

  revalidatePath('/archive')
  redirect('/archive')
}

export async function saveMemory(formData: FormData) {
  const bucketId = formData.get('bucketId') as string
  const mediaUrl = formData.get('mediaUrl') as string
  const mediaType = formData.get('mediaType') as string
  const caption = formData.get('caption') as string || ''

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('memories').insert({
    bucket_id: bucketId,
    user_id: user.id,
    media_url: mediaUrl,
    media_type: mediaType,
    caption,
  })

  if (error) {
    console.error('Error saving memory:', error)
    throw new Error('Failed to save memory')
  }

  revalidatePath(`/archive/${bucketId}`)
  revalidatePath('/archive')
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

export async function generateRoadmap(bucketId: string) {
  const supabase = await createClient()

  // Mock AI generation for now
  // In a real app, this would call OpenAI/Gemini API with the bucket title
  const mockRoadmap = {
    steps: [
      { step: 1, title: 'Initial Research', description: 'Explore the best locations and times to visit. Check for seasonal events.' },
      { step: 2, title: 'Budgeting & Saving', description: 'Calculate total expenses including flights, accommodation, and daily spending. Start a savings fund.' },
      { step: 3, title: 'Booking Essentials', description: 'Book flights and main accommodation at least 3 months in advance for better rates.' },
      { step: 4, title: 'Itinerary Planning', description: 'Draft a day-by-day plan but leave room for spontaneous discovery.' },
      { step: 5, title: 'Final Preparation', description: 'Pack your bags, check travel documents, and get ready for the adventure.' }
    ],
    estimated_cost: '$1,500 - $2,500',
    timeline: '3 - 6 Months',
    recommendations: [
      { type: 'PLACE', title: 'Montmartre', description: 'Artistic district with great views.' },
      { type: 'FOOD', title: 'Escargots de Bourgogne', description: 'Classic French appetizer.' },
      { type: 'ACTIVITY', title: 'Seine River Cruise', description: 'Sunset boat tour.' },
      { type: 'HIDDEN_GEM', title: 'Musée de la Vie Romantique', description: 'A quiet, beautiful museum.' }
    ]
  }

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  const { error } = await supabase
    .from('buckets')
    .update({ roadmap: mockRoadmap })
    .eq('id', bucketId)

  if (error) {
    console.error('Error generating roadmap:', error)
    throw new Error('Failed to generate roadmap')
  }

  revalidatePath(`/archive/${bucketId}`)
}
