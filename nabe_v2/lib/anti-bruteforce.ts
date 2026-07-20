/**
 * Protection anti brute-force basique mais réelle sur les connexions
 * (admin ET client) : après plusieurs mots de passe erronés consécutifs, le
 * compte est verrouillé temporairement, indépendamment de l'IP de
 * l'attaquant (ce qui évite le contournement par changement d'IP/VPN).
 *
 * Stocké en base (champs tentativesEchouees / verrouJusqua sur Admin et
 * Client) plutôt qu'en mémoire, pour rester fiable sur un déploiement
 * serverless (Vercel) où chaque invocation peut tourner sur une instance
 * différente sans état partagé.
 */

const NB_TENTATIVES_MAX = 5;
const DUREE_VERROU_MINUTES = 15;

export function estVerrouille(verrouJusqua: Date | null): boolean {
  return !!verrouJusqua && verrouJusqua.getTime() > Date.now();
}

/** Calcule le prochain état (tentatives, verrou) après un échec de connexion. */
export function calculerApresEchec(tentativesActuelles: number): { tentativesEchouees: number; verrouJusqua: Date | null } {
  const tentatives = tentativesActuelles + 1;
  if (tentatives >= NB_TENTATIVES_MAX) {
    return { tentativesEchouees: 0, verrouJusqua: new Date(Date.now() + DUREE_VERROU_MINUTES * 60 * 1000) };
  }
  return { tentativesEchouees: tentatives, verrouJusqua: null };
}

export const ETAT_APRES_SUCCES = { tentativesEchouees: 0, verrouJusqua: null };
