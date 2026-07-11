'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import './consentement-cookies.css';

type Choix = 'accepte' | 'refuse';

const CLE_STOCKAGE = 'nabe_consentement_analytics';

export default function ConsentementCookies({
  googleAnalyticsActif,
  googleAnalyticsId,
}: {
  googleAnalyticsActif: boolean;
  googleAnalyticsId: string;
}) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [banniereVisible, setBanniereVisible] = useState(false);

  useEffect(() => {
    const stocke = window.localStorage.getItem(CLE_STOCKAGE) as Choix | null;
    if (stocke === 'accepte' || stocke === 'refuse') {
      setChoix(stocke);
    } else {
      setBanniereVisible(true);
    }
  }, []);

  function repondre(reponse: Choix) {
    window.localStorage.setItem(CLE_STOCKAGE, reponse);
    setChoix(reponse);
    setBanniereVisible(false);
  }

  return (
    <>
      {banniereVisible && (
        <div className="consentement-cookies" role="dialog" aria-label="Consentement aux cookies">
          <p>
            Nous utilisons uniquement des cookies de mesure d'audience (Google Analytics) pour comprendre
            comment le site est utilisé et l'améliorer. Aucun cookie publicitaire ou de traçage tiers.
            Vous pouvez accepter ou refuser librement — cela n'affecte pas votre navigation.{' '}
            <a href="/confidentialite">En savoir plus</a>.
          </p>
          <div className="consentement-cookies__actions">
            <button type="button" className="btn" onClick={() => repondre('refuse')}>
              Refuser
            </button>
            <button type="button" className="btn btn-primaire" onClick={() => repondre('accepte')}>
              Accepter
            </button>
          </div>
        </div>
      )}

      {choix === 'accepte' && googleAnalyticsActif && googleAnalyticsId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
