'use client';

import { useState, useEffect } from 'react';
import './gestion-adresses.css';

type Adresse = {
  id: string;
  libelle: string | null;
  destinataire: string;
  ligne1: string;
  ligne2: string | null;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string | null;
  parDefaut: boolean;
};

const ADRESSE_VIDE = {
  libelle: '',
  destinataire: '',
  ligne1: '',
  ligne2: '',
  ville: '',
  codePostal: '',
  pays: 'France',
  telephone: '',
  parDefaut: false,
};

export default function GestionAdressesClient() {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [chargement, setChargement] = useState(true);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [edition, setEdition] = useState<string | null>(null);
  const [formData, setFormData] = useState(ADRESSE_VIDE);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  function chargerAdresses() {
    fetch('/api/mon-compte/adresses')
      .then((res) => res.json())
      .then(setAdresses)
      .catch(() => setAdresses([]))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerAdresses();
  }, []);

  function ouvrirNouveau() {
    setFormData(ADRESSE_VIDE);
    setEdition(null);
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(a: Adresse) {
    setFormData({
      libelle: a.libelle || '',
      destinataire: a.destinataire,
      ligne1: a.ligne1,
      ligne2: a.ligne2 || '',
      ville: a.ville,
      codePostal: a.codePostal,
      pays: a.pays,
      telephone: a.telephone || '',
      parDefaut: a.parDefaut,
    });
    setEdition(a.id);
    setFormulaireOuvert(true);
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur('');
    try {
      const url = edition ? `/api/mon-compte/adresses/${edition}` : '/api/mon-compte/adresses';
      const methode = edition ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setFormulaireOuvert(false);
      chargerAdresses();
    } catch (err: any) {
      setErreur(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function supprimer(id: string) {
    if (!confirm('Supprimer cette adresse ?')) return;
    try {
      const res = await fetch(`/api/mon-compte/adresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      chargerAdresses();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  }

  async function definirParDefaut(id: string) {
    try {
      const res = await fetch(`/api/mon-compte/adresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parDefaut: true }),
      });
      if (!res.ok) throw new Error();
      chargerAdresses();
    } catch {
      alert('Erreur.');
    }
  }

  if (chargement) return <p className="gestion-adresses__chargement">Chargement...</p>;

  return (
    <div className="gestion-adresses">
      {!formulaireOuvert && (
        <button className="btn btn-primaire gestion-adresses__ajouter" onClick={ouvrirNouveau}>
          + Ajouter une adresse
        </button>
      )}

      {formulaireOuvert && (
        <form onSubmit={gererSoumission} className="gestion-adresses__formulaire">
          <div className="admin-form__ligne">
            <div>
              <label>Libellé (optionnel)</label>
              <input
                type="text"
                placeholder="Ex : Domicile, Travail..."
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              />
            </div>
            <div>
              <label>Destinataire</label>
              <input
                type="text"
                value={formData.destinataire}
                onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
                required
              />
            </div>
          </div>

          <label>Adresse</label>
          <input
            type="text"
            value={formData.ligne1}
            onChange={(e) => setFormData({ ...formData, ligne1: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Complément (optionnel)"
            value={formData.ligne2}
            onChange={(e) => setFormData({ ...formData, ligne2: e.target.value })}
          />

          <div className="admin-form__ligne">
            <div>
              <label>Code postal</label>
              <input
                type="text"
                value={formData.codePostal}
                onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Ville</label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="admin-form__ligne">
            <div>
              <label>Pays</label>
              <input
                type="text"
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
              />
            </div>
            <div>
              <label>Téléphone (optionnel)</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>
          </div>

          <label className="gestion-adresses__case">
            <input
              type="checkbox"
              checked={formData.parDefaut}
              onChange={(e) => setFormData({ ...formData, parDefaut: e.target.checked })}
            />
            Définir comme adresse par défaut
          </label>

          {erreur && <p className="gestion-adresses__erreur">{erreur}</p>}

          <div className="gestion-adresses__actions-form">
            <button type="submit" className="btn btn-primaire" disabled={envoiEnCours}>
              {envoiEnCours ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" className="admin-btn-icone" onClick={() => setFormulaireOuvert(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {adresses.length === 0 && !formulaireOuvert && (
        <p className="gestion-adresses__vide">Vous n'avez pas encore d'adresse enregistrée.</p>
      )}

      <div className="gestion-adresses__liste">
        {adresses.map((a) => (
          <div key={a.id} className="gestion-adresses__carte">
            {a.parDefaut && <span className="gestion-adresses__badge">Par défaut</span>}
            {a.libelle && <strong>{a.libelle}</strong>}
            <p>{a.destinataire}</p>
            <p>
              {a.ligne1}
              {a.ligne2 && <>, {a.ligne2}</>}
            </p>
            <p>
              {a.codePostal} {a.ville}, {a.pays}
            </p>
            {a.telephone && <p>{a.telephone}</p>}
            <div className="gestion-adresses__actions">
              <button onClick={() => ouvrirEdition(a)}>Modifier</button>
              {!a.parDefaut && <button onClick={() => definirParDefaut(a.id)}>Définir par défaut</button>}
              <button onClick={() => supprimer(a.id)} className="gestion-adresses__supprimer">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
