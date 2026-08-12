'use client';

import { useEffect } from 'react';

const verrousActifs = new Set<symbol>();
let overflowInitial = '';

function appliquerEtatScroll() {
  const verrouille = verrousActifs.size > 0;
  document.documentElement.classList.toggle('nabe-scroll-verrouille', verrouille);
  document.body.classList.toggle('nabe-scroll-verrouille', verrouille);

  if (verrouille) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = overflowInitial === 'hidden' ? '' : overflowInitial;
  }
}

export function useVerrouScroll(actif: boolean) {
  useEffect(() => {
    if (!actif) return;

    const identifiant = Symbol('verrou-scroll');
    if (verrousActifs.size === 0) {
      overflowInitial = document.body.style.overflow;
    }
    verrousActifs.add(identifiant);
    appliquerEtatScroll();

    return () => {
      verrousActifs.delete(identifiant);
      appliquerEtatScroll();
    };
  }, [actif]);
}

export function reparerScrollSansPanneau() {
  if (verrousActifs.size > 0) return;
  overflowInitial = '';
  document.documentElement.classList.remove('nabe-scroll-verrouille');
  document.body.classList.remove('nabe-scroll-verrouille');
  if (document.body.style.overflow === 'hidden') {
    document.body.style.overflow = '';
  }
}
