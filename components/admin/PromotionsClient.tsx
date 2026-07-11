'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { formaterPrix, pourcentageReduction } from '@/lib/utils';

type ProduitPromo = {
  id: string;
  reference: string;
  nom: string;
  image: string | null;
  categorie: string | null;
  prix: string;
  prixPromo: string | null;
  promoActive: boolean;
  promoDebut: string | null;
  promoFin: string | null;
  actif: boolean;
};

export default function PromotionsClient() {
  const [produits, setProduits] = useState<ProduitPromo[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<'tous' | 'en-promo' | 'sans-promo'>('tous');
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [succes, setSucces] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/admin/promotions')
      .then((r) => r.json())
      .then((data) => setProduits(data))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const produitsFiltres = useMemo(() => {
    return produits.filter((p: any) => {
      const matchRecherche =
        !recherche ||
        p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        p.reference.toLowerCase().includes(recherche.toLowerCase());
      const matchFiltre =
        filtre === 'tous' ||
        (filtre === 'en-promo' && p.promoActive && p.prixPromo) ||
        (filtre === 'sans-promo' && !(p.promoActive && p.prixPromo));
      return matchRecherche && matchFiltre;
    });
  }, [produits, recherche, filtre]);

  function majChamp(id: string, champ: keyof ProduitPromo, valeur: any) {
    setProduits((prev) => prev.map((p: any) => (p.id === id ? { ...p, [champ]: valeur } : p)));
    setSucces((prev) => ({ ...prev, [id]: false }));
  }

  async function sauvegarder(produit: ProduitPromo) {
    setSauvegardeEnCours(produit.id);
    setErreurs((prev) => ({ ...prev, [produit.id]: '' }));
    try {
      const res = await fetch(`/api/admin/promotions/${produit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prixPromo: produit.prixPromo ? parseFloat(produit.prixPromo) : null,
          promoActive: produit.promoActive,
          promoDebut: produit.promoDebut || null,
          promoFin: produit.promoFin || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setSucces((prev) => ({ ...prev, [produit.id]: true }));
      setTimeout(() => setSucces((prev) => ({ ...prev, [produit.id]: false })), 2000);
    } catch (err: any) {
      setErreurs((prev) => ({ ...prev, [produit.id]: err.message || 'Erreur lors de la sauvegarde.' }));
    } finally {
      setSauvegardeEnCours(null);
    }
  }

  async function retirerPromo(produit: ProduitPromo) {
    majChamp(produit.id, 'promoActive', false);
    majChamp(produit.id, 'prixPromo', null);
    const misAJour = { ...produit, promoActive: false, prixPromo: null };
    await sauvegarder(misAJour);
  }

  if (chargement) {
    return <p className="admin-promotions__chargement">Chargement des bijoux...</p>;
  }

  const nombreEnPromo = produits.filter((p: any) => p.promoActive && p.prixPromo).length;

  return (
    <div className="admin-promotions__corps">
      {/* Barre d'outils */}
      <div className="admin-promotions__outils">
        <input
          type="text"
          placeholder="Rechercher un bijou ou une référence..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="admin-promotions__recherche"
        />
        <div className="admin-promotions__filtres">
          <button
            className={filtre === 'tous' ? 'actif' : ''}
            onClick={() => setFiltre('tous')}
          >
            Tous ({produits.length})
          </button>
          <button
            className={filtre === 'en-promo' ? 'actif' : ''}
            onClick={() => setFiltre('en-promo')}
          >
            En promo ({nombreEnPromo})
          </button>
          <button
            className={filtre === 'sans-promo' ? 'actif' : ''}
            onClick={() => setFiltre('sans-promo')}
          >
            Sans promo ({produits.length - nombreEnPromo})
          </button>
        </div>
      </div>

      {produitsFiltres.length === 0 ? (
        <p className="admin-promotions__vide">Aucun bijou ne correspond à votre recherche.</p>
      ) : (
        <div className="admin-promotions__liste">
          {produitsFiltres.map((produit: any) => {
            const pourcentage =
              produit.prixPromo && parseFloat(produit.prixPromo) > 0
                ? pourcentageReduction(produit.prix, produit.prixPromo)
                : 0;

            return (
              <div key={produit.id} className={`admin-promotions__ligne ${produit.promoActive && produit.prixPromo ? 'admin-promotions__ligne--active' : ''}`}>
                <div className="admin-promotions__produit">
                  <div className="admin-promotions__image">
                    {produit.image ? (
                      <Image src={produit.image} alt={produit.nom} width={56} height={56} style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="admin-promotions__image-vide" />
                    )}
                  </div>
                  <div>
                    <p className="admin-promotions__nom">{produit.nom}</p>
                    <p className="admin-promotions__ref">
                      {produit.reference} {produit.categorie && `· ${produit.categorie}`}
                    </p>
                  </div>
                </div>

                <div className="admin-promotions__prix-normal">
                  <span className="admin-promotions__label">Prix normal</span>
                  <span>{formaterPrix(produit.prix)}</span>
                </div>

                <div className="admin-promotions__champ">
                  <span className="admin-promotions__label">Prix promo</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="—"
                    value={produit.prixPromo ?? ''}
                    onChange={(e) => majChamp(produit.id, 'prixPromo', e.target.value)}
                    className="admin-promotions__input-prix"
                  />
                  {pourcentage > 0 && <span className="admin-promotions__pourcentage">-{pourcentage}%</span>}
                </div>

                <div className="admin-promotions__champ">
                  <span className="admin-promotions__label">Début (optionnel)</span>
                  <input
                    type="date"
                    value={produit.promoDebut ? produit.promoDebut.slice(0, 10) : ''}
                    onChange={(e) => majChamp(produit.id, 'promoDebut', e.target.value)}
                    className="admin-promotions__input-date"
                  />
                </div>

                <div className="admin-promotions__champ">
                  <span className="admin-promotions__label">Fin (optionnel)</span>
                  <input
                    type="date"
                    value={produit.promoFin ? produit.promoFin.slice(0, 10) : ''}
                    onChange={(e) => majChamp(produit.id, 'promoFin', e.target.value)}
                    className="admin-promotions__input-date"
                  />
                </div>

                <label className="admin-promotions__toggle">
                  <input
                    type="checkbox"
                    checked={produit.promoActive}
                    onChange={(e) => majChamp(produit.id, 'promoActive', e.target.checked)}
                  />
                  <span>Active</span>
                </label>

                <div className="admin-promotions__actions">
                  <button
                    className="admin-btn admin-btn--primaire admin-promotions__btn-save"
                    onClick={() => sauvegarder(produit)}
                    disabled={sauvegardeEnCours === produit.id}
                  >
                    {sauvegardeEnCours === produit.id
                      ? '...'
                      : succes[produit.id]
                      ? '✓ Enregistré'
                      : 'Enregistrer'}
                  </button>
                  {produit.promoActive && produit.prixPromo && (
                    <button className="admin-promotions__btn-retirer" onClick={() => retirerPromo(produit)}>
                      Retirer la promo
                    </button>
                  )}
                </div>

                {erreurs[produit.id] && <p className="admin-promotions__erreur">{erreurs[produit.id]}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
