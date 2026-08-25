import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { MatchProvider } from '@/context/MatchContext';
import { ChatProvider } from '@/context/ChatContext';
import { CosmicBackground } from '@/components/layout/CosmicBackground';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PwaRegister } from '@/components/pwa/PwaRegister';

export const metadata: Metadata = {
  title: 'AstroMatch - Cosmic & Astrological Dating App',
  description: 'Find your celestial match through planetary synergy, birth chart harmony, and deep cosmic connection.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AstroMatch',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AstroMatch" />
        <meta name="application-name" content="AstroMatch" />
        <meta name="msapplication-TileColor" content="#090A10" />
      </head>
      <body className="antialiased min-h-[100dvh] bg-background text-text-primary overflow-x-hidden">
        <AuthProvider>
          <MatchProvider>
            <ChatProvider>
              <CosmicBackground>
                <Navbar />
                <main className="flex-1 flex flex-col pb-20 md:pb-0 w-full overflow-x-hidden">{children}</main>
                <BottomNav />
                <PwaRegister />
              </CosmicBackground>
            </ChatProvider>
          </MatchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
