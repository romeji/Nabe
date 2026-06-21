'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  statut: string;
  createdAt: string;
};

const LABELS_STATUT: Record<string, string> = {
  NOUVEAU: 'Nouveau',
  LU: 'Lu',
  REPONDU: 'Répondu',
  ARCHIVE: 'Archivé',
};

export default function MessageCarte({ message }: { message: Message }) {
  const router = useRouter();
  const [deplie, setDeplie] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function changerStatut(nouveauStatut: string) {
    setEnCours(true);
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setEnCours(false);
    }
  }

  function ouvrir() {
    setDeplie(!deplie);
    if (message.statut === 'NOUVEAU') changerStatut('LU');
  }

  return (
    <div className="message-carte">
      <div className="message-carte__entete" onClick={ouvrir}>
        <div>
          <strong>{message.sujet}</strong>
          <span className="message-carte__meta">
            {message.nom} — {new Date(message.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <span className={`admin-badge ${message.statut === 'NOUVEAU' ? 'admin-badge--attente' : 'admin-badge--neutre'}`}>
          {LABELS_STATUT[message.statut]}
        </span>
      </div>

      {deplie && (
        <div className="message-carte__corps">
          <p className="message-carte__email">{message.email}</p>
          <p>{message.message}</p>
          <div className="message-carte__actions">
            <a href={`mailto:${message.email}?subject=Re: ${message.sujet}`} className="btn btn-primaire">
              Répondre par email
            </a>
            <button
              className="admin-btn-icone"
              onClick={() => changerStatut('ARCHIVE')}
              disabled={enCours}
            >
              Archiver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
