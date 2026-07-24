'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LABELS_STATUT_COMMANDE } from '@/lib/utils';

export default function StatutCommandeSelect({
  commandeId,
  statutInitial,
}: {
  commandeId: string;
  statutInitial: string;
}) {
  const router = useRouter();
  const [statut, setStatut] = useState(statutInitial);
  const [enCours, setEnCours] = useState(false);

  async function gererChangement(e: React.ChangeEvent<HTMLSelectElement>) {
    const nouveauStatut = e.target.value;

    let numeroSuivi: string | undefined;
    if (nouveauStatut === 'EXPEDIEE') {
      const saisie = window.prompt(
        'Numéro de suivi transporteur (optionnel, laissez vide si vous ne l’avez pas encore) :'
      );
      if (saisie === null) return; // annulé : on ne change pas le statut
      numeroSuivi = saisie.trim() || undefined;
    }

    setStatut(nouveauStatut);
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nouveauStatut, ...(numeroSuivi !== undefined ? { numeroSuivi } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour du statut.');
      router.refresh();
    } catch (e: any) {
      setStatut(statutInitial);
      alert(e.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <select value={statut} onChange={gererChangement} disabled={enCours} className="admin-commandes__select">
      {Object.entries(LABELS_STATUT_COMMANDE).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
