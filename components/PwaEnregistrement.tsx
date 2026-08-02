'use client';

import { useEffect } from 'react';

export default function PwaEnregistrement() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error("Impossible d'enregistrer la web app Nabe :", error);
      });
    }

  }, []);

  return null;
}
