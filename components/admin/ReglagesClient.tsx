'use client';

import { useState } from 'react';

type OptionSimple = { id: string; nom: string };
type OptionProduit = { id: string; nom: string; prix: string };

export default function ReglagesClient({
  configInitiale,
  collections,
  categories,
  produits,
}: {
  configInitiale: Record<string, string>;
  collections: OptionSimple[];
  categories: OptionSimple[];
  produits: OptionProduit[];
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
        <h2>Page produit — Présentation</h2>
        <label>Position des vignettes de la galerie</label>
        <select
          value={config.galerie_produit_position}
          onChange={(e) => maj('galerie_produit_position', e.target.value)}
        >
          <option value="gauche">À gauche de l'image (classique)</option>
          <option value="bas">Sous l'image (plus aéré)</option>
        </select>
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
        <h2>Panier — Boîte cadeau</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.boite_cadeau_actif === 'true'}
            onChange={(e) => maj('boite_cadeau_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Proposer une boîte cadeau dans le panier</strong>
            <p>Affichée comme article optionnel dans la popup panier, en plus des bijoux.</p>
          </div>
        </label>

        {config.boite_cadeau_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Article à utiliser comme boîte cadeau</label>
            {produits.length === 0 ? (
              <p className="formulaire-produit__aide">
                Aucun bijou créé pour le moment. Créez d'abord un article "Boîte cadeau" depuis{' '}
                <a href="/admin/produits/nouveau">Admin &gt; Bijoux &gt; Nouveau</a>, puis revenez ici pour le sélectionner.
              </p>
            ) : (
              <select
                value={config.boite_cadeau_produit_id}
                onChange={(e) => maj('boite_cadeau_produit_id', e.target.value)}
              >
                <option value="">— Choisir un article —</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} — {parseFloat(p.prix).toFixed(2)} €
                  </option>
                ))}
              </select>
            )}
            <p className="formulaire-produit__aide">
              Astuce : créez un bijou dédié (ex. "Boîte cadeau Nabe", prix 3,90 €) dans le backoffice, marquez-le inactif
              sur le catalogue si vous ne voulez pas qu'il apparaisse comme un bijou normal, puis sélectionnez-le ici.
            </p>
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Panier — Comportement</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_panier_ouverture_actif === 'true'}
            onChange={(e) => maj('popup_panier_ouverture_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Ouvrir la popup panier après un ajout</strong>
            <p>Quand activé, la popup panier s'ouvre automatiquement dès qu'un client clique sur "Ajouter au panier".</p>
          </div>
        </label>
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Popup Panier — Barre de progression</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_panier_seuil_livraison_actif === 'true'}
            onChange={(e) => maj('popup_panier_seuil_livraison_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la barre de progression livraison</strong>
            <p>Affiche "Plus que X € pour la livraison offerte" avec une barre de progression dans la popup panier.</p>
          </div>
        </label>

        {config.popup_panier_seuil_livraison_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Seuil livraison offerte (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={config.popup_panier_seuil_livraison}
              onChange={(e) => maj('popup_panier_seuil_livraison', e.target.value)}
            />
          </div>
        )}

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_panier_surprise_actif === 'true'}
            onChange={(e) => maj('popup_panier_surprise_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Activer le palier "Bijou surprise offert"</strong>
            <p>Ajoute un deuxième palier sur la barre de progression (ex: à 100 €, bijou surprise offert).</p>
          </div>
        </label>

        {config.popup_panier_surprise_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Seuil bijou surprise (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={config.popup_panier_seuil_surprise}
              onChange={(e) => maj('popup_panier_seuil_surprise', e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Popup Panier — Article bonus</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_panier_article_bonus_actif === 'true'}
            onChange={(e) => maj('popup_panier_article_bonus_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Proposer un article bonus dans le panier</strong>
            <p>Affiche un article optionnel (ex : boîte cadeau) que le client peut cocher pour l'ajouter à sa commande.</p>
          </div>
        </label>

        {config.popup_panier_article_bonus_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Article à proposer comme bonus</label>
            {produits.length === 0 ? (
              <p className="formulaire-produit__aide">
                Créez d'abord un article (ex. "Boîte cadeau") depuis{' '}
                <a href="/admin/produits/nouveau">Admin › Bijoux › Nouveau</a>, puis revenez ici le sélectionner.
              </p>
            ) : (
              <select
                value={config.popup_panier_article_bonus_id}
                onChange={(e) => maj('popup_panier_article_bonus_id', e.target.value)}
              >
                <option value="">— Choisir un article —</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} — {parseFloat(p.prix).toFixed(2)} €
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Popups</h2>

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
