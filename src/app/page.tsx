export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center sm:text-left">
        <h1 className="text-4xl sm:text-6xl font-bold text-accent">
          EPOCH FILM
        </h1>
        <p className="text-xl sm:text-2xl text-foreground/80">
          Capture your epoch, Develop your dream.
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-text gap-2 hover:bg-primary/90 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
            Start Your Archive
          </button>
          <button className="rounded-full border border-solid border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] hover:text-background dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44">
            Learn More
          </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center mt-20 text-sm text-foreground/50">
        <p>© 2026 Epoch Film. All rights reserved.</p>
      </footer>
    </div>
  );
}
