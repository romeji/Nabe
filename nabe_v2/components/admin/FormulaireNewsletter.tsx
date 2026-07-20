'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditeurRiche from './EditeurRiche';
import './formulaire-newsletter.css';

type NewsletterInitiale = {
  id?: string;
  sujet?: string;
  contenu?: string;
  statut?: string;
  nombreDestinataires?: number;
  envoyeeLe?: string | null;
};

export default function FormulaireNewsletter({
  newsletterInitiale,
  nombreAbonnes,
}: {
  newsletterInitiale?: NewsletterInitiale;
  nombreAbonnes: number;
}) {
  const router = useRouter();
  const [sujet, setSujet] = useState(newsletterInitiale?.sujet || '');
  const [contenu, setContenu] = useState(newsletterInitiale?.contenu || '');
  const [codeParrainage, setCodeParrainage] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [confirmationEnvoi, setConfirmationEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const dejaEnvoyee = newsletterInitiale?.statut === 'ENVOYEE';

  async function sauvegarder(): Promise<string | null> {
    if (!sujet.trim() || !contenu.trim()) {
      setErreur('Le sujet et le contenu sont obligatoires.');
      return null;
    }
    setEnregistrement(true);
    setErreur('');
    try {
      const url = newsletterInitiale?.id ? `/api/admin/newsletters/${newsletterInitiale.id}` : '/api/admin/newsletters';
      const methode = newsletterInitiale?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sujet, contenu }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }
      const data = await res.json();
      setSucces('Brouillon enregistré.');
      setTimeout(() => setSucces(''), 2000);
      return data.id;
    } catch (err: any) {
      setErreur(err.message);
      return null;
    } finally {
      setEnregistrement(false);
    }
  }

  async function gererSauvegarde() {
    const id = await sauvegarder();
    if (id && !newsletterInitiale?.id) {
      router.push(`/admin/newsletters/${id}`);
    } else {
      router.refresh();
    }
  }

  async function gererEnvoi() {
    setEnvoiEnCours(true);
    setErreur('');
    try {
      // On sauvegarde d'abord les dernières modifications
      const id = newsletterInitiale?.id || (await sauvegarder());
      if (!id) {
        setEnvoiEnCours(false);
        return;
      }

      const res = await fetch(`/api/admin/newsletters/${id}/envoyer`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      router.push('/admin/newsletters');
      router.refresh();
    } catch (err: any) {
      setErreur(err.message);
      setConfirmationEnvoi(false);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="formulaire-newsletter">
      <div className="formulaire-newsletter__edition admin-carte">
        <label>Sujet de l'email</label>
        <input
          type="text"
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          placeholder="Ex : Nos nouveautés du mois sont arrivées ✨"
          disabled={dejaEnvoyee}
        />

        <label>Contenu</label>
        {!dejaEnvoyee && (
          <div className="formulaire-newsletter__parrainage">
            <input
              type="text"
              value={codeParrainage}
              onChange={(e) => setCodeParrainage(e.target.value.toUpperCase())}
              placeholder="Ex : BIENVENUE10"
            />
            <button
              type="button"
              className="btn"
              disabled={!codeParrainage.trim()}
              onClick={() => {
                const bloc = `<div style="text-align:center; margin:20px 0;"><p style="font-size:13px; color:#7a6a55; margin:0 0 6px;">Votre code de parrainage</p><p style="font-size:22px; letter-spacing:2px; background-color:#ede3d3; padding:12px; border-radius:4px; color:#8b4a32; font-weight:bold; display:inline-block;">${codeParrainage.trim()}</p></div>`;
                setContenu((c) => c + bloc);
              }}
            >
              + Insérer ce code dans le message
            </button>
            <p className="formulaire-newsletter__aide-parrainage">
              Créez d'abord le code dans Admin → Codes promo, puis collez-le ici pour l'ajouter en évidence dans l'email.
            </p>
          </div>
        )}
        {!dejaEnvoyee ? (
          <EditeurRiche
            valeur={contenu}
            onChange={setContenu}
            placeholder="Bonjour, découvrez nos nouvelles créations..."
          />
        ) : (
          <div className="formulaire-newsletter__contenu-figé" dangerouslySetInnerHTML={{ __html: contenu }} />
        )}
        <p className="formulaire-newsletter__aide">
          Utilisez la barre d'outils pour mettre en gras, en couleur, ajouter des liens ou des listes.
        </p>

        {erreur && <p className="formulaire-newsletter__erreur">{erreur}</p>}
        {succes && <p className="formulaire-newsletter__succes">{succes}</p>}

        {!dejaEnvoyee && (
          <div className="formulaire-newsletter__actions">
            <button className="admin-btn-icone" onClick={gererSauvegarde} disabled={enregistrement}>
              {enregistrement ? 'Enregistrement...' : 'Enregistrer le brouillon'}
            </button>

            {!confirmationEnvoi ? (
              <button
                className="btn btn-primaire"
                onClick={() => setConfirmationEnvoi(true)}
                disabled={nombreAbonnes === 0}
              >
                Envoyer à {nombreAbonnes} {nombreAbonnes === 1 ? 'abonné' : 'abonnés'}
              </button>
            ) : (
              <div className="formulaire-newsletter__confirmation">
                <span>
                  Confirmer l'envoi définitif à <strong>{nombreAbonnes}</strong>{' '}
                  {nombreAbonnes === 1 ? 'personne' : 'personnes'} ? Cette action est irréversible.
                </span>
                <div>
                  <button className="btn btn-primaire" onClick={gererEnvoi} disabled={envoiEnCours}>
                    {envoiEnCours ? 'Envoi en cours...' : 'Oui, envoyer maintenant'}
                  </button>
                  <button className="admin-btn-icone" onClick={() => setConfirmationEnvoi(false)} disabled={envoiEnCours}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {nombreAbonnes === 0 && !dejaEnvoyee && (
          <p className="formulaire-newsletter__avertissement">
            Aucun abonné pour le moment — l'envoi est désactivé. Les visiteurs peuvent s'inscrire
            depuis le formulaire en bas de la page d'accueil.
          </p>
        )}

        {dejaEnvoyee && (
          <p className="formulaire-newsletter__info-envoyee">
            ✓ Cette newsletter a été envoyée à {newsletterInitiale?.nombreDestinataires} destinataires
            {newsletterInitiale?.envoyeeLe &&
              ` le ${new Date(newsletterInitiale.envoyeeLe).toLocaleDateString('fr-FR')}`}
            . Elle ne peut plus être modifiée.
          </p>
        )}
      </div>

      <div className="formulaire-newsletter__apercu">
        <h3>Aperçu</h3>
        <div className="formulaire-newsletter__apercu-carte">
          <div className="formulaire-newsletter__apercu-entete">Nabe</div>
          <div className="formulaire-newsletter__apercu-corps">
            <h4>{sujet || 'Sujet de votre newsletter'}</h4>
            <div
              dangerouslySetInnerHTML={{
                __html: contenu || '<p>Le contenu de votre newsletter apparaîtra ici...</p>',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
