import type { Metadata, Viewport } from "next";
// Import fonts - Sentimental Vintage
import "@fontsource/gowun-batang/400.css";
import "@fontsource/gowun-batang/700.css";
import "pretendard/dist/web/static/pretendard.css"; // Keep Pretendard for clean body text
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: "Epoch Film",
  description: "Record your dreams like a movie",
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { createClient } from "@/utils/supabase/server";
import RealtimeNotifier from "@/components/layout/RealtimeNotifier";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let theme = 'cinematic';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.id)
      .single();

    if (profile?.settings?.theme) {
      theme = profile.settings.theme;
    }
  }

  return (
    <html lang="ko" data-theme={theme}>
      <body className="antialiased pb-24">
        {theme === 'cinematic' && (
          <>
            <div className="film-grain" />
            <div className="vintage-overlay" />
            <div className="light-leak" />
            <div className="vignette" />
          </>
        )}
        <div className="dust-layer">
          <div className="dust-particle w-0.5 h-0.5" style={{ top: '20%', left: '30%', animationDuration: '12s' }} />
          <div className="dust-particle w-1 h-1" style={{ top: '60%', left: '10%', animationDuration: '18s' }} />
          <div className="dust-particle w-0.5 h-0.5" style={{ top: '40%', left: '80%', animationDuration: '15s' }} />
          <div className="dust-particle w-1 h-1" style={{ top: '10%', left: '70%', animationDuration: '22s' }} />
        </div>
        {children}
        <BottomNav />
        <Toaster position="top-center" richColors theme="dark" />
        {user && <RealtimeNotifier currentUserId={user.id} />}
      </body>
    </html>
  );
}
