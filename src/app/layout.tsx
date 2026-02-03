import type { Metadata, Viewport } from "next";
// Import fonts - Sentimental Vintage
import "@fontsource/gowun-batang/400.css";
import "@fontsource/gowun-batang/700.css";
import "pretendard/dist/web/static/pretendard.css"; // Keep Pretendard for clean body text
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased pb-24">
        <div className="film-grain" />
        <div className="vintage-overlay" />
        <div className="light-leak" />
        <div className="vignette" />
        <div className="dust-layer">
          <div className="dust-particle w-0.5 h-0.5" style={{ top: '20%', left: '30%', animationDuration: '12s' }} />
          <div className="dust-particle w-1 h-1" style={{ top: '60%', left: '10%', animationDuration: '18s' }} />
          <div className="dust-particle w-0.5 h-0.5" style={{ top: '40%', left: '80%', animationDuration: '15s' }} />
          <div className="dust-particle w-1 h-1" style={{ top: '10%', left: '70%', animationDuration: '22s' }} />
        </div>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
