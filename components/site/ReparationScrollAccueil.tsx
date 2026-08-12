'use client';

import { useEffect } from 'react';
import { reparerScrollSansPanneau } from './useVerrouScroll';

export default function ReparationScrollAccueil() {
  useEffect(() => {
    function reparer() {
      window.requestAnimationFrame(reparerScrollSansPanneau);
    }

    const observateur = new MutationObserver(reparer);
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    observateur.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });

    reparer();
    window.addEventListener('pageshow', reparer);
    document.addEventListener('visibilitychange', reparer);

    return () => {
      observateur.disconnect();
      window.removeEventListener('pageshow', reparer);
      document.removeEventListener('visibilitychange', reparer);
    };
  }, []);

  return null;
}
