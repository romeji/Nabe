'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ContactFormulaire() {
  const searchParams = useSearchParams();
  const sujetInitial = searchParams.get('sujet') || '';
  const messageInitial = searchParams.get('message') || '';
  const estProbleme = searchParams.get('type') === 'probleme';

  const [envoye, setEnvoye] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function gererSoumission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');

    const formData = new FormData(e.currentTarget);
    const donnees = {
      nom: formData.get('nom'),
      email: formData.get('email'),
      telephone: formData.get('telephone') || undefined,
      sujet: formData.get('sujet'),
      message: formData.get('message'),
      estProbleme,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });
      if (!res.ok) throw new Error();
      setEnvoye(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setErreur('Une erreur est survenue. Merci de réessayer.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (envoye) {
    return (
      <div className="contact-formulaire__succes">
        ✓ Votre message a bien été envoyé. Je vous répondrai dans les plus brefs délais !
      </div>
    );
  }

  return (
    <form onSubmit={gererSoumission} className="contact-formulaire">
      {estProbleme && (
        <p className="contact-formulaire__intro-probleme">
          Décrivez le problème rencontré avec votre commande. Merci de renseigner votre numéro de
          téléphone pour que je puisse vous recontacter rapidement.
        </p>
      )}

      <label>Nom</label>
      <input type="text" name="nom" placeholder="Votre nom" required />

      <label>E-mail</label>
      <input type="email" name="email" placeholder="Votre e-mail" required />

      <label>Téléphone{estProbleme ? '' : ' (optionnel)'}</label>
      <input type="tel" name="telephone" placeholder="06 12 34 56 78" required={estProbleme} />

      <label>Sujet</label>
      <input type="text" name="sujet" placeholder="Sujet de votre message" defaultValue={sujetInitial} required />

      <label>Votre message</label>
      <textarea name="message" placeholder="Votre message" rows={6} defaultValue={messageInitial} required />

      {erreur && <p className="contact-formulaire__erreur">{erreur}</p>}

      <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
        {envoiEnCours ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
}
