'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SELECTEUR_ANIMATIONS = [
  'main section:not(.accueil-hero):not(.accueil-reassurance)',
  '.carrousel-produits__carte',
  '.accueil-categories__carte',
  '.instagram-module__carte',
].join(',');

export default function AnimationsSite() {
  const pathname = usePathname();

  useEffect(() => {
    // Sur mobile, l'utilisateur doit pouvoir faire défiler la page dès le
    // premier affichage. Modifier toutes les sections et cartes pendant
    // l'hydratation créait de longues tâches sur les appareils moins rapides.
    if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px), (pointer: coarse)').matches) return;

    let observateur: IntersectionObserver | null = null;
    let elements: HTMLElement[] = [];
    let annule = false;

    function initialiser() {
      if (annule) return;
      elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTEUR_ANIMATIONS));
      document.body.classList.add('animations-site-actives');

      elements.forEach((element, index) => {
        element.classList.add('nabe-reveal');
        element.style.setProperty('--nabe-reveal-delay', `${(index % 4) * 70}ms`);
      });

      observateur = new IntersectionObserver(
        (entrees) => {
          entrees.forEach((entree) => {
            if (!entree.isIntersecting) return;
            (entree.target as HTMLElement).classList.add('nabe-reveal--visible');
            observateur?.unobserve(entree.target);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -7% 0px' },
      );

      elements.forEach((element) => observateur?.observe(element));
    }

    // Safari ne supporte toujours pas requestIdleCallback/cancelIdleCallback
    // à l'exécution, même si les types TypeScript récents les déclarent
    // désormais comme toujours présents sur `window`. On vérifie donc leur
    // existence réelle avec l'opérateur `in`, que TypeScript ne considère
    // pas comme toujours vrai, plutôt qu'un simple test de vérité.
    const supporteIdle = 'requestIdleCallback' in window && 'cancelIdleCallback' in window;
    const fenetre = window as typeof window & {
      requestIdleCallback: (rappel: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback: (identifiant: number) => void;
    };
    const identifiant = supporteIdle
      ? fenetre.requestIdleCallback(initialiser, { timeout: 1500 })
      : window.setTimeout(initialiser, 800);

    return () => {
      annule = true;
      if (supporteIdle) fenetre.cancelIdleCallback(identifiant);
      else window.clearTimeout(identifiant);
      observateur?.disconnect();
      document.body.classList.remove('animations-site-actives');
      elements.forEach((element) => {
        element.classList.remove('nabe-reveal', 'nabe-reveal--visible');
        element.style.removeProperty('--nabe-reveal-delay');
      });
    };
  }, [pathname]);

  return null;
}
