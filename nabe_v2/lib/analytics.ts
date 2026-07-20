'use client';

// Petite couche d'abstraction au-dessus de gtag pour centraliser tous les
// événements envoyés à Google Analytics 4. Avantage : si on change un jour
// d'outil de mesure (ou qu'on ajoute Meta Pixel, etc), un seul fichier à
// modifier plutôt que des appels gtag() éparpillés dans toute l'app.

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

function envoyerEvenement(nom: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', nom, params);
}

/** À appeler à chaque changement de page (voir components/site/SuiviPageVue.tsx) —
 * indispensable car Next.js navigue côté client sans rechargement complet,
 * donc gtag ne détecte pas les changements de page automatiquement. */
export function suivrePageVue(url: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: url });
}

export type ArticleGA = {
  item_id: string;
  item_name: string;
  price: number;
  item_variant?: string;
  quantity?: number;
};

export function suivreVueProduit(article: ArticleGA) {
  envoyerEvenement('view_item', {
    currency: 'EUR',
    value: article.price,
    items: [article],
  });
}

export function suivreAjoutPanier(article: ArticleGA) {
  envoyerEvenement('add_to_cart', {
    currency: 'EUR',
    value: article.price * (article.quantity || 1),
    items: [article],
  });
}

export function suivreDebutCheckout(articles: ArticleGA[], valeurTotale: number) {
  envoyerEvenement('begin_checkout', {
    currency: 'EUR',
    value: valeurTotale,
    items: articles,
  });
}

/** Événement le plus important : relie chaque vente réelle à Google
 * Analytics (chiffre d'affaires, taux de conversion, provenance des
 * ventes...). transaction_id évite tout risque de double-comptage si
 * l'utilisateur recharge la page de confirmation. */
export function suivreAchat(params: {
  transactionId: string;
  valeur: number;
  fraisLivraison: number;
  articles: ArticleGA[];
}) {
  envoyerEvenement('purchase', {
    transaction_id: params.transactionId,
    currency: 'EUR',
    value: params.valeur,
    shipping: params.fraisLivraison,
    items: params.articles,
  });
}
