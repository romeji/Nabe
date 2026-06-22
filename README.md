# Nabe — Site e-commerce & Backoffice

Site de la maison de joaillerie artisanale **Nabe**, développé avec Next.js 14 (App Router), Prisma, PostgreSQL, NextAuth, Cloudinary et Stripe.

---

## 🧱 Stack technique

| Brique | Techno | Rôle |
|---|---|---|
| Framework | Next.js 14 (App Router, TypeScript) | Site public + backoffice + API |
| Base de données | PostgreSQL (via [Neon](https://neon.tech)) | Stockage produits, stock, ventes, contenu |
| ORM | Prisma | Accès typé à la base de données |
| Authentification | NextAuth (Credentials) | Connexion au backoffice (1 compte admin) |
| Images | Cloudinary | Upload et hébergement des photos produits |
| Paiement | Stripe Checkout | Paiement par carte bancaire |
| État panier | Zustand | Panier persistant côté navigateur |
| Hébergement | Vercel | Déploiement du site |
| Code source | GitHub | Versionning |

---

## 📁 Structure du projet

```
nabe/
├── app/
│   ├── (site)/              → Pages publiques (groupe de routes, partage Header/Footer)
│   │   ├── page.tsx          → Accueil
│   │   ├── accueil.css
│   │   ├── la-maison/
│   │   ├── collections/
│   │   │   └── [slug]/       → Page produit détail
│   │   ├── sur-mesure/
│   │   ├── contact/
│   │   ├── panier/
│   │   ├── checkout/succes/
│   │   └── journal/
│   ├── admin/                → Backoffice protégé
│   │   ├── login/
│   │   ├── produits/         → CRUD bijoux
│   │   ├── categories/
│   │   ├── stock/
│   │   ├── commandes/        → Ventes
│   │   ├── sur-mesure/       → Demandes reçues
│   │   ├── messages/         → Messages de contact
│   │   └── contenu/          → CMS léger (textes des pages)
│   ├── api/                  → Routes API (publiques + /admin protégées)
│   └── globals.css           → Variables de design (couleurs, typographies)
├── components/
│   ├── site/                 → Composants des pages publiques (+ CSS associé)
│   └── admin/                → Composants du backoffice (+ CSS associé)
├── lib/                       → prisma.ts, auth.ts, stripe.ts, cloudinary.ts, utils.ts, store-panier.ts
├── prisma/
│   ├── schema.prisma          → Schéma complet de la base de données
│   └── seed.ts                → Script de création du compte admin + données de démo
└── middleware.ts               → Protection des routes /admin/*
```

**Convention CSS** : chaque page/composant a son propre fichier `.css` importé directement dans le `.tsx` correspondant (ex: `page.tsx` + `accueil.css`). Le fichier `app/globals.css` ne contient que les variables partagées (couleurs, typographies, boutons génériques) — c'est voulu pour faciliter les modifications page par page comme demandé.

---

## 🚀 Installation locale

### 1. Prérequis

- [Node.js](https://nodejs.org) version 20 ou plus
- [VS Code](https://code.visualstudio.com) (ou autre éditeur)
- Un compte [GitHub](https://github.com)
- Un compte [Vercel](https://vercel.com)
- Un compte [Neon](https://neon.tech) (base de données PostgreSQL gratuite)
- Un compte [Cloudinary](https://cloudinary.com) (gratuit)
- Un compte [Stripe](https://stripe.com)

### 2. Installer les dépendances

Ouvre un terminal dans le dossier du projet :

```bash
npm install
```

### 3. Configurer les variables d'environnement

Un fichier `.env` est déjà présent (copié depuis `.env.example`). Remplis chaque valeur :

#### a) Base de données (Neon)
1. Crée un compte sur [neon.tech](https://neon.tech)
2. Crée un nouveau projet (ex: "nabe")
3. Copie la **Connection String** (mode "Pooled connection")
4. Colle-la dans `DATABASE_URL` du fichier `.env`

#### b) NextAuth
Génère un secret aléatoire avec cette commande dans ton terminal :
```bash
openssl rand -base64 32
```
Colle le résultat dans `NEXTAUTH_SECRET`.

Renseigne aussi `ADMIN_EMAIL` et `ADMIN_PASSWORD` — ce sont les identifiants que tu utiliseras pour te connecter au backoffice (ils seront utilisés par le script de seed à l'étape 5).

#### c) Cloudinary
1. Crée un compte sur [cloudinary.com](https://cloudinary.com)
2. Sur le Dashboard, récupère : `Cloud name`, `API Key`, `API Secret`
3. Renseigne `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, et `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (même valeur que `CLOUDINARY_CLOUD_NAME`)

#### d) Stripe
1. Crée un compte sur [stripe.com](https://stripe.com)
2. En mode **Test**, va dans Développeurs → Clés API
3. Renseigne `STRIPE_SECRET_KEY` (commence par `sk_test_...`) et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (commence par `pk_test_...`)
4. Pour `STRIPE_WEBHOOK_SECRET`, voir la section [Configurer le webhook Stripe](#-configurer-le-webhook-stripe-important) ci-dessous

### 4. Créer les tables dans la base de données

```bash
npx prisma db push
```

Cette commande lit `prisma/schema.prisma` et crée toutes les tables dans ta base Neon.

### 5. Créer ton compte admin et les données de démarrage

```bash
npm run db:seed
```

Cela crée :
- Ton compte admin (avec l'email/mot de passe renseignés dans `.env`)
- Les 6 catégories de base (Bagues, Colliers, etc.)
- 3 témoignages de démonstration

### 6. Lancer le site en local

```bash
npm run dev
```

Le site est accessible sur **http://localhost:3000**
Le backoffice est accessible sur **http://localhost:3000/admin/login**

---

## 💳 Configurer le webhook Stripe (important)

Le webhook Stripe est ce qui crée la commande en base de données et décrémente le stock **après** un paiement réussi. Sans lui, les paiements fonctionnent mais aucune commande n'est enregistrée.

### En local (pour tester)

1. Installe la [Stripe CLI](https://docs.stripe.com/stripe-cli)
2. Connecte-toi : `stripe login`
3. Lance l'écoute du webhook :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copie le secret affiché (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET` de ton `.env`

### En production (sur Vercel, après déploiement)

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com) → Développeurs → Webhooks
2. Clique sur "Ajouter un point de terminaison"
3. URL : `https://ton-domaine.vercel.app/api/webhooks/stripe`
4. Événement à écouter : `checkout.session.completed`
5. Copie le "Signing secret" et ajoute-le comme variable d'environnement `STRIPE_WEBHOOK_SECRET` sur Vercel

---

## 🖼️ Ajouter les images de design (logo, photos d'illustration)

Le code référence des images statiques pour les sections visuelles (heros, photos d'ambiance) dans `/public/images/`. Comme tu l'as précisé, ajoute-les manuellement :

```
public/images/
├── hero-mains.jpg              → Page d'accueil, bandeau principal
├── atelier-mains.jpg           → Page d'accueil, section "Notre histoire"
├── signature-bague.jpg         → Page d'accueil, section "Pièce signature"
├── atelier-portrait.jpg        → Page La Maison, bandeau principal
├── croquis.jpg                 → Page La Maison, section "Mon parcours"
├── bague-atelier.jpg           → Page La Maison, section "Savoir-faire"
├── sur-mesure-hero.jpg         → Page Sur-mesure, bandeau principal
├── contact-hero.jpg            → Page Contact, bandeau principal
├── main-bague.jpg              → Page Contact, section "Rendez-vous"
├── collections-hero.jpg        → Page Collections, bandeau principal
├── savoirfaire-inspiration.jpg → Page d'accueil, étape "01 Inspiration"
├── savoirfaire-creation.jpg    → Page d'accueil, étape "02 Création"
└── savoirfaire-fabrication.jpg → Page d'accueil, étape "03 Fabrication"
```

Les **photos de bijoux** (catalogue produit), elles, ne sont **pas** stockées dans `/public` — elles s'ajoutent directement depuis le backoffice (`/admin/produits/nouveau`), qui les envoie automatiquement vers Cloudinary.

---

## 🔤 Police du logo (Imperial Script)

La police est déjà intégrée via Google Fonts dans `app/globals.css` :
```css
@import url('https://fonts.googleapis.com/css2?family=Imperial+Script&...');
```
Elle est appliquée automatiquement au logo "Nabe" partout sur le site (`--font-logo` dans les variables CSS). Aucune action requise.

---

## 🛠️ Utiliser le backoffice

Connecte-toi sur `/admin/login` avec les identifiants définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

| Section | Ce que tu peux faire |
|---|---|
| **Tableau de bord** | Vue d'ensemble : CA du mois, stock bas, dernières ventes |
| **Bijoux** | Ajouter/modifier/supprimer un bijou, uploader ses photos, gérer prix/matière/pierre/tailles/stock |
| **Catégories** | Créer des catégories pour organiser le catalogue |
| **Stock** | Voir l'historique des mouvements, enregistrer une entrée/sortie manuelle |
| **Ventes** | Voir toutes les commandes payées, changer leur statut (préparation, expédiée, livrée...) |
| **Sur-mesure** | Voir les demandes reçues via le formulaire, changer leur statut, ajouter des notes privées |
| **Messages** | Voir les messages du formulaire de contact, répondre par email, archiver |
| **Contenu du site** | Modifier certains textes des pages Accueil et La Maison sans toucher au code |

Le stock se décrémente **automatiquement** à chaque vente payée (via le webhook Stripe).

---

## 📤 Déploiement sur GitHub + Vercel

### 1. Créer le dépôt GitHub

```bash
cd nabe
git init
git add .
git commit -m "Premier commit du site Nabe"
```

Crée un nouveau dépôt sur [github.com/new](https://github.com/new), puis :

```bash
git remote add origin https://github.com/TON-PSEUDO/nabe.git
git branch -M main
git push -u origin main
```

### 2. Déployer sur Vercel

1. Va sur [vercel.com/new](https://vercel.com/new)
2. Importe ton dépôt GitHub `nabe`
3. Dans "Environment Variables", ajoute **toutes** les variables de ton fichier `.env` (sauf `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` que tu mettras à l'URL Vercel finale, ex: `https://nabe.vercel.app`)
4. Clique sur "Deploy"

### 3. Après le premier déploiement

- Mets à jour `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` avec l'URL réelle de ton site Vercel, puis redéploie
- Configure le webhook Stripe en production (voir section dédiée ci-dessus)
- Connecte-toi sur `https://ton-site.vercel.app/admin/login` et commence à ajouter tes bijoux !

---

## 🧩 Commandes utiles

```bash
npm run dev          # Lancer le site en développement
npm run build         # Construire le site pour la production
npm run db:push        # Appliquer le schéma Prisma à la base de données
npm run db:studio      # Ouvrir Prisma Studio (interface visuelle de la base de données)
npm run db:seed        # Recréer le compte admin et les données de démo
```

---

## 🔐 Sécurité — à savoir

- Le dossier `/admin` est protégé par `middleware.ts` : impossible d'y accéder sans être connecté
- Toutes les routes `/api/admin/*` vérifient la session côté serveur avant toute opération
- Les prix sont **toujours revérifiés côté serveur** avant la création d'une session de paiement Stripe (le panier côté client n'est jamais une source de confiance pour les prix)
- Ne commite **jamais** ton fichier `.env` sur GitHub (il est déjà exclu via `.gitignore`)

---

## 📌 Pour aller plus loin (évolutions possibles)

- Page Journal : actuellement un placeholder, prête à recevoir un modèle `Article` Prisma si tu veux un vrai blog
- Emails transactionnels (confirmation de commande, réponse au formulaire) : non inclus, branchable via [Resend](https://resend.com) ou [Postmark](https://postmarkapp.com)
- Multi-images avec réordonnancement par glisser-déposer dans le backoffice : actuellement l'ordre suit l'ordre d'upload
- Gestion de plusieurs comptes admin avec rôles : la base est prête (modèle `Admin`), il suffirait d'ajouter un champ `role`
