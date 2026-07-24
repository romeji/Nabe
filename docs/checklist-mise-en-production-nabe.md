# Checklist de mise en production — Nabe

Ce document sert de guide avant la mise en production du site Nabe. L'objectif est de vérifier les points critiques avant d'ouvrir le site à de vrais clients, avec de vrais paiements et de vraies données personnelles.

## 1. Vérifications techniques locales

Depuis le dossier du projet :

```bash
cd C:\Users\Jérôme\Documents\nabe_site
```

Lancer la vérification TypeScript :

```bash
npx tsc --noEmit --pretty false --incremental false
```

Puis lancer le build de production :

```bash
npm run build
```

Ces deux commandes doivent passer sans erreur avant la mise en ligne.

## 2. Variables d'environnement Vercel

Vérifier dans Vercel que les variables suivantes sont bien configurées :

```env
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL=https://ton-domaine.fr
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
EMAIL_FROM
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_GTM_ID=GTM-K4TMHB8F
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Point critique : `NEXTAUTH_URL` doit être le vrai domaine final, pas l'URL temporaire Vercel.

## 3. Google OAuth

Dans Google Cloud Console, ajouter l'URL de callback du domaine final :

```txt
https://ton-domaine.fr/api/auth/callback/google
```

Si l'URL Vercel est encore utilisée pour les tests, ajouter aussi :

```txt
https://nabe-lyart.vercel.app/api/auth/callback/google
```

Tester ensuite :

- connexion Google depuis le site public ;
- création de compte Google ;
- redirection après connexion ;
- absence d'erreur CSP dans la console navigateur.

## 4. Google Tag Manager / Analytics

Vérifier que la variable suivante existe :

```env
NEXT_PUBLIC_GTM_ID=GTM-K4TMHB8F
```

Tester ensuite :

- le bandeau cookies apparaît ;
- Google Tag Manager ne se charge pas avant consentement ;
- Google Tag Manager se charge après acceptation ;
- aucune erreur CSP ne bloque Google dans la console navigateur.

## 5. Stripe

Dans Stripe, le webhook de production doit pointer vers :

```txt
https://ton-domaine.fr/api/webhooks/stripe
```

Tester en mode test :

- paiement réussi ;
- paiement refusé ;
- paiement interrompu ;
- retour sur la page succès ;
- webhook reçu ;
- commande créée en base ;
- stock décrémenté ;
- e-mail de confirmation reçu ;
- facture accessible ;
- annulation possible avant préparation ;
- annulation impossible après passage en préparation.

## 6. Livraison

Pour le lancement :

- Mondial Relay doit rester désactivé ;
- aucune promesse Colissimo ne doit être affichée ;
- la livraison suivie manuelle doit être active ;
- les tarifs doivent être configurés dans l'admin ;
- choisir si la livraison est incluse dans les prix ou ajoutée au checkout.

À vérifier dans l'admin :

- grille tarifaire poids/prix ;
- délai de livraison affiché ;
- option "livraison incluse dans le prix" ;
- affichage correct au checkout.

## 7. Produits

Chaque produit doit avoir :

- nom propre ;
- slug propre ;
- prix correct ;
- poids renseigné ;
- stock global ou stock par taille ;
- disponibilité correcte ;
- images propres ;
- description claire ;
- matière renseignée ;
- collection ou catégorie correcte ;
- délai de fabrication si nécessaire.

Disponibilités à utiliser :

- `En stock` : achat direct selon stock disponible ;
- `Fabrication sur commande` : achat direct possible même si la taille est à fabriquer ;
- `Création sur mesure` : pas d'achat direct, demande de devis ;
- `Épuisé` : achat bloqué.

## 8. Sur-mesure

Workflow recommandé au lancement :

1. Le client envoie une demande via le formulaire sur-mesure.
2. Nabe répond avec un devis.
3. Le client accepte le devis par écrit.
4. Nabe envoie un lien de paiement Stripe.
5. La fabrication commence après acceptation et paiement.

Point juridique important : une pièce sur-mesure ou fabriquée spécialement à la demande du client ne peut pas être retournée au titre du droit de rétractation, sauf défaut de conformité ou vice caché.

## 9. Pages légales

Relire manuellement :

- CGV ;
- Livraison & Retours ;
- Mentions légales ;
- Politique de confidentialité ;
- Cookies ;
- Paiement sécurisé.

À compléter avant production :

- nom légal ;
- adresse ;
- e-mail de contact ;
- SIRET dès qu'il est disponible ;
- médiateur de la consommation ;
- régime TVA réel.

Ne pas mettre un SIRET fictif. Si l'immatriculation est en cours, l'indiquer clairement.

## 10. E-mails

Tester :

- création de compte ;
- mot de passe oublié ;
- confirmation commande ;
- annulation ou remboursement ;
- expédition avec numéro de suivi ;
- formulaire contact ;
- demande sur-mesure ;
- inscription newsletter ;
- désabonnement newsletter.

Vérifier aussi que les e-mails n'arrivent pas en spam.

## 11. Admin

Tester sur desktop et mobile :

- connexion admin ;
- ajout produit ;
- modification produit ;
- modification catégorie ;
- modification pierre ;
- upload image ;
- changement statut commande ;
- ajout numéro de suivi ;
- export commandes ;
- réglages livraison ;
- activation/désactivation modules accueil ;
- activation/désactivation notifications.

## 12. SEO

Avant live :

- domaine final configuré ;
- sitemap accessible : `/sitemap.xml` ;
- robots accessible : `/robots.txt` ;
- titres et descriptions propres ;
- images OpenGraph correctes ;
- Search Console configurée ;
- Google Tag Manager testé après consentement cookies.

Axes SEO prioritaires pour Nabe :

- bijoux artisanaux ;
- bijoux argent 925 ;
- bijoux faits main ;
- bagues artisanales ;
- bijoux sur-mesure ;
- bijoux personnalisés ;
- petites séries ;
- atelier de bijouterie.

## 13. Test utilisateur complet

Faire un test complet :

1. Arriver sur la homepage en mobile.
2. Ouvrir une collection.
3. Ouvrir une fiche produit.
4. Choisir une taille en stock.
5. Ajouter au panier.
6. Passer au checkout.
7. Payer avec Stripe test.
8. Vérifier la page succès.
9. Vérifier l'e-mail de confirmation.
10. Vérifier la commande dans l'admin.
11. Passer la commande en préparation.
12. Vérifier que le client ne peut plus annuler.
13. Ajouter un numéro de suivi.
14. Vérifier le suivi côté client.

Refaire un second test avec une taille en fabrication sur commande.

## 14. Décision avant mise en production

Ne pas mettre en production tant que ces trois points ne sont pas validés :

- `npm run build` passe sans erreur ;
- Stripe webhook fonctionne en mode test ;
- Google OAuth fonctionne sur le domaine final.

Si ces trois points sont verts, le site peut passer en pré-production ou en production contrôlée.

