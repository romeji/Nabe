'use client';

import { useState } from 'react';

export default function FormulaireProfilClient({
  nom: nomInitial,
  email,
  telephone: telephoneInitial,
  aUnMotDePasse,
}: {
  nom: string;
  email: string;
  telephone: string;
  aUnMotDePasse: boolean;
}) {
  const [nom, setNom] = useState(nomInitial);
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState('');

  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [enregistrementMdp, setEnregistrementMdp] = useState(false);
  const [succesMdp, setSuccesMdp] = useState(false);
  const [erreurMdp, setErreurMdp] = useState('');

  async function sauvegarderInfos(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setErreur('');
    setSucces(false);
    try {
      const res = await fetch('/api/mon-compte/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, telephone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setSucces(true);
      setTimeout(() => setSucces(false), 2500);
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setEnregistrement(false);
    }
  }

  async function sauvegarderMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    setErreurMdp('');
    setSuccesMdp(false);

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreurMdp('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setEnregistrementMdp(true);
    try {
      const res = await fetch('/api/mon-compte/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motDePasseActuel, nouveauMotDePasse }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setSuccesMdp(true);
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
      setTimeout(() => setSuccesMdp(false), 2500);
    } catch (err: any) {
      setErreurMdp(err.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setEnregistrementMdp(false);
    }
  }

  return (
    <div className="formulaire-profil">
      <form onSubmit={sauvegarderInfos} className="formulaire-profil__section admin-carte">
        <h2>Informations personnelles</h2>

        <label>Email</label>
        <input type="email" value={email} disabled />
        <p className="formulaire-profil__aide">L'e-mail ne peut pas être modifié.</p>

        <label>Nom</label>
        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />

        <label>Téléphone</label>
        <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />

        {erreur && <p className="formulaire-profil__erreur">{erreur}</p>}

        <button type="submit" className="btn btn-primaire" disabled={enregistrement}>
          {enregistrement ? 'Enregistrement...' : succes ? '✓ Enregistré' : 'Enregistrer'}
        </button>
      </form>

      <form onSubmit={sauvegarderMotDePasse} className="formulaire-profil__section admin-carte">
        <h2>Mot de passe</h2>

        {aUnMotDePasse && (
          <>
            <label>Mot de passe actuel</label>
            <input
              type="password"
              value={motDePasseActuel}
              onChange={(e) => setMotDePasseActuel(e.target.value)}
              required
            />
          </>
        )}

        <label>Nouveau mot de passe</label>
        <input
          type="password"
          value={nouveauMotDePasse}
          onChange={(e) => setNouveauMotDePasse(e.target.value)}
          minLength={6}
          required
        />

        <label>Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          value={confirmationMotDePasse}
          onChange={(e) => setConfirmationMotDePasse(e.target.value)}
          minLength={6}
          required
        />

        {!aUnMotDePasse && (
          <p className="formulaire-profil__aide">
            Vous êtes connecté(e) via Google. Définir un mot de passe vous permettra aussi de vous
            connecter avec votre e-mail.
          </p>
        )}

        {erreurMdp && <p className="formulaire-profil__erreur">{erreurMdp}</p>}

        <button type="submit" className="btn btn-primaire" disabled={enregistrementMdp}>
          {enregistrementMdp ? 'Enregistrement...' : succesMdp ? '✓ Mot de passe modifié' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  );
}
