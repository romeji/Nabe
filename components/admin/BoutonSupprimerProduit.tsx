'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BoutonSupprimerProduit({ produitId }: { produitId: string }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [suppression, setSuppression] = useState(false);

  async function gererSuppression() {
    setSuppression(true);
    try {
      const res = await fetch(`/api/admin/produits/${produitId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression.');
      router.push('/admin/produits');
      router.refresh();
    } catch (e: any) {
      setSuppression(false);
      alert(e.message || 'Erreur lors de la suppression.');
    }
  }

  if (confirmation) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem' }}>Confirmer la suppression ?</span>
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
      Supprimer ce bijou
    </button>
  );
}
