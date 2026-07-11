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
        defaut: "Des bijoux façonnés à la main, inspirés par l'instant, la matière et le détail qui fait la différence.",
      },
      { cle: 'hero_bouton_1', label: 'Texte du 1er bouton (bandeau)', type: 'texte', defaut: 'Découvrir la collection' },
      { cle: 'hero_bouton_2', label: 'Texte du 2e bouton (bandeau)', type: 'texte', defaut: 'En savoir plus' },

      { cle: 'histoire_label', label: 'Étiquette section "Notre histoire"', type: 'texte', defaut: 'Artisanat au cœur' },
      {
        cle: 'histoire_texte',
        label: 'Texte section "Notre histoire"',
        type: 'texte_long',
        defaut:
          "Nabe est une maison de joaillerie artisanale née d'une passion pour la beauté et le travail bien fait. Chaque pièce est imaginée et façonnée avec soin dans notre atelier.",
      },
      { cle: 'histoire_lien', label: 'Texte du lien "Découvrir la maison"', type: 'texte', defaut: 'En savoir plus →' },

      { cle: 'collections_label', label: 'Étiquette section "Nos collections"', type: 'texte', defaut: 'Nos collections' },
      {
        cle: 'collections_vide',
        label: 'Message si aucun bijou mis en avant',
        type: 'texte',
        defaut: 'Ajoutez des bijoux « en avant » depuis le backoffice pour les afficher ici.',
      },

      { cle: 'temoignages_label', label: 'Étiquette section "Témoignages"', type: 'texte', defaut: 'Ils nous font confiance' },
      { cle: 'temoignages_titre', label: 'Titre section "Témoignages"', type: 'texte', defaut: 'Vos mots précieux' },

      { cle: 'newsletter_texte',
        label: 'Texte section "Newsletter"',
        type: 'texte_long',
        defaut: 'Recevez nos nouveautés, nos coulisses et des offres exclusives.',
      },
      { cle: 'newsletter_bouton', label: 'Texte du bouton "Newsletter"', type: 'texte', defaut: "Je m'inscris" },
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
    slug: 'artisanat',
    titre: 'Artisanat',
    champs: [
      { cle: 'hero_label', label: 'Étiquette du bandeau principal', type: 'texte', defaut: 'Artisanat' },
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Le geste au cœur du bijou.' },
      { cle: 'hero_soustitre', label: 'Sous-titre du bandeau principal', type: 'texte', defaut: 'Des pièces façonnées à la main, une à une, avec le temps et l’attention que mérite un bijou durable.' },
      { cle: 'intro_label', label: 'Étiquette introduction', type: 'texte', defaut: 'Savoir-faire' },
      { cle: 'intro_titre', label: 'Titre introduction', type: 'texte', defaut: 'Créer moins, mais créer mieux.' },
      { cle: 'intro_texte', label: 'Texte introduction', type: 'texte_long', defaut: 'Chaque bijou Nabe naît d’un dessin, d’une matière choisie et d’un travail patient. L’artisanat permet de garder un lien direct avec la pièce : ajuster une courbe, adoucir une finition, vérifier chaque détail avant qu’elle ne quitte l’atelier.' },
      { cle: 'bloc1_label', label: 'Étiquette bloc 1', type: 'texte', defaut: 'À la main' },
      { cle: 'bloc1_titre', label: 'Titre bloc 1', type: 'texte', defaut: 'Des gestes précis, appris et répétés.' },
      { cle: 'bloc1_texte', label: 'Texte bloc 1', type: 'texte_long', defaut: 'Mes études en joaillerie m’ont transmis le goût du geste juste : scier, limer, former, souder, émeriser, polir. Ces étapes ne sont pas seulement techniques, elles donnent au bijou sa présence et sa tenue dans le temps.' },
      { cle: 'bloc2_label', label: 'Étiquette bloc 2', type: 'texte', defaut: 'Petites séries' },
      { cle: 'bloc2_titre', label: 'Titre bloc 2', type: 'texte', defaut: 'Laisser une place à l’unique.' },
      { cle: 'bloc2_texte', label: 'Texte bloc 2', type: 'texte_long', defaut: 'Même lorsqu’un modèle revient, il garde une part vivante : une finition reprise à la main, une pierre choisie pour sa nuance, un équilibre légèrement ajusté. C’est cette attention qui donne de la valeur à la pièce.' },
      { cle: 'valeur1_titre', label: 'Valeur 1 — titre', type: 'texte', defaut: 'Temps' },
      { cle: 'valeur1_texte', label: 'Valeur 1 — texte', type: 'texte', defaut: 'Un bijou bien fait demande du temps, et ce temps se voit dans les finitions.' },
      { cle: 'valeur2_titre', label: 'Valeur 2 — titre', type: 'texte', defaut: 'Précision' },
      { cle: 'valeur2_texte', label: 'Valeur 2 — texte', type: 'texte', defaut: 'Chaque détail est contrôlé pour que la pièce soit agréable à porter.' },
      { cle: 'valeur3_titre', label: 'Valeur 3 — titre', type: 'texte', defaut: 'Durabilité' },
      { cle: 'valeur3_texte', label: 'Valeur 3 — texte', type: 'texte', defaut: 'Une création pensée pour accompagner longtemps, pas pour suivre une tendance rapide.' },
    ],
  },
  {
    slug: 'mon-histoire',
    titre: 'Mon histoire',
    champs: [
      { cle: 'hero_label', label: 'Étiquette du bandeau principal', type: 'texte', defaut: 'Mon histoire' },
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'De la passion à l’atelier.' },
      { cle: 'hero_soustitre', label: 'Sous-titre du bandeau principal', type: 'texte', defaut: 'Nabe est né d’une fascination pour la matière, les bijoux qui traversent les années et les gestes de joaillerie.' },
      { cle: 'intro_label', label: 'Étiquette introduction', type: 'texte', defaut: 'Parcours' },
      { cle: 'intro_titre', label: 'Titre introduction', type: 'texte', defaut: 'Une envie devenue métier.' },
      { cle: 'intro_texte', label: 'Texte introduction', type: 'texte_long', defaut: 'J’ai toujours été attirée par les objets qui portent une histoire. La joaillerie m’a donné un langage : celui du métal, de la lumière, du détail et de la patience. Mes études m’ont appris la rigueur, puis l’atelier m’a appris à faire confiance à la main.' },
      { cle: 'bloc1_label', label: 'Étiquette bloc 1', type: 'texte', defaut: 'Études' },
      { cle: 'bloc1_titre', label: 'Titre bloc 1', type: 'texte', defaut: 'Apprendre les bases, chercher sa voix.' },
      { cle: 'bloc1_texte', label: 'Texte bloc 1', type: 'texte_long', defaut: 'La formation en joaillerie m’a permis de comprendre la construction d’un bijou : le dessin, les volumes, les contraintes du métal, le respect des matières. C’est là que s’est affirmée mon envie de créer des pièces sincères, bien pensées et bien finies.' },
      { cle: 'bloc2_label', label: 'Étiquette bloc 2', type: 'texte', defaut: 'Nabe' },
      { cle: 'bloc2_titre', label: 'Titre bloc 2', type: 'texte', defaut: 'Des bijoux pour les histoires du quotidien.' },
      { cle: 'bloc2_texte', label: 'Texte bloc 2', type: 'texte_long', defaut: 'Je crée des bijoux que l’on garde près de soi : une bague portée tous les jours, un pendentif offert, une pièce choisie pour marquer un moment. Mon objectif est de proposer une qualité réelle, dans un univers doux, sensible et durable.' },
      { cle: 'valeur1_titre', label: 'Valeur 1 — titre', type: 'texte', defaut: 'Passion' },
      { cle: 'valeur1_texte', label: 'Valeur 1 — texte', type: 'texte', defaut: 'Créer par envie, avec une attention constante au détail.' },
      { cle: 'valeur2_titre', label: 'Valeur 2 — titre', type: 'texte', defaut: 'Transmission' },
      { cle: 'valeur2_texte', label: 'Valeur 2 — texte', type: 'texte', defaut: 'Faire vivre des gestes appris et les adapter à une esthétique actuelle.' },
      { cle: 'valeur3_titre', label: 'Valeur 3 — titre', type: 'texte', defaut: 'Émotion' },
      { cle: 'valeur3_texte', label: 'Valeur 3 — texte', type: 'texte', defaut: 'Imaginer des bijoux qui accompagnent une personne, pas seulement une tenue.' },
    ],
  },
  {
    slug: 'engagements',
    titre: 'Engagements',
    champs: [
      { cle: 'hero_label', label: 'Étiquette du bandeau principal', type: 'texte', defaut: 'Engagements' },
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Des matières choisies pour durer.' },
      { cle: 'hero_soustitre', label: 'Sous-titre du bandeau principal', type: 'texte', defaut: 'Argent 925, vermeil et finitions soignées : payer une pièce plus chère a du sens lorsqu’elle accompagne longtemps.' },
      { cle: 'intro_label', label: 'Étiquette introduction', type: 'texte', defaut: 'Valeurs' },
      { cle: 'intro_titre', label: 'Titre introduction', type: 'texte', defaut: 'Une autre idée de la valeur.' },
      { cle: 'intro_texte', label: 'Texte introduction', type: 'texte_long', defaut: 'Un bijou durable ne se résume pas à son apparence. Il dépend de la matière, de l’épaisseur, des finitions et du soin apporté à chaque étape. Je préfère proposer moins de pièces, mais des pièces que l’on peut aimer longtemps.' },
      { cle: 'bloc1_label', label: 'Étiquette bloc 1', type: 'texte', defaut: 'Argent 925 & vermeil' },
      { cle: 'bloc1_titre', label: 'Titre bloc 1', type: 'texte', defaut: 'Des matières nobles, pas des compromis.' },
      { cle: 'bloc1_texte', label: 'Texte bloc 1', type: 'texte_long', defaut: 'L’argent 925 et le vermeil permettent de créer des bijoux précieux, solides et réparables. Ce choix a un coût, mais il donne à la pièce une qualité tangible : un poids, une tenue, une patine possible, une vraie durée de vie.' },
      { cle: 'bloc2_label', label: 'Étiquette bloc 2', type: 'texte', defaut: 'Acheter moins' },
      { cle: 'bloc2_titre', label: 'Titre bloc 2', type: 'texte', defaut: 'Choisir une pièce qui reste.' },
      { cle: 'bloc2_texte', label: 'Texte bloc 2', type: 'texte_long', defaut: 'Je crois à l’achat réfléchi : préférer un bijou plus cher mais mieux fabriqué, plutôt qu’une accumulation de pièces qui s’abîment vite. C’est une démarche plus juste pour la personne qui le porte, pour l’atelier et pour la matière.' },
      { cle: 'valeur1_titre', label: 'Valeur 1 — titre', type: 'texte', defaut: 'Qualité' },
      { cle: 'valeur1_texte', label: 'Valeur 1 — texte', type: 'texte', defaut: 'Des matières et finitions choisies pour résister au quotidien.' },
      { cle: 'valeur2_titre', label: 'Valeur 2 — titre', type: 'texte', defaut: 'Justesse' },
      { cle: 'valeur2_texte', label: 'Valeur 2 — texte', type: 'texte', defaut: 'Un prix qui reflète le temps, la matière et le travail réel.' },
      { cle: 'valeur3_titre', label: 'Valeur 3 — titre', type: 'texte', defaut: 'Longévité' },
      { cle: 'valeur3_texte', label: 'Valeur 3 — texte', type: 'texte', defaut: 'Des bijoux pensés pour être portés, entretenus et gardés.' },
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
  return REGISTRE_CONTENU.find((p: any) => p.slug === slug);
}

/** Construit un objet { cle: valeurParDefaut } pour une page, pratique comme filet de sécurité. */
export function getDefautsPage(slug: string): Record<string, string> {
  const page = getPageRegistre(slug);
  if (!page) return {};
  return page.champs.reduce((acc: any, champ: any) => {
    acc[champ.cle] = champ.defaut;
    return acc;
  }, {} as Record<string, string>);
}
