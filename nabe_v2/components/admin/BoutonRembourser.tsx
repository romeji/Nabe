'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BoutonRembourser({ commandeId, dejaRembourse }: { commandeId: string; dejaRembourse: boolean }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function rembourser() {
    setEnCours(true);
    setErreur('');
    try {
      const res = await fetch(`/api/admin/commandes/${commandeId}/rembourser`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      router.refresh();
      setConfirmation(false);
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setEnCours(false);
    }
  }

  if (dejaRembourse) {
    return <span className="admin-badge admin-badge--neutre">Déjà remboursée</span>;
  }

  if (!confirmation) {
    return (
      <button type="button" className="admin-btn-supprimer" onClick={() => setConfirmation(true)}>
        Rembourser cette commande
      </button>
    );
  }

  return (
    <div className="bouton-rembourser__confirmation">
      <p>
        Confirmer le remboursement intégral via Stripe ? Cette action est irréversible et le client sera
        automatiquement notifié par e-mail.
      </p>
      {erreur && <p className="admin-erreur">{erreur}</p>}
      <div className="bouton-rembourser__actions">
        <button type="button" className="admin-btn-supprimer" onClick={rembourser} disabled={enCours}>
          {enCours ? 'Remboursement en cours…' : 'Oui, rembourser'}
        </button>
        <button type="button" className="btn" onClick={() => setConfirmation(false)} disabled={enCours}>
          Annuler
        </button>
      </div>
    </div>
  );
}
