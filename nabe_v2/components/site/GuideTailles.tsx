'use client';

import { useState } from 'react';
import './guide-tailles.css';

export const TAILLES = [
  { iso: 40, circ: '40.0mm', diam: '12.7mm', us: '1 ¼', uk: 'C', it: 0 },
  { iso: 41, circ: '41.0mm', diam: '13.1mm', us: '1 ¾', uk: 'D', it: 1 },
  { iso: 42, circ: '42.0mm', diam: '13.4mm', us: '2 ¼', uk: 'D 1/2', it: 2 },
  { iso: 43, circ: '43.0mm', diam: '13.7mm', us: '2 ½', uk: 'E 1/2', it: 3 },
  { iso: 44, circ: '44.0mm', diam: '14.0mm', us: '3', uk: 'F', it: 4 },
  { iso: 45, circ: '45.0mm', diam: '14.3mm', us: '3 ¼', uk: 'G', it: 5 },
  { iso: 46, circ: '46.0mm', diam: '14.6mm', us: '3 ¾', uk: 'H', it: 6 },
  { iso: 47, circ: '47.0mm', diam: '15.0mm', us: '4', uk: 'H 1/2', it: 7 },
  { iso: 48, circ: '48.0mm', diam: '15.3mm', us: '4 ½', uk: 'I 1/2', it: 8 },
  { iso: 49, circ: '49.0mm', diam: '15.6mm', us: '5', uk: 'J', it: 9 },
  { iso: 50, circ: '50.0mm', diam: '15.9mm', us: '5 ¼', uk: 'K', it: 10 },
  { iso: 51, circ: '51.0mm', diam: '16.2mm', us: '5 ¾', uk: 'L', it: 11 },
  { iso: 52, circ: '52.0mm', diam: '16.6mm', us: '6', uk: 'L 1/2', it: 12 },
  { iso: 54, circ: '54.0mm', diam: '17.2mm', us: '6 ¾', uk: 'N', it: 14 },
  { iso: 56, circ: '56.0mm', diam: '17.8mm', us: '7 ½', uk: 'P', it: 16 },
  { iso: 58, circ: '58.0mm', diam: '18.5mm', us: '8 ¼', uk: 'R', it: 18 },
  { iso: 60, circ: '60.0mm', diam: '19.1mm', us: '9', uk: 'T', it: 20 },
];

export default function GuideTailles({ trigger }: { trigger?: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [onglet, setOnglet] = useState<'mesurer' | 'guide' | 'faq'>('guide');

  return (
    <>
      {trigger ? (
        <span onClick={() => setOuvert(true)} style={{ cursor: 'pointer' }}>
          {trigger}
        </span>
      ) : (
        <button type="button" className="guide-tailles__lien" onClick={() => setOuvert(true)}>
          Trouver ma taille
        </button>
      )}

      {ouvert && (
        <div className="guide-tailles__overlay" onClick={() => setOuvert(false)}>
          <div className="guide-tailles__modal" onClick={(e) => e.stopPropagation()}>
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
                      {TAILLES.map((t: any) => (
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
