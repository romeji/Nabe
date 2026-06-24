'use client';

import { useState } from 'react';

export default function AccordeonProduit({ description }: { description: string }) {
  const [ouvert, setOuvert] = useState<string | null>('description');

  function basculer(id: string) {
    setOuvert(ouvert === id ? null : id);
  }

  return (
    <div className="accordeon-produit">
      <div className="accordeon-produit__item">
        <button className="accordeon-produit__entete" onClick={() => basculer('description')}>
          Description du bijou
          <span>{ouvert === 'description' ? '−' : '+'}</span>
        </button>
        {ouvert === 'description' && (
          <div className="accordeon-produit__contenu">
            <p>{description}</p>
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
