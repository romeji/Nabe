// ============================================================
// REGISTRE DU CONTENU ÉDITABLE DU SITE
// ============================================================
// Ce fichier est la source de vérité unique pour tous les textes
// modifiables depuis Admin > Contenu. Chaque entrée définit :
//   - cle : l'identifiant technique (utilisé en base de données)
//   - label : ce qui s'affiche dans le formulaire admin
//   - type : "texte" (input court) ou "texte_long" (textarea)
//   - defaut : la valeur d'origine, utilisée si rien n'est encore
//              enregistré en base, et pré-remplie dans le formulaire
//              admin au premier chargement
//
// Pour ajouter un nouveau champ éditable :
//   1. Ajoute une entrée ici dans la bonne page
//   2. Utilise <ChampEditable page="..." cle="..." /> ou
//      contenu['ta_cle'] dans le composant de page correspondant

export type ChampContenu = {
  cle: string;
  label: string;
  type: 'texte' | 'texte_long';
  defaut: string;
};

export type PageContenu = {
  slug: string;
  titre: string;
  champs: ChampContenu[];
};

export const REGISTRE_CONTENU: PageContenu[] = [
  {
    slug: 'accueil',
    titre: 'Accueil',
    champs: [
      { cle: 'hero_logo', label: 'Texte du logo (bandeau principal)', type: 'texte', defaut: 'Nabe' },
      {
        cle: 'hero_soustitre',
        label: 'Sous-titre du bandeau principal',
        type: 'texte_long',
        defaut: "Des bijoux façonnés à la main, inspirés par l'émotion, la matière et le temps.",
      },
      { cle: 'hero_bouton_1', label: 'Texte du 1er bouton (bandeau)', type: 'texte', defaut: 'Découvrir la collection' },
      { cle: 'hero_bouton_2', label: 'Texte du 2e bouton (bandeau)', type: 'texte', defaut: 'Mon histoire' },

      { cle: 'histoire_label', label: 'Étiquette section "Notre histoire"', type: 'texte', defaut: 'Notre histoire' },
      {
        cle: 'histoire_texte',
        label: 'Texte section "Notre histoire"',
        type: 'texte_long',
        defaut:
          "Nabe est une maison de joaillerie artisanale née d'une passion pour la beauté des matières et le savoir-faire traditionnel. Chaque pièce est imaginée et façonnée à la main dans notre atelier, avec exigence, sensibilité et authenticité.",
      },
      { cle: 'histoire_lien', label: 'Texte du lien "Découvrir la maison"', type: 'texte', defaut: 'Découvrir la maison →' },

      { cle: 'collections_label', label: 'Étiquette section "Nos collections"', type: 'texte', defaut: 'Nos collections' },
      {
        cle: 'collections_vide',
        label: 'Message si aucun bijou mis en avant',
        type: 'texte',
        defaut: 'Ajoutez des bijoux « en avant » depuis le backoffice pour les afficher ici.',
      },

      { cle: 'savoirfaire_label', label: 'Étiquette section "Savoir-faire"', type: 'texte', defaut: 'Le savoir-faire' },
      { cle: 'savoirfaire_etape1_titre', label: 'Étape 1 — titre', type: 'texte', defaut: 'Inspiration' },
      { cle: 'savoirfaire_etape1_texte', label: 'Étape 1 — texte', type: 'texte_long', defaut: "Chaque création naît d'une émotion, d'un voyage, d'un instant." },
      { cle: 'savoirfaire_etape2_titre', label: 'Étape 2 — titre', type: 'texte', defaut: 'Création' },
      { cle: 'savoirfaire_etape2_texte', label: 'Étape 2 — texte', type: 'texte_long', defaut: 'Croquis, recherches et sélection des plus belles matières.' },
      { cle: 'savoirfaire_etape3_titre', label: 'Étape 3 — titre', type: 'texte', defaut: 'Fabrication' },
      { cle: 'savoirfaire_etape3_texte', label: 'Étape 3 — texte', type: 'texte_long', defaut: 'Façonnage à la main dans notre atelier, avec exigence et précision.' },

      { cle: 'signature_label', label: 'Étiquette section "Pièce signature"', type: 'texte', defaut: 'Pièce signature' },
      { cle: 'signature_bouton', label: 'Texte du bouton "Pièce signature"', type: 'texte', defaut: 'Découvrir' },

      { cle: 'temoignages_label', label: 'Étiquette section "Témoignages"', type: 'texte', defaut: 'Ils nous font confiance' },
      { cle: 'temoignages_titre', label: 'Titre section "Témoignages"', type: 'texte', defaut: 'Vos mots précieux' },

      { cle: 'newsletter_texte',
        label: 'Texte section "Newsletter"',
        type: 'texte_long',
        defaut: 'Inscrivez-vous à notre newsletter et découvrez nos nouveautés en avant-première.',
      },
      { cle: 'newsletter_bouton', label: 'Texte du bouton "Newsletter"', type: 'texte', defaut: "S'inscrire" },
    ],
  },
  {
    slug: 'la-maison',
    titre: "L'Atelier",
    champs: [
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'L\'atelier Nabe' },
      { cle: 'hero_soustitre', label: 'Sous-titre du bandeau principal', type: 'texte', defaut: 'Un lieu où naissent des bijoux façonnés avec passion.' },

      { cle: 'parcours_label', label: 'Étiquette section "Mon parcours"', type: 'texte', defaut: 'Mon parcours' },
      { cle: 'parcours_titre', label: 'Titre section "Mon parcours"', type: 'texte', defaut: 'De la passion au métier.' },
      {
        cle: 'parcours_texte',
        label: 'Texte section "Mon parcours"',
        type: 'texte_long',
        defaut:
          "Depuis toujours fascinée par la beauté des matières et le travail manuel, j'ai suivi un parcours en joaillerie où j'ai appris les gestes anciens et les techniques de fabrication traditionnelles. Chaque bijou que je crée raconte une histoire, la vôtre, et reflète l'attention portée aux détails et à la qualité.",
      },

      { cle: 'savoirfaire_label', label: 'Étiquette section "L\'atelier"', type: 'texte', defaut: "L'atelier" },
      { cle: 'savoirfaire_titre', label: 'Titre section "L\'atelier"', type: 'texte', defaut: 'Un savoir-faire artisanal.' },
      {
        cle: 'savoirfaire_texte',
        label: 'Texte section "L\'atelier"',
        type: 'texte_long',
        defaut:
          "Dans mon atelier à Lyon, chaque bijou est imaginé, dessiné et fabriqué à la main. Je travaille des métaux précieux et des pierres sélectionnées avec soin pour créer des pièces intemporelles, durables et uniques.",
      },

      { cle: 'valeur1_titre', label: 'Valeur 1 — titre', type: 'texte', defaut: 'Fait main' },
      { cle: 'valeur1_texte', label: 'Valeur 1 — texte', type: 'texte', defaut: 'Chaque bijou est façonné à la main avec soin.' },
      { cle: 'valeur2_titre', label: 'Valeur 2 — titre', type: 'texte', defaut: 'Matières nobles' },
      { cle: 'valeur2_texte', label: 'Valeur 2 — texte', type: 'texte', defaut: 'Des métaux précieux et pierres sélectionnées avec exigence.' },
      { cle: 'valeur3_titre', label: 'Valeur 3 — titre', type: 'texte', defaut: 'Pièces uniques' },
      { cle: 'valeur3_texte', label: 'Valeur 3 — texte', type: 'texte', defaut: 'Des créations en petites séries ou sur mesure.' },
    ],
  },
  {
    slug: 'collections',
    titre: 'Collections',
    champs: [
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Nos Collections' },
      { cle: 'hero_soustitre', label: 'Sous-titre du bandeau principal', type: 'texte', defaut: 'Des bijoux intemporels, façonnés à la main avec passion.' },
    ],
  },
  {
    slug: 'sur-mesure',
    titre: 'Sur-mesure',
    champs: [
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Sur-mesure' },
      { cle: 'hero_soustitre', label: 'Sous-titre du bandeau principal', type: 'texte', defaut: 'Une création unique, pensée pour vous.' },
      {
        cle: 'hero_texte',
        label: 'Texte du bandeau principal',
        type: 'texte_long',
        defaut: 'Chaque bijou raconte une histoire. La vôtre mérite une attention toute particulière.',
      },
      { cle: 'precommande_titre', label: 'Bloc "Pré-commande" — titre', type: 'texte', defaut: 'Pré-commande' },
      {
        cle: 'precommande_texte',
        label: 'Bloc "Pré-commande" — texte',
        type: 'texte_long',
        defaut:
          "Une pré-commande pour une taille non disponible nécessite un délai approximatif d'un mois. En renseignant votre email, vous serez prévenu de la mise à disposition du modèle. Merci et à bientôt.",
      },
      { cle: 'taille_titre', label: 'Bloc "Taille non disponible" — titre', type: 'texte', defaut: 'Taille non disponible ?' },
      {
        cle: 'taille_texte',
        label: 'Bloc "Taille non disponible" — texte',
        type: 'texte_long',
        defaut:
          "Si une bague n'est pas disponible dans votre taille je peux la réaliser, envoyez-moi simplement un petit message et je peux vous la préparer sous deux mois avec paiement en amont.",
      },
      { cle: 'colonne1_titre', label: 'Colonne gauche — titre', type: 'texte', defaut: '1. Choisissez votre modèle' },
      { cle: 'colonne1_texte', label: 'Colonne gauche — texte', type: 'texte', defaut: 'Sélectionnez le bijou que vous souhaitez commander.' },
      { cle: 'colonne2_titre', label: 'Colonne droite — titre', type: 'texte', defaut: '2. Personnalisez votre demande' },
      { cle: 'colonne2_texte', label: 'Colonne droite — texte', type: 'texte', defaut: 'Indiquez vos préférences et nous vous recontacterons rapidement.' },
    ],
  },
  {
    slug: 'contact',
    titre: 'Contact',
    champs: [
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Contact' },
      {
        cle: 'hero_soustitre',
        label: 'Sous-titre du bandeau principal',
        type: 'texte_long',
        defaut: "Une question, une envie, un projet ? Je serais ravie d'échanger avec vous.",
      },
      { cle: 'ecrivez_titre', label: 'Titre "Écrivez-moi"', type: 'texte', defaut: 'Écrivez-moi' },
      {
        cle: 'ecrivez_texte',
        label: 'Texte "Écrivez-moi"',
        type: 'texte_long',
        defaut: "Pour toute demande d'information, collaboration ou projet sur-mesure, remplissez le formulaire ci-contre.",
      },
      { cle: 'email', label: 'Adresse e-mail affichée', type: 'texte', defaut: 'bonjour@nabe-bijoux.fr' },
      { cle: 'telephone', label: 'Téléphone affiché', type: 'texte', defaut: '+33 6 12 34 56 78' },
      { cle: 'adresse_atelier', label: 'Adresse de l\'atelier affichée', type: 'texte', defaut: 'Lyon, France' },
      { cle: 'rdv_label', label: 'Étiquette section "Rendez-vous"', type: 'texte', defaut: "Rendez-vous à l'atelier" },
      {
        cle: 'rdv_texte',
        label: 'Texte section "Rendez-vous"',
        type: 'texte_long',
        defaut: "L'atelier Nabe vous accueille sur rendez-vous pour découvrir les collections et échanger sur vos envies.",
      },
      { cle: 'rdv_bouton', label: 'Texte du bouton "Rendez-vous"', type: 'texte', defaut: 'Prendre rendez-vous' },
    ],
  },
  {
    // Cas particulier : cette "page" ne stocke pas ses champs via ContenuPage comme les autres,
    // elle sert uniquement de point d'entrée dans le sélecteur d'onglets. Son contenu réel
    // (popups Contact / Entretien / Livraison de la fiche produit) est géré par
    // EditeurPolitiquesClient, affiché à la place de EditeurContenuClient pour ce slug.
    slug: 'popups-produit',
    titre: 'Popups fiche produit',
    champs: [],
  },
];

/** Récupère la définition complète d'une page du registre par son slug. */
export function getPageRegistre(slug: string): PageContenu | undefined {
  return REGISTRE_CONTENU.find((p) => p.slug === slug);
}

/** Construit un objet { cle: valeurParDefaut } pour une page, pratique comme filet de sécurité. */
export function getDefautsPage(slug: string): Record<string, string> {
  const page = getPageRegistre(slug);
  if (!page) return {};
  return page.champs.reduce((acc, champ) => {
    acc[champ.cle] = champ.defaut;
    return acc;
  }, {} as Record<string, string>);
}
