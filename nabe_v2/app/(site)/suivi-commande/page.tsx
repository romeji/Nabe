'use client';

import { useState } from 'react';
import SuiviCommandeDetail, { CommandeDetail } from '@/components/site/SuiviCommandeDetail';
import './suivi-commande-page.css';

export default function PageSuiviCommande() {
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function rechercher(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    setCommande(null);
    try {
      const res = await fetch('/api/commandes/suivi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setCommande(data.commande);
    } catch (e: any) {
      setErreur(e.message || 'Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="page-suivi-commande conteneur">
      <h1>Suivre ma commande</h1>
      <p className="page-suivi-commande__intro">
        Renseignez votre numéro de commande (indiqué dans votre e-mail de confirmation) et l’adresse e-mail utilisée
        lors de l’achat.
      </p>

      <form onSubmit={rechercher} className="page-suivi-commande__form">
        <div>
          <label>Numéro de commande</label>
          <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="NABE-2026-0001" required />
        </div>
        <div>
          <label>E-mail utilisé à la commande</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primaire" disabled={chargement}>
          {chargement ? 'Recherche...' : 'Rechercher'}
        </button>
        {erreur && <p className="page-suivi-commande__erreur">{erreur}</p>}
      </form>

      {commande && (
        <div className="page-suivi-commande__resultat">
          <SuiviCommandeDetail commande={commande} modeAnnulation={{ type: 'invite', numero, email }} />
        </div>
      )}
    </div>
  );
}
