import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ArticlePanier = {
  produitId: string;
  nom: string;
  prix: number;
  image: string;
  taille?: string;
  quantite: number;
};

type PanierState = {
  articles: ArticlePanier[];
  ajouterArticle: (article: ArticlePanier) => void;
  retirerArticle: (produitId: string, taille?: string) => void;
  modifierQuantite: (produitId: string, quantite: number, taille?: string) => void;
  vider: () => void;
  total: () => number;
  nombreArticles: () => number;
};

export const usePanierStore = create<PanierState>()(
  persist(
    (set, get) => ({
      articles: [],

      ajouterArticle: (article) => {
        set((state) => {
          const existant = state.articles.find(
            (a) => a.produitId === article.produitId && a.taille === article.taille
          );
          if (existant) {
            return {
              articles: state.articles.map((a) =>
                a.produitId === article.produitId && a.taille === article.taille
                  ? { ...a, quantite: a.quantite + article.quantite }
                  : a
              ),
            };
          }
          return { articles: [...state.articles, article] };
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
          articles: state.articles.map((a) =>
            a.produitId === produitId && a.taille === taille ? { ...a, quantite } : a
          ),
        }));
      },

      vider: () => set({ articles: [] }),

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
