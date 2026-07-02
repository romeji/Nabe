'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BoutonSupprimerNewsletter({ newsletterId }: { newsletterId: string }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [suppression, setSuppression] = useState(false);

  async function gererSuppression() {
    setSuppression(true);
    try {
      const res = await fetch(`/api/admin/newsletters/${newsletterId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.push('/admin/newsletters');
      router.refresh();
    } catch {
      setSuppression(false);
      alert('Erreur lors de la suppression.');
    }
  }

  if (confirmation) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem' }}>Supprimer ce brouillon ?</span>
        <button className="admin-btn-icone admin-btn-supprimer" onClick={gererSuppression} disabled={suppression}>
          {suppression ? '...' : 'Oui, supprimer'}
        </button>
        <button className="admin-btn-icone" onClick={() => setConfirmation(false)}>
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button className="admin-btn-icone admin-btn-supprimer" onClick={() => setConfirmation(true)}>
      Supprimer ce brouillon
    </button>
  );
}
