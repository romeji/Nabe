# ORBE — guide produit et déploiement

## Utilisation

L’application est disponible sur `/orbe`. La navigation latérale ouvre les vues Patrimoine, Budget, Investissements, Objectifs et Orbe AI. Le bouton **Ajouter** permet la connexion d’un compte (interface préparée) ou l’ajout manuel d’un actif. Les actifs manuels sont conservés dans le navigateur.

## Forfaits

- Gratuit : 3 connexions synchronisées, patrimoine et budget, 1 objectif, saisie manuelle illimitée.
- Premium : 8,99 €/mois avec essai de 14 jours, connexions illimitées, Orbe AI, projections, famille, export fiscal et support prioritaire.

## Mise en production complète

1. Créer les produits et prix récurrents dans Stripe, puis renseigner `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` et les identifiants de prix.
2. Contractualiser avec Powens ou Bridge pour l’agrégation DSP2/Open Finance. Renseigner leurs clés côté serveur uniquement et implémenter les webhooks de synchronisation.
3. Utiliser PostgreSQL avec Prisma pour les utilisateurs, foyers, actifs, comptes, transactions, objectifs et abonnements.
4. Activer l’authentification (Auth.js, passkeys et OAuth), le chiffrement des jetons fournisseur et un journal d’audit.
5. Configurer les emails transactionnels via Resend et le stockage des exports dans un bucket S3 compatible.
6. Ajouter Sentry, des sauvegardes chiffrées, une politique RGPD, l’export/suppression des données et une analyse d’impact avant d’ouvrir les connexions bancaires.

## Architecture d’API recommandée

- `POST /api/connections/session` : crée une session de connexion bancaire.
- `POST /api/webhooks/open-finance` : reçoit les mises à jour de comptes et transactions.
- `GET /api/portfolio` : agrège actifs, dettes, allocation et performance.
- `GET /api/cashflow` : agrège revenus, dépenses et catégories.
- `POST /api/goals` : crée une trajectoire et ses hypothèses.
- `POST /api/billing/checkout` : démarre le checkout Stripe.
- `POST /api/webhooks/stripe` : met à jour les droits du forfait.

Les projections affichées doivent rester explicitement indicatives. Aucun ordre d’investissement ni service crypto ne doit être activé sans le statut réglementaire et les partenaires appropriés.
