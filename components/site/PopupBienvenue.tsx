'use client';

import { useState, useEffect } from 'react';
import './popup-bienvenue.css';

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
    const dejaVue = typeof window !== 'undefined' && sessionStorage.getItem(CLE_STOCKAGE);
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
    if (typeof window !== 'undefined') sessionStorage.setItem(CLE_STOCKAGE, '1');
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
          ✕
        </button>

        {codeRecu ? (
          <div className="popup-bienvenue__succes">
            <h2>Merci {prenom} ! 🎁</h2>
            <p>Votre code de réduction de {config.pourcentage}% vient de vous être envoyé par e-mail :</p>
            <div className="popup-bienvenue__code">{codeRecu}</div>
            <button className="btn btn-primaire" onClick={fermer}>
              Découvrir la boutique
            </button>
          </div>
        ) : (
          <>
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
              <button type="submit" className="btn btn-or" disabled={envoiEnCours}>
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
  );
}
