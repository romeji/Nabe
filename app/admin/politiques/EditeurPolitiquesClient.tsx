'use client';
import { useState } from 'react';
import EditeurRiche from '@/components/admin/EditeurRiche';

type Politique = { cle: string; titre: string; contenu: string; ordre: number };

const SECTIONS = [
  { id: 'contact',   label: '📞 Contact' },
  { id: 'entretien', label: '✨ Entretien & Services' },
  { id: 'livraison', label: '📦 Livraison & Paiement' },
];

export default function EditeurPolitiquesClient({ politiques }: { politiques: Politique[] }) {
  const [section, setSection] = useState('contact');
  const [items, setItems] = useState<Politique[]>(politiques);
  const [sauvegarde, setSauvegarde] = useState<Record<string, string>>({});

  const itemsSection = items.filter((i: any) => i.cle.startsWith(section));

  function modifierItem(cle: string, champ: 'titre' | 'contenu', valeur: string) {
    setItems(prev => prev.map((i: any) => i.cle === cle ? { ...i, [champ]: valeur } : i));
  }

  async function sauvegarderSection() {
    setSauvegarde(prev => ({ ...prev, [section]: 'saving' }));
    try {
      await fetch('/api/admin/politiques', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsSection),
      });
      setSauvegarde(prev => ({ ...prev, [section]: 'ok' }));
      setTimeout(() => setSauvegarde(prev => ({ ...prev, [section]: '' })), 2000);
    } catch {
      setSauvegarde(prev => ({ ...prev, [section]: 'error' }));
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__entete">
        <h1>Configuration Popups de la fiche produit</h1>
        <p className="admin-page__sous-titre">
          Ces textes apparaissent dans les popups de la fiche produit (Contact, Entretien, Livraison). Mise en forme,
          couleurs et images sont disponibles dans l'éditeur ci-dessous.
        </p>
      </div>

      {/* Onglets de section */}
      <div className="politiques-onglets">
        {SECTIONS.map((s: any) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`politiques-onglet${section === s.id ? ' politiques-onglet--actif' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Éditeur des items de la section */}
      <div className="politiques-items">
        {itemsSection.map((item: any) => (
          <div key={item.cle} className="politiques-item">
            <div className="politiques-item__cle">Clé : <code>{item.cle}</code></div>
            <div className="admin-form__groupe">
              <label className="admin-form__label">Titre affiché dans la popup</label>
              <input
                className="admin-form__input"
                value={item.titre}
                onChange={e => modifierItem(item.cle, 'titre', e.target.value)}
              />
            </div>
            <div className="admin-form__groupe">
              <label className="admin-form__label">Contenu</label>
              <EditeurRiche
                valeur={item.contenu}
                onChange={(html) => modifierItem(item.cle, 'contenu', html)}
                placeholder="Rédigez le contenu de cette section..."
              />
            </div>
          </div>
        ))}
      </div>

      <div className="politiques-actions">
        <button
          className="admin-btn admin-btn--primaire"
          onClick={sauvegarderSection}
          disabled={sauvegarde[section] === 'saving'}
        >
          {sauvegarde[section] === 'saving' ? 'Sauvegarde...' :
           sauvegarde[section] === 'ok' ? '✓ Sauvegardé' : 'Enregistrer cette section'}
        </button>
      </div>

      <style>{`
        .politiques-onglets { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--nabe-or-clair); padding-bottom: 1rem; }
        .politiques-onglet { padding: 0.5rem 1.2rem; border: 1px solid var(--nabe-or-clair); border-radius: 999px; background: transparent; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .politiques-onglet--actif { background: var(--nabe-terracotta); color: white; border-color: var(--nabe-terracotta); }
        .politiques-item { background: var(--nabe-sable); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .politiques-item__cle { font-size: 0.75rem; color: var(--nabe-pierre); margin-bottom: 1rem; }
        .politiques-items { margin-bottom: 2rem; }
        .politiques-actions { display: flex; justify-content: flex-end; }
      `}</style>
    </div>
  );
}
