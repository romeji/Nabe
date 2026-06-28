'use client';

import { useState, useEffect } from 'react';

export default function AccordeonProduit({
  description,
  delaiFabrication,
  fabriqueEnFrance,
  signalOuverture,
}: {
  description: string;
  delaiFabrication?: string | null;
  fabriqueEnFrance?: boolean;
  signalOuverture?: number;
}) {
  const [ouvert, setOuvert] = useState<string | null>('description');

  // Quand le parent déclenche le signal (clic sur "Détails produits"), on force
  // l'ouverture de la description et on scrolle doucement jusqu'à elle.
  useEffect(() => {
    if (signalOuverture && signalOuverture > 0) {
      setOuvert('description');
      document.getElementById('accordeon-description')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [signalOuverture]);

  function basculer(id: string) {
    setOuvert(ouvert === id ? null : id);
  }

  return (
    <div className="accordeon-produit">
      <div className="accordeon-produit__item" id="accordeon-description">
        <button className="accordeon-produit__entete" onClick={() => basculer('description')}>
          Description du bijou
          <span>{ouvert === 'description' ? '−' : '+'}</span>
        </button>
        {ouvert === 'description' && (
          <div className="accordeon-produit__contenu">
            <p>{description}</p>
            {(delaiFabrication || fabriqueEnFrance) && (
              <ul className="accordeon-produit__details-liste">
                {delaiFabrication && (
                  <li>
                    <strong>Délai de fabrication :</strong> {delaiFabrication}
                  </li>
                )}
                {fabriqueEnFrance && <li>Fabriqué à la main en France</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="accordeon-produit__item">
        <button className="accordeon-produit__entete" onClick={() => basculer('satisfait')}>
          14 jours pour changer d'avis
          <span>{ouvert === 'satisfait' ? '−' : '+'}</span>
        </button>
        {ouvert === 'satisfait' && (
          <div className="accordeon-produit__contenu">
            <h4>Satisfait ou Remboursé</h4>
            <p>
              Si jamais ta commande ne te convient pas, pas de souci : tu peux demander un retour
              ou un échange dans les 14 jours après l'avoir reçue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
