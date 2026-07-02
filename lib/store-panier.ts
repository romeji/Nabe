import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ArticlePanier = {
  produitId: string;
  nom: string;
  prix: number;
  prixOriginal?: number; // prix normal avant promo, si l'article a été ajouté en promotion (pour affichage barré dans le panier)
  image: string;
  taille?: string;
  quantite: number;
  stockMax?: number; // quantité maximum disponible pour ce produit/taille au moment de l'ajout
};

type CodePromoApplique = { code: string; reduction: number } | null;

type PanierState = {
  articles: ArticlePanier[];
  codePromoApplique: CodePromoApplique;
  ajouterArticle: (article: ArticlePanier) => void;
  retirerArticle: (produitId: string, taille?: string) => void;
  modifierQuantite: (produitId: string, quantite: number, taille?: string) => void;
  definirCodePromo: (code: CodePromoApplique) => void;
  vider: () => void;
  total: () => number;
  nombreArticles: () => number;
};

export const usePanierStore = create<PanierState>()(
  persist(
    (set, get) => ({
      articles: [],
      codePromoApplique: null,

      ajouterArticle: (article) => {
        set((state) => {
          const existant = state.articles.find(
            (a) => a.produitId === article.produitId && a.taille === article.taille
          );
          if (existant) {
            const plafond = article.stockMax ?? existant.stockMax;
            const quantiteVoulue = existant.quantite + article.quantite;
            const quantiteFinale = typeof plafond === 'number' ? Math.min(quantiteVoulue, plafond) : quantiteVoulue;
            return {
              articles: state.articles.map((a) =>
                a.produitId === article.produitId && a.taille === article.taille
                  ? { ...a, quantite: quantiteFinale, stockMax: plafond }
                  : a
              ),
            };
          }
          const quantiteInitiale =
            typeof article.stockMax === 'number' ? Math.min(article.quantite, Math.max(article.stockMax, 0)) : article.quantite;
          return { articles: [...state.articles, { ...article, quantite: quantiteInitiale }] };
        });
      },

      retirerArticle: (produitId, taille) => {
        set((state) => ({
          articles: state.articles.filter(
            (a) => !(a.produitId === produitId && a.taille === taille)
          ),
        }));
      },

      modifierQuantite: (produitId, quantite, taille) => {
        set((state) => ({
          articles: state.articles.map((a) => {
            if (a.produitId !== produitId || a.taille !== taille) return a;
            const plafonnee = typeof a.stockMax === 'number' ? Math.min(quantite, Math.max(a.stockMax, 1)) : quantite;
            return { ...a, quantite: plafonnee };
          }),
        }));
      },

      definirCodePromo: (code) => set({ codePromoApplique: code }),

      vider: () => set({ articles: [], codePromoApplique: null }),

      total: () => {
        return get().articles.reduce((acc, a) => acc + a.prix * a.quantite, 0);
      },

      nombreArticles: () => {
        return get().articles.reduce((acc, a) => acc + a.quantite, 0);
      },
    }),
    { name: 'nabe-panier' }
  )
);
