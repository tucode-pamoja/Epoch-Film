import { Button } from '@/components/ui/Button'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden selection:bg-primary/30">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-screen" />

      <main className="relative z-10 flex flex-col items-center text-center px-6 animate-fade-in-up">
        {/* Logo Section */}
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 mb-8 transition-transform hover:scale-105 duration-700 ease-out">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-glow" />
          <Image
            src="/logo.jpg"
            alt="Epoch Film Logo"
            fill
            className="object-contain relative z-10 drop-shadow-2xl"
            priority
          />
        </div>
        
        {/* Text Content */}
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 pb-2">
            EPOCH FILM
          </h1>
          <p className="text-lg sm:text-2xl text-white/60 font-light tracking-wide italic">
             &ldquo;Capture your epoch, Develop your dream.&rdquo;
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-6 mt-12 w-full sm:w-auto">
          <Button 
            href="/archive" 
            className="h-14 px-10 rounded-full bg-white text-black hover:bg-white/90 font-medium text-lg transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
          >
            Start Your Archive
          </Button>
          <Button 
            variant="outline" 
            className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-medium text-lg backdrop-blur-sm transition-all hover:-translate-y-0.5"
          >
            Explore Gallery
          </Button>
        </div>
      </main>
      
      {/* Footer / Credits */}
      <footer className="absolute bottom-8 text-[10px] sm:text-xs text-white/20 tracking-[0.2em] uppercase font-mono">
        Designed for Dreamers © 2026
      </footer>
    </div>
  );
}
