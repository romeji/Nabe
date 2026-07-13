'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Administrateur = { id: string; email: string; name: string | null; createdAt: string };

export default function AdministrateursClient({ administrateurs }: { administrateurs: Administrateur[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const idConnecte = (session?.user as any)?.id;

  const [nouveau, setNouveau] = useState({ email: '', name: '', password: '' });
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/admin/administrateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveau),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setNouveau({ email: '', name: '', password: '' });
      router.refresh();
    } catch (e: any) {
      setErreur(e.message || 'Erreur lors de la création.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function supprimer(id: string, email: string) {
    if (!confirm(`Supprimer définitivement l'accès administrateur de ${email} ?`)) return;
    try {
      const res = await fetch(`/api/admin/administrateurs/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression.');
      router.refresh();
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la suppression.');
    }
  }

  return (
    <div className="admin-categories__grille">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Nom</th>
              <th>Depuis le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {administrateurs.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.email} {a.id === idConnecte && <em>(vous)</em>}
                </td>
                <td>{a.name || '—'}</td>
                <td>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  {a.id !== idConnecte && (
                    <button className="btn" style={{ color: '#a8412a' }} onClick={() => supprimer(a.id, a.email)}>
                      Retirer les droits admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-carte">
        <h2>Ajouter un administrateur</h2>
        <p className="formulaire-produit__aide">
          La personne pourra se connecter sur /admin/login avec cet e-mail et ce mot de passe, avec un
          accès complet à toute l'administration (produits, commandes, réglages...). N'ajoutez que des
          personnes de confiance.
        </p>
        <form onSubmit={creer} className="admin-form">
          <div>
            <label>E-mail</label>
            <input
              type="email"
              value={nouveau.email}
              onChange={(e) => setNouveau((n) => ({ ...n, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Nom (optionnel)</label>
            <input
              type="text"
              value={nouveau.name}
              onChange={(e) => setNouveau((n) => ({ ...n, name: e.target.value }))}
            />
          </div>
          <div>
            <label>Mot de passe (8 caractères minimum)</label>
            <input
              type="password"
              minLength={8}
              value={nouveau.password}
              onChange={(e) => setNouveau((n) => ({ ...n, password: e.target.value }))}
              required
            />
          </div>
          {erreur && <p style={{ color: '#a8412a', fontSize: '0.85rem' }}>{erreur}</p>}
          <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
            {envoiEnCours ? 'Création...' : 'Ajouter cet administrateur'}
          </button>
        </form>
      </div>
    </div>
  );
}
