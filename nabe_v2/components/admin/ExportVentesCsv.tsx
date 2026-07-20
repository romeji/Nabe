'use client';

import { useState } from 'react';

/**
 * Raccourcis pratiques pour les périodes comptables les plus demandées en
 * cas de contrôle : le mois en cours, l'année civile en cours, ou une
 * période personnalisée.
 */
function premierJourMoisCourant() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function premierJourAnneeCourante() {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10);
}
function aujourdHui() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExportVentesCsv() {
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [ouvert, setOuvert] = useState(false);

  function telecharger(debutParam?: string, finParam?: string) {
    const params = new URLSearchParams();
    if (debutParam) params.set('debut', debutParam);
    if (finParam) params.set('fin', finParam);
    window.open(`/api/admin/commandes/export?${params.toString()}`, '_blank');
  }

  return (
    <div className="export-ventes-csv">
      <button type="button" className="btn" onClick={() => setOuvert((v) => !v)}>
        📄 Historique des ventes (pour contrôle / comptabilité)
      </button>

      {ouvert && (
        <div className="export-ventes-csv__panneau">
          <div className="export-ventes-csv__raccourcis">
            <button type="button" className="btn" onClick={() => telecharger(premierJourMoisCourant(), aujourdHui())}>
              Mois en cours
            </button>
            <button type="button" className="btn" onClick={() => telecharger(premierJourAnneeCourante(), aujourdHui())}>
              Année en cours
            </button>
            <button type="button" className="btn" onClick={() => telecharger()}>
              Tout l&apos;historique
            </button>
          </div>

          <div className="export-ventes-csv__periode">
            <label>
              Du
              <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} />
            </label>
            <label>
              Au
              <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
            </label>
            <button
              type="button"
              className="btn btn-primaire"
              disabled={!debut || !fin}
              onClick={() => telecharger(debut, fin)}
            >
              Télécharger cette période
            </button>
          </div>

          <p className="export-ventes-csv__aide">
            Fichier CSV (compatible Excel) listant chaque vente encaissée avec date, numéro de commande,
            client, articles, mode de règlement et montants — le format standard d&apos;un livre des
            recettes pour un contrôle URSSAF ou fiscal.
          </p>
        </div>
      )}
    </div>
  );
}
