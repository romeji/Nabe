'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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

  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [texteConfirmation, setTexteConfirmation] = useState('');
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState('');

  async function supprimerCompte() {
    setSuppressionEnCours(true);
    setErreurSuppression('');
    try {
      const res = await fetch('/api/auth-client/compte', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la suppression du compte.');
      }
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      setErreurSuppression(err.message || 'Erreur lors de la suppression du compte.');
      setSuppressionEnCours(false);
    }
  }

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

      <div className="formulaire-profil__section formulaire-profil__section--danger admin-carte">
        <h2>Supprimer mon compte</h2>
        <p className="formulaire-profil__aide">
          Cette action est définitive. Un e-mail de confirmation vous sera envoyé.
          {' '}
          Si vous avez déjà passé au moins une commande, vos informations personnelles seront effacées mais
          l'historique de commande sera conservé de façon anonymisée (obligation légale de conservation des
          documents comptables pendant 10 ans) ; sinon votre compte sera entièrement supprimé.
        </p>

        {!confirmationSuppression ? (
          <button type="button" className="btn formulaire-profil__btn-danger" onClick={() => setConfirmationSuppression(true)}>
            Supprimer mon compte
          </button>
        ) : (
          <div className="formulaire-profil__confirmation-suppression">
            <label>
              Tapez <strong>SUPPRIMER</strong> pour confirmer
            </label>
            <input type="text" value={texteConfirmation} onChange={(e) => setTexteConfirmation(e.target.value)} />

            {erreurSuppression && <p className="formulaire-profil__erreur">{erreurSuppression}</p>}

            <div className="formulaire-profil__confirmation-actions">
              <button
                type="button"
                className="btn formulaire-profil__btn-danger"
                disabled={texteConfirmation !== 'SUPPRIMER' || suppressionEnCours}
                onClick={supprimerCompte}
              >
                {suppressionEnCours ? 'Suppression...' : 'Confirmer la suppression définitive'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setConfirmationSuppression(false);
                  setTexteConfirmation('');
                  setErreurSuppression('');
                }}
                disabled={suppressionEnCours}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
