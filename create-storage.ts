import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createStorageBucket() {
  const bucketName = 'memories'

  console.log(`Creating storage bucket: '${bucketName}'...`)

  const { data, error } = await supabase
    .storage
    .createBucket(bucketName, {
      public: true, // Making it public for easy reading
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`Bucket '${bucketName}' already exists.`)
    } else {
      console.error('Error creating bucket:', error)
      return
    }
  } else {
    console.log(`Bucket '${bucketName}' created successfully.`)
  }

  // Note: RLS policies for storage might still be needed via SQL even if public is true for reading.
  // Generally, 'public: true' acts as "predefined ACL" for reading. Writing might need policy.
}

createStorageBucket()
