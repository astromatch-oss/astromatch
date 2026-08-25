'use client';

import React, { useEffect, useState } from 'react';
import { Download, Sparkles, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaRegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('🌌 AstroMatch PWA ServiceWorker active:', registration.scope);
          })
          .catch((error) => {
            console.error('ServiceWorker registration error:', error);
          });
      });
    }

    // Capture beforeinstallprompt for Android / Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      // Show banner if not dismissed previously
      const dismissed = localStorage.getItem('astromatch_pwa_dismissed');
      if (!dismissed && !isApp) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS Safari and not installed, show after 5 seconds if not dismissed
    if (isIosDevice && !isApp) {
      const dismissed = localStorage.getItem('astromatch_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 4000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed AstroMatch PWA');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('astromatch_pwa_dismissed', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Install Floating Banner */}
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-surface-200/95 backdrop-blur-2xl border border-cosmic-purple/40 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cosmic-purple to-cosmic-pink p-0.5 shadow-cosmic flex-shrink-0">
              <div className="w-full h-full bg-surface-300 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white tracking-tight">Install AstroMatch</h4>
              <p className="text-[11px] text-text-secondary leading-tight">
                Add to your home screen for full cosmic experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white text-xs font-bold shadow-cosmic hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-text-muted hover:text-white rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-surface-200 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cosmic-purple to-cosmic-pink p-0.5 mx-auto shadow-cosmic">
                <div className="w-full h-full bg-surface-300 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-text-secondary">
                Install AstroMatch as a native-like app directly from Safari:
              </p>
            </div>

            <div className="space-y-3 py-2 text-xs text-text-secondary">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-100 border border-white/5">
                <div className="p-2 rounded-xl bg-surface-200 text-purple-300 flex-shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>
                  1. Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar.
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-100 border border-white/5">
                <div className="p-2 rounded-xl bg-surface-200 text-amber-300 flex-shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>
                  2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
