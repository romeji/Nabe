import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
