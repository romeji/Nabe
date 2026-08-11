'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import './popup-bienvenue.css';

// localStorage (et non sessionStorage) : une fois fermée, la popup ne
// revient plus jamais pour ce visiteur, même après un rechargement complet
// ou une nouvelle visite quelques jours plus tard — jusqu'à ce qu'il vide
// son cache navigateur.
const CLE_STOCKAGE = 'nabe_popup_bienvenue_vue';

export default function PopupBienvenue() {
  const [config, setConfig] = useState<{ actif: boolean; titre: string; texte: string; pourcentage: string } | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [codeRecu, setCodeRecu] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const dejaVue = typeof window !== 'undefined' && localStorage.getItem(CLE_STOCKAGE);
    if (dejaVue) return;

    fetch('/api/config-public')
      .then((res) => res.json())
      .then((data) => {
        if (data.popup_bienvenue_actif === 'true') {
          setConfig({
            actif: true,
            titre: data.popup_bienvenue_titre,
            texte: data.popup_bienvenue_texte,
            pourcentage: data.popup_bienvenue_pourcentage,
          });
          setTimeout(() => setOuvert(true), 1200);
        }
      })
      .catch(() => {});
  }, []);

  function fermer() {
    setOuvert(false);
    if (typeof window !== 'undefined') localStorage.setItem(CLE_STOCKAGE, '1');
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const res = await fetch('/api/popup-bienvenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setCodeRecu(data.code);
    } catch (err: any) {
      setErreur(err.message || 'Une erreur est survenue.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (!config?.actif || !ouvert) return null;

  return (
    <div className="popup-bienvenue__overlay" onClick={fermer}>
      <div className="popup-bienvenue__modal" onClick={(e) => e.stopPropagation()}>
        <button className="popup-bienvenue__fermer" onClick={fermer} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="popup-bienvenue__visuel" aria-hidden="true">
          <Image
            src="/images/main-bague.jpg"
            alt=""
            fill
            sizes="(max-width: 700px) 100vw, 340px"
            className="popup-bienvenue__photo"
          />
          <span className="popup-bienvenue__ruban">
            {config.pourcentage ? `-${config.pourcentage}%` : 'Bienvenue'}
          </span>
        </div>

        <div className="popup-bienvenue__contenu">
          {codeRecu ? (
            <div className="popup-bienvenue__succes">
              <span className="popup-bienvenue__eyebrow">Merci {prenom} !</span>
              <h2>Votre surprise vous attend 🎁</h2>
              <p>Votre code de réduction de {config.pourcentage}% vient de vous être envoyé par e-mail :</p>
              <div className="popup-bienvenue__code">{codeRecu}</div>
              <button className="btn btn-primaire" onClick={fermer}>
                Découvrir la boutique
              </button>
            </div>
          ) : (
            <>
              <span className="popup-bienvenue__eyebrow">Façonné à la main</span>
              <h2>{config.titre}</h2>
              <p>{config.texte}</p>
              <form onSubmit={gererSoumission}>
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Votre e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {erreur && <p className="popup-bienvenue__erreur">{erreur}</p>}
                <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
                  {envoiEnCours ? 'Envoi...' : 'Je veux ma surprise'}
                </button>
              </form>
              <button className="popup-bienvenue__plus-tard" onClick={fermer}>
                Non merci, plus tard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
