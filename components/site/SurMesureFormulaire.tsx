'use client';

import { useState } from 'react';
import Image from 'next/image';

type Produit = {
  id: string;
  nom: string;
  type: string;
  images: { url: string }[];
};

const ONGLETS = [
  { valeur: 'BAGUE', label: 'Bagues' },
  { valeur: 'COLLIER', label: 'Colliers' },
  { valeur: 'BOUCLES_OREILLES', label: "Boucles d'oreilles" },
  { valeur: 'BRACELET', label: 'Bracelets' },
];

export default function SurMesureFormulaire({ produits }: { produits: Produit[] }) {
  const [ongletActif, setOngletActif] = useState('BAGUE');
  const [modeleId, setModeleId] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  const produitsFiltres = produits.filter((p) => p.type === ongletActif);

  async function gererSoumission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');

    const formData = new FormData(e.currentTarget);
    const donnees = {
      modeleSelectionne: produits.find((p) => p.id === modeleId)?.nom || formData.get('modeleSelectionne'),
      tailleSouhaitee: formData.get('tailleSouhaitee'),
      matiere: formData.get('matiere'),
      pierre: formData.get('pierre'),
      gravure: formData.get('gravure'),
      message: formData.get('message'),
      nom: formData.get('nom'),
      email: formData.get('email'),
      telephone: formData.get('telephone'),
    };

    try {
      const res = await fetch('/api/sur-mesure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      setEnvoye(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setErreur("Une erreur est survenue. Merci de réessayer ou de nous contacter directement.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="surmesure-formulaire conteneur">
      <div className="surmesure-formulaire__colonne">
        <h2>1. Choisissez votre modèle</h2>
        <p className="surmesure-formulaire__sous-titre">
          Sélectionnez le bijou que vous souhaitez commander.
        </p>

        <div className="surmesure-formulaire__onglets">
          {ONGLETS.map((o) => (
            <button
              key={o.valeur}
              type="button"
              className={ongletActif === o.valeur ? 'actif' : ''}
              onClick={() => setOngletActif(o.valeur)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="surmesure-formulaire__modeles">
          {produitsFiltres.length === 0 ? (
            <p className="surmesure-formulaire__vide">Aucun modèle dans cette catégorie pour le moment.</p>
          ) : (
            produitsFiltres.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`surmesure-formulaire__modele ${modeleId === p.id ? 'actif' : ''}`}
                onClick={() => setModeleId(p.id)}
              >
                {p.images[0] ? (
                  <Image src={p.images[0].url} alt={p.nom} width={120} height={120} />
                ) : (
                  <div className="surmesure-formulaire__placeholder" />
                )}
                <span>{p.nom}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="surmesure-formulaire__colonne">
        <h2>2. Personnalisez votre demande</h2>
        <p className="surmesure-formulaire__sous-titre">
          Indiquez vos préférences et nous vous recontacterons rapidement.
        </p>

        {envoye ? (
          <div className="surmesure-formulaire__succes">
            ✓ Votre demande a bien été envoyée. Nous vous répondrons très vite !
          </div>
        ) : (
          <form onSubmit={gererSoumission} className="surmesure-formulaire__form">
            <input type="hidden" name="modeleSelectionne" value={modeleId} />

            <label>Taille souhaitée</label>
            <select name="tailleSouhaitee">
              <option value="">Sélectionnez votre taille</option>
              {['48', '50', '52', '54', '56', '58', '60'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label>Matière</label>
            <select name="matiere">
              <option value="">Sélectionnez une matière</option>
              <option value="Or jaune 18k">Or jaune 18k</option>
              <option value="Or blanc 18k">Or blanc 18k</option>
              <option value="Or rose 18k">Or rose 18k</option>
              <option value="Argent 925">Argent 925</option>
            </select>

            <label>Pierre principale (si applicable)</label>
            <select name="pierre">
              <option value="">Sélectionnez une pierre</option>
              <option value="Diamant">Diamant</option>
              <option value="Perle">Perle</option>
              <option value="Pierre de lune">Pierre de lune</option>
              <option value="Quartz">Quartz</option>
              <option value="Topaze">Topaze</option>
              <option value="Saphir">Saphir</option>
              <option value="Émeraude">Émeraude</option>
            </select>

            <label>Gravure (optionnelle)</label>
            <input type="text" name="gravure" placeholder="Ex : Initiales, date, mot doux..." />

            <label>Votre message</label>
            <textarea
              name="message"
              placeholder="Décrivez votre projet, vos envies, les détails importants..."
              rows={4}
              required
            />

            <label>Vos coordonnées</label>
            <div className="surmesure-formulaire__ligne">
              <input type="text" name="nom" placeholder="Votre nom" required />
              <input type="email" name="email" placeholder="Votre e-mail" required />
            </div>
            <input type="tel" name="telephone" placeholder="Votre téléphone (optionnel)" />

            {erreur && <p className="surmesure-formulaire__erreur">{erreur}</p>}

            <button type="submit" className="btn btn-or" disabled={envoiEnCours}>
              {envoiEnCours ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>

            <p className="surmesure-formulaire__confidentialite">
              🔒 Vos données sont confidentielles et utilisées uniquement pour traiter votre
              demande.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
