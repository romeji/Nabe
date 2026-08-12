'use client';

import { useEffect } from 'react';
import { reparerScrollSansPanneau } from './useVerrouScroll';

export default function ReparationScrollAccueil() {
  useEffect(() => {
    function reparer() {
      window.requestAnimationFrame(reparerScrollSansPanneau);
    }

    reparer();
    window.addEventListener('pageshow', reparer);
    document.addEventListener('visibilitychange', reparer);

    return () => {
      window.removeEventListener('pageshow', reparer);
      document.removeEventListener('visibilitychange', reparer);
    };
  }, []);

  return null;
}
