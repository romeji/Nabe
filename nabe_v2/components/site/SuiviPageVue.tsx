'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { suivrePageVue } from '@/lib/analytics';

function SuiviPageVueInterne() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    suivrePageVue(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Next.js navigue entre les pages côté client, sans rechargement complet du
 * navigateur : le tag Google Analytics ne détecte donc automatiquement que
 * la toute première page visitée, pas les suivantes. Ce composant, monté une
 * seule fois à la racine du site, envoie manuellement un événement
 * "page_view" à chaque changement de route pour que les statistiques de
 * fréquentation reflètent la réalité.
 */
export default function SuiviPageVue() {
  return (
    <Suspense fallback={null}>
      <SuiviPageVueInterne />
    </Suspense>
  );
}
