'use client';

import { useState } from 'react';
import FormulairePierre from './FormulairePierre';
import LignePierre from './LignePierre';
import FormulaireCouleurPierre from './FormulaireCouleurPierre';
import LigneCouleurPierre from './LigneCouleurPierre';

type CouleurOption = { id: string; nom: string; codeHex: string; _count?: { pierres: number } };
type PierreLigne = {
  id: string;
  nom: string;
  description: string | null;
  couleurs: { couleurPierre: CouleurOption }[];
  _count: { produits: number };
};

export default function PierresEtCouleursClient({
  pierres,
  couleurs,
}: {
  pierres: PierreLigne[];
  couleurs: CouleurOption[];
}) {
  const [onglet, setOnglet] = useState<'pierres' | 'couleurs'>('pierres');

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Pierres & Couleurs</h1>
        <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Gérez vos pierres précieuses et les couleurs qui leur sont associées, au même endroit.
        </p>
      </div>

      <div className="pierres-couleurs-onglets">
        <button
          className={`pierres-couleurs-onglet${onglet === 'pierres' ? ' pierres-couleurs-onglet--actif' : ''}`}
          onClick={() => setOnglet('pierres')}
        >
          💎 Pierres ({pierres.length})
        </button>
        <button
          className={`pierres-couleurs-onglet${onglet === 'couleurs' ? ' pierres-couleurs-onglet--actif' : ''}`}
          onClick={() => setOnglet('couleurs')}
        >
          🎨 Couleurs ({couleurs.length})
        </button>
      </div>

      {onglet === 'pierres' ? (
        <>
          <div className="admin-categories__grille">
            <div className="admin-table-scroll"><table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Couleurs</th>
                  <th>Bijoux associés</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pierres.map((p) => (
                  <LignePierre key={p.id} pierre={p} couleurs={couleurs} />
                ))}
              </tbody>
            </table></div>

            <FormulairePierre couleurs={couleurs} />
          </div>

          {pierres.length === 0 && (
            <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
              Aucune pierre pour le moment. Créez vos premières pierres (Diamant, Émeraude, Onyx...).
            </p>
          )}
        </>
      ) : (
        <>
          <div className="admin-categories__grille">
            <div className="admin-table-scroll"><table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nom</th>
                  <th>Pierres associées</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {couleurs.map((c) => (
                  <LigneCouleurPierre key={c.id} couleur={c as any} />
                ))}
              </tbody>
            </table></div>

            <FormulaireCouleurPierre />
          </div>

          {couleurs.length === 0 && (
            <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
              Aucune couleur de pierre pour le moment. Ces couleurs alimentent le filtre "Couleur"
              sur la page Collections et peuvent être associées à vos pierres dans l'onglet "Pierres".
            </p>
          )}
        </>
      )}

      <style>{`
        .pierres-couleurs-onglets {
          display: flex;
          gap: 0.5rem;
          margin: 1.5rem 0;
          border-bottom: 1px solid var(--nabe-or-clair, #e0d5c0);
          padding-bottom: 1rem;
        }
        .pierres-couleurs-onglet {
          padding: 0.5rem 1.2rem;
          border: 1px solid var(--nabe-or-clair, #e0d5c0);
          border-radius: 999px;
          background: transparent;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .pierres-couleurs-onglet--actif {
          background: var(--nabe-terracotta, #9f5434);
          color: white;
          border-color: var(--nabe-terracotta, #9f5434);
        }
      `}</style>
    </div>
  );
}
