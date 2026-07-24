import type { Metadata } from 'next';
import { Cormorant_Garamond, Imperial_Script, Jost } from 'next/font/google';
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

const imperialScript = Imperial_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-imperial-script',
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
    "Bijoux artisanaux façonnés à la main en France : bagues, colliers, bracelets et pièces sur-mesure en argent 925 et matières précieuses.",
  keywords: [
    'bijoux artisanaux',
    'bijoux argent 925',
    'joaillerie artisanale',
    'bague artisanale',
    'bijoux faits main',
    'bijoux sur mesure',
    'Nabe bijoux',
  ],
  applicationName: 'Nabe',
  authors: [{ name: 'Nabe' }],
  creator: 'Nabe',
  publisher: 'Nabe',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
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
    description: "Bijoux artisanaux façonnés à la main en France : bagues, colliers, bracelets et pièces sur-mesure.",
    url: SITE_URL,
    images: [{ url: '/images/hero-mains.jpg', width: 1200, height: 630, alt: 'Bijoux artisanaux Nabe façonnés à la main' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nabe — Bijoux façonnés à la main',
    description: "Bijoux artisanaux façonnés à la main en France : argent 925, pierres naturelles et créations sur-mesure.",
    images: ['/images/hero-mains.jpg'],
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nabe',
    url: SITE_URL,
    logo: `${SITE_URL}/images/signature-bague.jpg`,
    sameAs: [],
  };
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nabe',
    url: SITE_URL,
  };

  return (
    <html lang="fr" className={`${cormorantGaramond.variable} ${jost.variable} ${imperialScript.variable}`}>
      <head>
        <link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icons/favicon-32-dark.png" sizes="32x32" type="image/png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-dark.png" sizes="180x180" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, websiteJsonLd]).replace(/</g, '\\u003c') }}
        />
        {children}
      </body>
    </html>
  );
}
