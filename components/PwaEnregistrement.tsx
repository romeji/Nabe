'use client';

import { useEffect } from 'react';

export default function PwaEnregistrement() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const enregistrer = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error("Impossible d'enregistrer la web app Nabe :", error);
      });
    };

    // L'enregistrement PWA n'est pas nécessaire au premier affichage. Il est
    // lancé une fois le chargement terminé et le navigateur disponible.
    const fenetre = window as typeof window & {
      requestIdleCallback?: (rappel: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (identifiant: number) => void;
    };
    let identifiant: number | undefined;
    const apresChargement = () => {
      identifiant = fenetre.requestIdleCallback
        ? fenetre.requestIdleCallback(enregistrer, { timeout: 4000 })
        : window.setTimeout(enregistrer, 3000);
    };

    if (document.readyState === 'complete') apresChargement();
    else window.addEventListener('load', apresChargement, { once: true });

    return () => {
      window.removeEventListener('load', apresChargement);
      if (identifiant === undefined) return;
      if (fenetre.cancelIdleCallback && fenetre.requestIdleCallback) fenetre.cancelIdleCallback(identifiant);
      else window.clearTimeout(identifiant);
    };
  }, []);

  return null;
}
