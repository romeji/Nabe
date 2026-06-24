'use client';

import { useState } from 'react';

type OptionSimple = { id: string; nom: string };

export default function ReglagesClient({
  configInitiale,
  collections,
  categories,
}: {
  configInitiale: Record<string, string>;
  collections: OptionSimple[];
  categories: OptionSimple[];
}) {
  const [config, setConfig] = useState(configInitiale);
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);

  const categoriesSelectionnees = (config.categories_accueil_ids || '').split(',').filter(Boolean);

  function maj(cle: string, valeur: string) {
    setConfig((c) => ({ ...c, [cle]: valeur }));
  }

  function basculerCategorie(id: string) {
    const actuelles = new Set(categoriesSelectionnees);
    if (actuelles.has(id)) {
      actuelles.delete(id);
    } else {
      if (actuelles.size >= 4) {
        alert('Vous pouvez sélectionner 4 catégories maximum.');
        return;
      }
      actuelles.add(id);
    }
    maj('categories_accueil_ids', Array.from(actuelles).join(','));
  }

  async function sauvegarder() {
    setEnregistrement(true);
    setSucces(false);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      setSucces(true);
      setTimeout(() => setSucces(false), 2500);
    } catch {
      alert('Erreur lors de la sauvegarde des réglages.');
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="reglages-client">
      <div className="admin-carte reglages-client__section">
        <h2>Page d'accueil — Carrousels</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.carrousel_selection_actif === 'true'}
            onChange={(e) => maj('carrousel_selection_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Carrousel "Articles sélectionnés"</strong>
            <p>Affiche en carrousel les bijoux marqués "en avant" depuis Admin &gt; Bijoux.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.carrousel_bestseller_actif === 'true'}
            onChange={(e) => maj('carrousel_bestseller_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Carrousel "Meilleures ventes"</strong>
            <p>S'affiche au-dessus de la section "Pièce signature". Basé sur le nombre de ventes réelles.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.carrousel_nouvelle_collection_actif === 'true'}
            onChange={(e) => maj('carrousel_nouvelle_collection_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Carrousel "Nouvelle collection"</strong>
            <p>S'affiche au-dessus de la section "Notre histoire".</p>
          </div>
        </label>

        {config.carrousel_nouvelle_collection_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Collection à mettre en avant</label>
            <select
              value={config.carrousel_nouvelle_collection_id}
              onChange={(e) => maj('carrousel_nouvelle_collection_id', e.target.value)}
            >
              <option value="">Sélectionner une collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            {collections.length === 0 && (
              <p className="formulaire-produit__aide">
                Aucune collection active. Créez-en une depuis <a href="/admin/collections">Admin &gt; Collections</a>.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Page d'accueil — Catégories en avant</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.categories_accueil_actif === 'true'}
            onChange={(e) => maj('categories_accueil_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher un bloc Catégories sur l'accueil</strong>
            <p>S'affiche juste en dessous du bandeau principal (hero).</p>
          </div>
        </label>

        {config.categories_accueil_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Catégories à mettre en avant (4 maximum)</label>
            <div className="reglages-client__categories">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`reglages-client__categorie-bouton ${categoriesSelectionnees.includes(c.id) ? 'actif' : ''}`}
                  onClick={() => basculerCategorie(c.id)}
                >
                  {c.nom}
                </button>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="formulaire-produit__aide">
                Aucune catégorie créée. Ajoutez-en depuis <a href="/admin/categories">Admin &gt; Catégories</a>.
              </p>
            )}
            <p className="formulaire-produit__aide">{categoriesSelectionnees.length} / 4 sélectionnée(s)</p>
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Page produit — Suggestions</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.suggestions_produit_actif === 'true'}
            onChange={(e) => maj('suggestions_produit_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher "Vous aimerez aussi" en bas des fiches produit</strong>
            <p>4 bijoux suggérés selon le critère choisi ci-dessous.</p>
          </div>
        </label>

        {config.suggestions_produit_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Critère de sélection</label>
            <select
              value={config.suggestions_produit_critere}
              onChange={(e) => maj('suggestions_produit_critere', e.target.value)}
            >
              <option value="meme_type">Même type de bijou (par défaut)</option>
              <option value="nouvelle_collection">Bijoux de la même collection / nouveautés</option>
              <option value="moins_bonnes_ventes">Mettre en avant les moins bonnes ventes</option>
            </select>
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Popups</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_panier_vide_actif === 'true'}
            onChange={(e) => maj('popup_panier_vide_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Popup "Panier vide"</strong>
            <p>S'affiche quand le client ouvre un panier vide, avec les meilleures ventes en suggestion.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_bienvenue_actif === 'true'}
            onChange={(e) => maj('popup_bienvenue_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Popup de bienvenue (prénom + e-mail → code promo)</strong>
            <p>S'affiche à l'arrivée sur le site pour les nouveaux visiteurs.</p>
          </div>
        </label>

        {config.popup_bienvenue_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Titre de la popup</label>
            <input
              type="text"
              value={config.popup_bienvenue_titre}
              onChange={(e) => maj('popup_bienvenue_titre', e.target.value)}
            />
            <label>Texte de la popup</label>
            <textarea
              value={config.popup_bienvenue_texte}
              onChange={(e) => maj('popup_bienvenue_texte', e.target.value)}
              rows={2}
            />
            <label>Pourcentage de réduction offert</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.popup_bienvenue_pourcentage}
              onChange={(e) => maj('popup_bienvenue_pourcentage', e.target.value)}
            />
            <p className="formulaire-produit__aide">
              Un code de réduction à usage unique sera généré et envoyé par e-mail à chaque inscription.
            </p>
          </div>
        )}
      </div>

      <div className="reglages-client__actions">
        <button className="btn btn-primaire" onClick={sauvegarder} disabled={enregistrement}>
          {enregistrement ? 'Enregistrement...' : succes ? '✓ Réglages enregistrés' : 'Enregistrer les réglages'}
        </button>
      </div>
    </div>
  );
}
