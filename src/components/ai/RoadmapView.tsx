'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { generateRoadmap } from '@/app/archive/actions'
import { motion } from 'framer-motion'

interface Step {
  step: number
  title: string
  description: string
}

interface Recommendation {
  type: string
  title: string
  description: string
}

interface RoadmapData {
  steps: Step[]
  estimated_cost: string
  timeline: string
  recommendations?: Recommendation[]
}

interface RoadmapViewProps {
  bucketId: string
  roadmap: RoadmapData | null
}

export function RoadmapView({ bucketId, roadmap }: RoadmapViewProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      await generateRoadmap(bucketId)
    } catch (error) {
      console.error(error)
      alert('Failed to generate roadmap')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!roadmap) {
    return (
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <Sparkles className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">AI Director</h3>
        <p className="mb-6 text-white/40">
          Get a personalized roadmap to achieve this dream, <br />
          including steps, costs, and timeline.
        </p>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="h-12 rounded-full bg-white text-black hover:bg-white/90 px-8 font-medium shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Consulting Director...
            </span>
          ) : (
            'Generate Plan with AI'
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Director's Cut</h3>
            <p className="text-xs text-white/40">AI Generated Roadmap</p>
          </div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30">Est. Cost</p>
            <p className="font-mono text-sm text-primary">{roadmap.estimated_cost}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30">Timeline</p>
            <p className="font-mono text-sm text-blue-400">{roadmap.timeline}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 pl-2">
        {roadmap.steps.map((step, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={step.step} 
            className="relative border-l border-white/10 pl-8 last:border-0"
          >
            <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-[#050505]" />
            <h4 className="mb-1 text-sm font-bold text-white/90">
              Step {step.step}: {step.title}
            </h4>
            <p className="text-sm leading-relaxed text-white/50">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {roadmap.recommendations && (
        <div className="mt-8 pt-8 border-t border-white/5">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-500" />
            Curated Recommendations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roadmap.recommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-bold text-primary mb-1">{rec.type}</p>
                <p className="text-sm font-medium text-white">{rec.title}</p>
                <p className="text-xs text-white/40">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
