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
  const collectionsSelectionnees = (config.collections_selection_ids || '').split(',').filter(Boolean);

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

  function basculerCollectionSelection(id: string) {
    const actuelles = new Set(collectionsSelectionnees);
    if (actuelles.has(id)) {
      actuelles.delete(id);
    } else {
      if (actuelles.size >= 3) {
        alert('Vous pouvez sélectionner 3 collections maximum.');
        return;
      }
      actuelles.add(id);
    }
    maj('collections_selection_ids', Array.from(actuelles).join(','));
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
            checked={config.collections_selection_actif === 'true'}
            onChange={(e) => maj('collections_selection_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Module "Notre sélection"</strong>
            <p>Affiche jusqu'à 3 collections choisies ci-dessous sur la page d'accueil.</p>
          </div>
        </label>

        {config.collections_selection_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Collections à mettre en avant (3 maximum)</label>
            <div className="reglages-client__categories">
              {collections.map((c: any) => (
                <button
                  key={c.id}
                  type="button"
                  className={`reglages-client__categorie-bouton ${collectionsSelectionnees.includes(c.id) ? 'actif' : ''}`}
                  onClick={() => basculerCollectionSelection(c.id)}
                >
                  {c.nom}
                </button>
              ))}
            </div>
            {collections.length === 0 && (
              <p className="formulaire-produit__aide">
                Aucune collection active. Créez-en une depuis <a href="/admin/collections">Admin &gt; Collections</a>.
              </p>
            )}
            <p className="formulaire-produit__aide">{collectionsSelectionnees.length} / 3 sélectionnée(s)</p>
          </div>
        )}

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.carrousel_bestseller_actif === 'true'}
            onChange={(e) => maj('carrousel_bestseller_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Carrousel "Meilleures ventes"</strong>
            <p>S'affiche au-dessus des témoignages, sur la page d'accueil. Basé sur le nombre de ventes réelles.</p>
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
              {collections.map((c: any) => (
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
              {categories.map((c: any) => (
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
        <h2>Page d'accueil — Ils nous font confiance</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.temoignages_actif === 'true'}
            onChange={(e) => maj('temoignages_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la section témoignages sur l'accueil</strong>
            <p>Affiche jusqu'à 3 témoignages clients (les plus prioritaires selon leur ordre).</p>
          </div>
        </label>

        <p className="formulaire-produit__aide">
          Pour ajouter, modifier, réordonner ou masquer un témoignage précis, rendez-vous dans{' '}
          <a href="/admin/temoignages">Admin &gt; Témoignages</a>.
        </p>
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Navigation</h2>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.journal_actif === 'true'}
            onChange={(e) => maj('journal_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher l'onglet "Journal" dans le menu</strong>
            <p>Visible dans le menu de navigation et le pied de page. Masqué par défaut.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.menu_categories_actif === 'true'}
            onChange={(e) => maj('menu_categories_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la section "Cat&eacute;gories" dans le menu burger</strong>
            <p>Inclut le lien vers tous les bijoux et les cat&eacute;gories du catalogue.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.menu_collections_actif === 'true'}
            onChange={(e) => maj('menu_collections_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la section "Collections" dans le menu burger</strong>
            <p>Utilise les collections actives configur&eacute;es dans l'admin.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.menu_pages_actif === 'true'}
            onChange={(e) => maj('menu_pages_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la section "&Agrave; propos" dans le menu burger</strong>
            <p>Regroupe l'atelier, l'histoire, l'artisanat, les engagements et le sur mesure.</p>
          </div>
        </label>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.menu_aide_actif === 'true'}
            onChange={(e) => maj('menu_aide_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la section "Aide &amp; infos" dans le menu burger</strong>
            <p>Regroupe livraison, paiement, FAQ et contact.</p>
          </div>
        </label>
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
                {produits.map((p: any) => (
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

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.popup_panier_vide_actif === 'true'}
            onChange={(e) => maj('popup_panier_vide_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher des suggestions quand le panier est vide</strong>
            <p>Affiche les meilleures ventes (bestsellers) dans la popup panier quand elle est ouverte et que le panier est vide.</p>
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
                {produits.map((p: any) => (
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

      <div className="admin-carte reglages-client__section">
        <h2>Livraison</h2>
        <p className="formulaire-produit__aide">
          Le tarif est calculé automatiquement au poids réel du panier (voir poids par bijou dans la fiche
          produit) à partir des grilles ci-dessous. Format d'une grille : poids maximum en grammes suivi de
          son prix, séparés par des virgules — ex. "500:4.95,1000:6.90" veut dire 4,95&nbsp;€ jusqu'à 500g,
          puis 6,90&nbsp;€ jusqu'à 1kg.
        </p>

        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.livraison_incluse_dans_prix === 'true'}
            onChange={(e) => maj('livraison_incluse_dans_prix', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Livraison incluse dans le prix des produits</strong>
            <p>
              Si activé, la livraison n'est jamais facturée en plus au checkout (affichée "incluse").
              À vous d'avoir répercuté son coût dans le prix de vos bijoux. Si désactivé (par défaut), le
              tarif est calculé séparément selon les grilles ci-dessous.
            </p>
          </div>
        </label>

        <label className="reglages-client__toggle" style={{ marginTop: '1rem' }}>
          <input
            type="checkbox"
            checked={config.livraison_mondial_relay_actif === 'true'}
            onChange={(e) => maj('livraison_mondial_relay_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Point relais (Mondial Relay)</strong>
            <p>Tarif calculé selon la grille ci-dessous, et sélection d'un point relais réel au checkout.</p>
          </div>
        </label>
        {config.livraison_mondial_relay_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Grille tarifaire Mondial Relay</label>
            <input
              type="text"
              value={config.livraison_mondial_relay_grille}
              onChange={(e) => maj('livraison_mondial_relay_grille', e.target.value)}
              placeholder="500:3.65,1000:5.40,2000:6.90"
            />
            <label>Enseigne Mondial Relay</label>
            <input
              type="text"
              value={config.mondial_relay_enseigne}
              onChange={(e) => maj('mondial_relay_enseigne', e.target.value)}
              placeholder="Fourni par Mondial Relay (8 caractères)"
            />
            <label>Clé privée Mondial Relay</label>
            <input
              type="password"
              value={config.mondial_relay_cle_privee}
              onChange={(e) => maj('mondial_relay_cle_privee', e.target.value)}
              placeholder="Fournie par Mondial Relay"
            />
            <p className="formulaire-produit__aide">
              Ces identifiants sont fournis par Mondial Relay à la signature de votre contrat professionnel.
              Sans eux, la recherche de points relais réels ne fonctionnera pas.
            </p>
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Identité de facturation</h2>
        <p className="formulaire-produit__aide">
          Ces informations apparaissent sur les factures téléchargeables par vos clients. Le SIRET peut
          rester vide tant que votre société n'est pas encore immatriculée.
        </p>
        <label>Nom affiché sur la facture</label>
        <input
          type="text"
          value={config.facturation_nom}
          onChange={(e) => maj('facturation_nom', e.target.value)}
          placeholder="Nabe"
        />
        <label>Adresse</label>
        <input
          type="text"
          value={config.facturation_adresse}
          onChange={(e) => maj('facturation_adresse', e.target.value)}
          placeholder="12 rue de l'Atelier, 75000 Paris"
        />
        <label>SIRET (optionnel)</label>
        <input
          type="text"
          value={config.facturation_siret}
          onChange={(e) => maj('facturation_siret', e.target.value)}
          placeholder="Laissez vide si pas encore immatriculé"
        />
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>TVA</h2>
        <p className="formulaire-produit__aide">
          Tant que votre activité n'est pas immatriculée en société (franchise en base de TVA en
          micro-entreprise), aucune TVA ne doit apparaître sur vos factures : laissez cette option
          désactivée. Activez-la uniquement une fois votre société créée et votre régime de TVA connu.
        </p>
        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.tva_applicable === 'true'}
            onChange={(e) => maj('tva_applicable', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Afficher la TVA sur les factures et récapitulatifs</strong>
          </div>
        </label>
        {config.tva_applicable === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Taux de TVA applicable (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={config.tva_taux}
              onChange={(e) => maj('tva_taux', e.target.value)}
              placeholder="20"
            />
          </div>
        )}
      </div>

      <div className="admin-carte reglages-client__section">
        <h2>Google Analytics</h2>
        <p className="formulaire-produit__aide">
          Ne se déclenche jamais sans le consentement explicite du visiteur (bandeau cookies affiché sur
          le site). Récupérez votre identifiant de mesure sur analytics.google.com (format "G-XXXXXXXXXX").
        </p>
        <label className="reglages-client__toggle">
          <input
            type="checkbox"
            checked={config.google_analytics_actif === 'true'}
            onChange={(e) => maj('google_analytics_actif', e.target.checked ? 'true' : 'false')}
          />
          <div>
            <strong>Activer Google Analytics</strong>
          </div>
        </label>
        {config.google_analytics_actif === 'true' && (
          <div className="reglages-client__sous-champ">
            <label>Identifiant de mesure (G-XXXXXXXXXX)</label>
            <input
              type="text"
              value={config.google_analytics_id}
              onChange={(e) => maj('google_analytics_id', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
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
