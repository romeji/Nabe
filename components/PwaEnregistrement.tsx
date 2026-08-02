'use client';

import { useEffect } from 'react';

export interface InviteInstallationPwa extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __nabeInviteInstallation?: InviteInstallationPwa;
  }
}

export default function PwaEnregistrement() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error("Impossible d'enregistrer la web app Nabe :", error);
      });
    }

    function memoriserInvite(event: Event) {
      event.preventDefault();
      window.__nabeInviteInstallation = event as InviteInstallationPwa;
      window.dispatchEvent(new Event('nabe-pwa-installable'));
    }

    window.addEventListener('beforeinstallprompt', memoriserInvite);
    return () => window.removeEventListener('beforeinstallprompt', memoriserInvite);
  }, []);

  return null;
}
