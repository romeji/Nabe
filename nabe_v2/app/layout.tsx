import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

// next/font héberge les polices directement sur le domaine du site (Vercel) au
// lieu d'aller les chercher chez Google à chaque visite : ça supprime un
// aller-retour réseau complet avant que le texte ne s'affiche, et empêche
// tout décalage de mise en page (CLS) pendant le chargement. Nettement plus
// rapide que l'ancien `@import` dans le CSS, qui bloquait le rendu.
//
// "Imperial Script" (logo) n'a pas besoin d'être optimisée ainsi : elle n'est
// utilisée qu'à un seul endroit précis (le logo), son poids est négligeable
// et son import direct dans le CSS reste la solution la plus simple pour cet
// usage ponctuel.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nabe-bijoux.fr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nabe — Bijoux façonnés à la main',
    template: '%s | Nabe',
  },
  description:
    'Maison de joaillerie artisanale. Bijoux façonnés à la main, inspirés par l\'émotion, la matière et le temps.',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Nabe',
    title: 'Nabe — Bijoux façonnés à la main',
    description: "Maison de joaillerie artisanale. Bijoux façonnés à la main, inspirés par l'émotion, la matière et le temps.",
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nabe — Bijoux façonnés à la main',
    description: "Maison de joaillerie artisanale. Bijoux façonnés à la main, inspirés par l'émotion, la matière et le temps.",
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cormorantGaramond.variable} ${jost.variable}`}>
      <head></head>
      <body>
        {children}
      </body>
    </html>
  );
}
