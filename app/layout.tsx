import type { Metadata } from 'next';
import Script from 'next/script';

const GA_ID = 'G-DCRHVSBYYC';
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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-K4TMHB8F');
          `}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K4TMHB8F"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
