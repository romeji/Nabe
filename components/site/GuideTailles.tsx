'use client';

import { useEffect, useState } from 'react';
import { TAILLES_BAGUES } from '@/lib/tailles';
import './guide-tailles.css';

export default function GuideTailles({ trigger }: { trigger?: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [onglet, setOnglet] = useState<'mesurer' | 'guide' | 'faq'>('guide');

  useEffect(() => {
    if (!ouvert) return;

    const ancienOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function fermerAvecEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOuvert(false);
    }

    window.addEventListener('keydown', fermerAvecEscape);
    return () => {
      document.body.style.overflow = ancienOverflow;
      window.removeEventListener('keydown', fermerAvecEscape);
    };
  }, [ouvert]);

  return (
    <>
      {trigger ? (
        <button type="button" className="guide-tailles__declencheur" onClick={() => setOuvert(true)}>
          {trigger}
        </button>
      ) : (
        <button type="button" className="guide-tailles__lien" onClick={() => setOuvert(true)}>
          Trouver ma taille
        </button>
      )}

      {ouvert && (
        <div className="guide-tailles__overlay" onClick={() => setOuvert(false)}>
          <div
            className="guide-tailles__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Guide des tailles"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="guide-tailles__onglets">
              <button className={onglet === 'mesurer' ? 'actif' : ''} onClick={() => setOnglet('mesurer')}>
                Mesurer
              </button>
              <button className={onglet === 'guide' ? 'actif' : ''} onClick={() => setOnglet('guide')}>
                Guide des tailles
              </button>
              <button className={onglet === 'faq' ? 'actif' : ''} onClick={() => setOnglet('faq')}>
                FAQ
              </button>
              <button className="guide-tailles__fermer" onClick={() => setOuvert(false)} aria-label="Fermer">
                ✕
              </button>
            </div>

            <div className="guide-tailles__contenu">
              {onglet === 'mesurer' && (
                <div className="guide-tailles__mesurer">
                  <h3>Comment mesurer votre taille ?</h3>
                  <ol>
                    <li>Prenez un fil ou une bande de papier fine.</li>
                    <li>Enroulez-le autour de la base de votre doigt.</li>
                    <li>Marquez l'endroit où les deux extrémités se rejoignent.</li>
                    <li>Mesurez cette longueur en millimètres avec une règle.</li>
                    <li>Comparez le résultat à la colonne « Circonférence » du guide des tailles.</li>
                  </ol>
                  <p className="guide-tailles__astuce">
                    💡 Astuce : mesurez en fin de journée, lorsque vos doigts sont le plus naturellement dilatés.
                  </p>
                </div>
              )}

              {onglet === 'guide' && (
                <div className="guide-tailles__tableau-wrap">
                  <table className="guide-tailles__tableau">
                    <thead>
                      <tr>
                        <th>ISO / EU</th>
                        <th>Circonf.</th>
                        <th>Diamètre</th>
                        <th>US</th>
                        <th>UK</th>
                        <th>IT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TAILLES_BAGUES.map((t: any) => (
                        <tr key={t.iso}>
                          <td>{t.iso}</td>
                          <td>{t.circ}</td>
                          <td>{t.diam}</td>
                          <td>{t.us}</td>
                          <td>{t.uk}</td>
                          <td>{t.it}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {onglet === 'faq' && (
                <div className="guide-tailles__faq">
                  <h3>Je ne trouve pas ma taille, que faire ?</h3>
                  <p>
                    Si une bague n'est pas disponible dans votre taille, contactez-nous pour une
                    pré-commande : nous pouvons la réaliser sur demande.
                  </p>
                  <a href="/sur-mesure" className="btn btn-primaire">
                    Faire une demande de pré-commande
                  </a>
                  <p className="guide-tailles__voir-plus">
                    <a href="/guide-des-tailles">Voir le guide complet des tailles →</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
