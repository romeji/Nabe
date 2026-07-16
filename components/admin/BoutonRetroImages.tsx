'use client';

import { useState } from 'react';

export default function BoutonRetroImages() {
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);

  async function lancer() {
    setEnCours(true);
    setResultat(null);
    try {
      const res = await fetch('/api/admin/commandes/retro-images', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setResultat(
        `${data.misesAJour} commande(s) mise(s) à jour avec l'image du produit. ` +
          (data.produitSupprimeDefinitivementSansImage > 0
            ? `${data.produitSupprimeDefinitivementSansImage} ligne(s) concernent un bijou supprimé du catalogue : aucune image n'est récupérable pour celles-ci.`
            : '')
      );
    } catch (err: any) {
      setResultat(`Erreur : ${err.message}`);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button type="button" className="btn" onClick={lancer} disabled={enCours}>
        {enCours ? 'Récupération en cours…' : 'Récupérer les images des anciennes commandes'}
      </button>
      {resultat && (
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--texte-secondaire)' }}>{resultat}</p>
      )}
    </div>
  );
}
