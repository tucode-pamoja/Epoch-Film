'use client'

import { createBucket } from '../actions' // Import from parent actions if strictly shared, or local
// Note: In Next.js App Router, it's common to keep actions next to the page or in a shared actions file.
// I'll assume we import from the file I just created in src/app/archive/actions.ts

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

// We need to import the server action. 
// Since createBucket is defined in src/app/archive/actions.ts, let's verify the import path.
// The file is D:\dev\epoch-film\src\app\archive\actions.ts. 
// So from D:\dev\epoch-film\src\app\archive\new\page.tsx it would be '../actions'
import { createBucket as createBucketAction } from '../actions'


export default function NewBucketPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-surface p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">New Reel</h1>
          <p className="text-sm text-gray-400">Define a new scene for your epoch.</p>
        </div>

        <form action={createBucketAction} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Watch the sunset in Santorini"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="flex h-10 w-full rounded-md border border-white/20 bg-surface px-3 py-2 text-sm text-text ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <option value="TRAVEL">Travel</option>
                  <option value="GROWTH">Growth</option>
                  <option value="CAREER">Career</option>
                  <option value="FOOD">Food</option>
                  <option value="RELATIONSHIP">Relationship</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="importance" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Importance (1-5)
                </label>
                <Input
                  id="importance"
                  name="importance"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="3"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="flex w-full rounded-md border border-white/20 bg-surface px-3 py-2 text-sm text-text ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="Add details about this goal..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Link href="/archive" className="w-full">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="w-full">
              Create Reel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
