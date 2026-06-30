'use client';
import { useState } from 'react';
import './popup-pierres.css';

type PierreInfo = {
  id: string;
  nom: string;
  description: string | null;
  couleurs: { nom: string; codeHex: string }[];
};

export default function PopupPierres({ pierres }: { pierres: PierreInfo[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [ongletActif, setOngletActif] = useState(0);

  if (pierres.length === 0) return null;

  return (
    <>
      <button type="button" className="popup-pierres__lien" onClick={() => setOuvert(true)}>
        En savoir plus sur {pierres.length > 1 ? 'ces pierres' : 'cette pierre'}
        <span className="popup-pierres__pastilles">
          {pierres.flatMap((p) => p.couleurs).slice(0, 4).map((c, i) => (
            <span key={i} className="popup-pierres__pastille" style={{ backgroundColor: c.codeHex }} />
          ))}
        </span>
      </button>

      {ouvert && (
        <div className="popup-pierres__overlay" onClick={() => setOuvert(false)}>
          <div className="popup-pierres__modal" onClick={(e) => e.stopPropagation()}>
            <button className="popup-pierres__fermer" onClick={() => setOuvert(false)} aria-label="Fermer">✕</button>

            {pierres.length > 1 && (
              <div className="popup-pierres__onglets">
                {pierres.map((p, i) => (
                  <button key={p.id} className={i === ongletActif ? 'actif' : ''} onClick={() => setOngletActif(i)}>
                    {p.couleurs[0] && (
                      <span className="popup-pierres__pastille-onglet" style={{ backgroundColor: p.couleurs[0].codeHex }} />
                    )}
                    {p.nom}
                  </button>
                ))}
              </div>
            )}

            <div className="popup-pierres__contenu">
              <h3>{pierres[ongletActif].nom}</h3>
              {pierres[ongletActif].couleurs.length > 0 && (
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  Couleurs : {pierres[ongletActif].couleurs.map(c => c.nom).join(', ')}
                </p>
              )}
              <p>{pierres[ongletActif].description || 'Description à venir.'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
