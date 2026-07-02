'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormulaireCodePromo() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [type, setType] = useState('POURCENTAGE');
  const [valeur, setValeur] = useState('');
  const [nomCollaborateur, setNomCollaborateur] = useState('');
  const [commissionPourcentage, setCommissionPourcentage] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');
  const [utilisationMax, setUtilisationMax] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/codes-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          valeur,
          nomCollaborateur: nomCollaborateur || undefined,
          commissionPourcentage: commissionPourcentage || undefined,
          dateExpiration: dateExpiration || undefined,
          utilisationMax: utilisationMax || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setCode('');
      setValeur('');
      setNomCollaborateur('');
      setCommissionPourcentage('');
      setDateExpiration('');
      setUtilisationMax('');
      router.refresh();
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la création du code.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="admin-carte">
      <h2>Créer un code</h2>
      <form onSubmit={gererSoumission} className="admin-form">
        <div>
          <label>Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex : BIENVENUE10"
            required
          />
        </div>

        <div className="admin-form__ligne">
          <div>
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="POURCENTAGE">Pourcentage (%)</option>
              <option value="MONTANT_FIXE">Montant fixe (€)</option>
            </select>
          </div>
          <div>
            <label>Valeur</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="admin-form__ligne">
          <div>
            <label>Date d'expiration (optionnelle)</label>
            <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} />
          </div>
          <div>
            <label>Utilisations max (optionnel)</label>
            <input
              type="number"
              min="1"
              value={utilisationMax}
              onChange={(e) => setUtilisationMax(e.target.value)}
              placeholder="Illimité si vide"
            />
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--texte-secondaire)', marginTop: '0.3rem' }}>
          Section ci-dessous facultative — utile si ce code est destiné à un collaborateur/affilié
          dont vous souhaitez suivre la commission.
        </p>

        <div className="admin-form__ligne">
          <div>
            <label>Nom du collaborateur (optionnel)</label>
            <input
              type="text"
              value={nomCollaborateur}
              onChange={(e) => setNomCollaborateur(e.target.value)}
              placeholder="Ex : Léa Martin"
            />
          </div>
          <div>
            <label>Commission (% du CA généré)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={commissionPourcentage}
              onChange={(e) => setCommissionPourcentage(e.target.value)}
              placeholder="Ex : 10"
            />
          </div>
        </div>

        {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}

        <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
          {envoiEnCours ? 'Création...' : 'Créer le code'}
        </button>
      </form>
    </div>
  );
}
