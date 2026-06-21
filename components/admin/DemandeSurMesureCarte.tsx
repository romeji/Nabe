'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Demande = {
  id: string;
  modeleSelectionne: string | null;
  tailleSouhaitee: string | null;
  matiere: string | null;
  pierre: string | null;
  gravure: string | null;
  message: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: string;
  notesAdmin: string | null;
  createdAt: string;
};

const LABELS_STATUT: Record<string, string> = {
  NOUVELLE: 'Nouvelle',
  EN_DISCUSSION: 'En discussion',
  DEVIS_ENVOYE: 'Devis envoyé',
  ACCEPTEE: 'Acceptée',
  EN_FABRICATION: 'En fabrication',
  TERMINEE: 'Terminée',
  REFUSEE: 'Refusée',
};

export default function DemandeSurMesureCarte({ demande }: { demande: Demande }) {
  const router = useRouter();
  const [statut, setStatut] = useState(demande.statut);
  const [notes, setNotes] = useState(demande.notesAdmin || '');
  const [enregistrement, setEnregistrement] = useState(false);
  const [deplie, setDeplie] = useState(false);

  async function sauvegarder() {
    setEnregistrement(true);
    try {
      const res = await fetch(`/api/admin/sur-mesure/${demande.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut, notesAdmin: notes }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="demande-sm-carte">
      <div className="demande-sm-carte__entete" onClick={() => setDeplie(!deplie)}>
        <div>
          <strong>{demande.nom}</strong> — {demande.modeleSelectionne || 'Modèle non précisé'}
          <span className="demande-sm-carte__date">
            {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <span className={`admin-badge admin-badge--${demande.statut === 'NOUVELLE' ? 'attente' : 'neutre'}`}>
          {LABELS_STATUT[demande.statut]}
        </span>
      </div>

      {deplie && (
        <div className="demande-sm-carte__details">
          <div className="demande-sm-carte__infos">
            <p>
              <strong>Email :</strong> {demande.email}
            </p>
            {demande.telephone && (
              <p>
                <strong>Téléphone :</strong> {demande.telephone}
              </p>
            )}
            {demande.tailleSouhaitee && (
              <p>
                <strong>Taille :</strong> {demande.tailleSouhaitee}
              </p>
            )}
            {demande.matiere && (
              <p>
                <strong>Matière :</strong> {demande.matiere}
              </p>
            )}
            {demande.pierre && (
              <p>
                <strong>Pierre :</strong> {demande.pierre}
              </p>
            )}
            {demande.gravure && (
              <p>
                <strong>Gravure :</strong> {demande.gravure}
              </p>
            )}
            <p>
              <strong>Message :</strong> {demande.message}
            </p>
          </div>

          <div className="demande-sm-carte__gestion">
            <label>Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value)}>
              {Object.entries(LABELS_STATUT).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>

            <label>Notes internes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes privées sur cette demande..."
            />

            <button className="btn btn-primaire" onClick={sauvegarder} disabled={enregistrement}>
              {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
