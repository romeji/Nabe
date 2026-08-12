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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTEUR_ANIMATIONS));
    document.body.classList.add('animations-site-actives');

    elements.forEach((element, index) => {
      element.classList.add('nabe-reveal');
      element.style.setProperty('--nabe-reveal-delay', `${(index % 4) * 70}ms`);
    });

    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (!entree.isIntersecting) return;
          (entree.target as HTMLElement).classList.add('nabe-reveal--visible');
          observateur.unobserve(entree.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -7% 0px' },
    );

    elements.forEach((element) => observateur.observe(element));

    return () => {
      observateur.disconnect();
      document.body.classList.remove('animations-site-actives');
      elements.forEach((element) => {
        element.classList.remove('nabe-reveal', 'nabe-reveal--visible');
        element.style.removeProperty('--nabe-reveal-delay');
      });
    };
  }, [pathname]);

  return null;
}
