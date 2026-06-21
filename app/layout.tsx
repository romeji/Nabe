import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Nabe — Bijoux façonnés à la main',
    template: '%s | Nabe',
  },
  description:
    'Maison de joaillerie artisanale. Bijoux façonnés à la main, inspirés par l\'émotion, la matière et le temps.',
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
