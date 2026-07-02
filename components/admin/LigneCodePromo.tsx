'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formaterPrix } from '@/lib/utils';

type CodePromo = {
  id: string;
  code: string;
  type: string;
  valeur: number;
  actif: boolean;
  nomCollaborateur: string | null;
  commissionPourcentage: number | null;
  utilisationMax: number | null;
  nombreUtilisations: number;
  chiffreAffairesGenere: number;
};

export default function LigneCodePromo({ code }: { code: CodePromo }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);

  async function basculerActif() {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/codes-promo/${code.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !code.actif }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/codes-promo/${code.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.');
      setEnCours(false);
    }
  }

  const commissionEstimee =
    code.commissionPourcentage && code.chiffreAffairesGenere
      ? (code.chiffreAffairesGenere * code.commissionPourcentage) / 100
      : null;

  return (
    <tr>
      <td><strong>{code.code}</strong></td>
      <td>{code.type === 'POURCENTAGE' ? `${code.valeur}%` : formaterPrix(code.valeur)}</td>
      <td>
        {code.nombreUtilisations}
        {code.utilisationMax ? ` / ${code.utilisationMax}` : ''}
      </td>
      <td>{formaterPrix(code.chiffreAffairesGenere)}</td>
      <td>
        {code.nomCollaborateur ? (
          <>
            {code.nomCollaborateur}
            {commissionEstimee !== null && (
              <div style={{ fontSize: '0.78rem', color: 'var(--texte-secondaire)' }}>
                Commission ({code.commissionPourcentage}%) : {formaterPrix(commissionEstimee)}
              </div>
            )}
          </>
        ) : (
          '—'
        )}
      </td>
      <td>
        <button
          className={`admin-badge ${code.actif ? 'admin-badge--succes' : 'admin-badge--neutre'}`}
          onClick={basculerActif}
          disabled={enCours}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          {code.actif ? 'Actif' : 'Inactif'}
        </button>
      </td>
      <td>
        {confirmationSuppression ? (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="admin-btn-icone admin-btn-supprimer" onClick={supprimer} disabled={enCours}>
              Oui
            </button>
            <button className="admin-btn-icone" onClick={() => setConfirmationSuppression(false)}>
              Non
            </button>
          </div>
        ) : (
          <button className="admin-btn-icone admin-btn-supprimer" onClick={() => setConfirmationSuppression(true)}>
            Supprimer
          </button>
        )}
      </td>
    </tr>
  );
}
