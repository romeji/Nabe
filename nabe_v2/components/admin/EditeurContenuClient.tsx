'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { ChampContenu } from '@/lib/registre-contenu';
import { ICONES_DISPONIBLES } from '@/lib/registre-contenu';
import EditeurRiche from './EditeurRiche';

export default function EditeurContenuClient({
  page,
  titrePage,
  champs,
  valeursInitiales,
}: {
  page: string;
  titrePage: string;
  champs: ChampContenu[];
  valeursInitiales: Record<string, string>;
}) {
  const [valeurs, setValeurs] = useState(valeursInitiales);
  const [enregistrementCle, setEnregistrementCle] = useState<string | null>(null);
  const [succesCle, setSuccesCle] = useState<string | null>(null);
  const [enregistrementTout, setEnregistrementTout] = useState(false);
  const [succesTout, setSuccesTout] = useState(false);
  const [uploadEnCoursCle, setUploadEnCoursCle] = useState<string | null>(null);
  const inputsFichier = useRef<Record<string, HTMLInputElement | null>>({});

  async function sauvegarderChamp(cle: string, type: string) {
    setEnregistrementCle(cle);
    setSuccesCle(null);
    try {
      const res = await fetch('/api/admin/contenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, cle, valeur: valeurs[cle], type }),
      });
      if (!res.ok) throw new Error();
      setSuccesCle(cle);
      setTimeout(() => setSuccesCle(null), 2000);
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setEnregistrementCle(null);
    }
  }

  async function sauvegarderTout() {
    setEnregistrementTout(true);
    setSuccesTout(false);
    try {
      await Promise.all(
        champs.map((champ: any) =>
          fetch('/api/admin/contenu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, cle: champ.cle, valeur: valeurs[champ.cle], type: champ.type }),
          })
        )
      );
      setSuccesTout(true);
      setTimeout(() => setSuccesTout(false), 2500);
    } catch {
      alert('Erreur lors de la sauvegarde de la page.');
    } finally {
      setEnregistrementTout(false);
    }
  }

  function reinitialiserChamp(champ: ChampContenu) {
    setValeurs((v) => ({ ...v, [champ.cle]: champ.defaut }));
  }

  async function televerserImage(cle: string, fichier: File) {
    setUploadEnCoursCle(cle);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const lecteur = new FileReader();
        lecteur.onload = () => resolve(lecteur.result as string);
        lecteur.onerror = reject;
        lecteur.readAsDataURL(fichier);
      });
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichier: base64 }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setValeurs((v) => ({ ...v, [cle]: url }));
    } catch {
      alert("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploadEnCoursCle(null);
    }
  }

  return (
    <div className="admin-carte editeur-contenu">
      <div className="editeur-contenu__entete">
        <h2>{titrePage}</h2>
        <button className="btn btn-primaire" onClick={sauvegarderTout} disabled={enregistrementTout}>
          {enregistrementTout ? 'Enregistrement...' : succesTout ? '✓ Page enregistrée' : 'Tout enregistrer'}
        </button>
      </div>

      {champs.map((champ: any) => {
        const valeurModifiee = valeurs[champ.cle] !== champ.defaut;
        return (
          <div key={champ.cle} className="editeur-contenu__champ">
            <div className="editeur-contenu__champ-entete">
              <label>{champ.label}</label>
              {valeurModifiee && (
                <button
                  type="button"
                  className="editeur-contenu__reinitialiser"
                  onClick={() => reinitialiserChamp(champ)}
                  title="Revenir au texte par défaut"
                >
                  ↺ Réinitialiser
                </button>
              )}
            </div>

            {champ.type === 'texte_long' ? (
              <EditeurRiche
                valeur={valeurs[champ.cle] ?? ''}
                onChange={(html) => setValeurs((v) => ({ ...v, [champ.cle]: html }))}
              />
            ) : champ.type === 'image' ? (
              <div className="editeur-contenu__champ-image">
                {valeurs[champ.cle] && (
                  <div className="editeur-contenu__apercu-image">
                    <Image src={valeurs[champ.cle]} alt="" width={160} height={110} style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <input
                  ref={(el) => { inputsFichier.current[champ.cle] = el; }}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const fichier = e.target.files?.[0];
                    if (fichier) televerserImage(champ.cle, fichier);
                  }}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => inputsFichier.current[champ.cle]?.click()}
                  disabled={uploadEnCoursCle === champ.cle}
                >
                  {uploadEnCoursCle === champ.cle ? 'Envoi en cours…' : 'Changer l\u2019image'}
                </button>
              </div>
            ) : champ.type === 'icone' ? (
              <select
                value={valeurs[champ.cle] ?? ''}
                onChange={(e) => setValeurs((v) => ({ ...v, [champ.cle]: e.target.value }))}
              >
                {ICONES_DISPONIBLES.map((icone) => (
                  <option key={icone} value={icone}>
                    {icone}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={valeurs[champ.cle] ?? ''}
                onChange={(e) => setValeurs((v) => ({ ...v, [champ.cle]: e.target.value }))}
              />
            )}

            <button
              className="admin-btn-icone"
              onClick={() => sauvegarderChamp(champ.cle, champ.type)}
              disabled={enregistrementCle === champ.cle}
            >
              {enregistrementCle === champ.cle
                ? 'Enregistrement...'
                : succesCle === champ.cle
                ? '✓ Enregistré'
                : 'Enregistrer ce champ'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
