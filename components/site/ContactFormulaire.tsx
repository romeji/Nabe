'use client';

import { useState } from 'react';

export default function ContactFormulaire() {
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
      sujet: formData.get('sujet'),
      message: formData.get('message'),
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
      <label>Nom</label>
      <input type="text" name="nom" placeholder="Votre nom" required />

      <label>E-mail</label>
      <input type="email" name="email" placeholder="Votre e-mail" required />

      <label>Sujet</label>
      <input type="text" name="sujet" placeholder="Sujet de votre message" required />

      <label>Votre message</label>
      <textarea name="message" placeholder="Votre message" rows={6} required />

      {erreur && <p className="contact-formulaire__erreur">{erreur}</p>}

      <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
        {envoiEnCours ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
}
