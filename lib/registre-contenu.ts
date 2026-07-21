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
  type: 'texte' | 'texte_long' | 'image' | 'icone';
  defaut: string;
};

export type PageContenu = {
  slug: string;
  titre: string;
  champs: ChampContenu[];
};

// Icônes disponibles pour les sections "valeurs/qualités/engagements" des
// pages Mon histoire / Artisanat / Engagements — dessinées en CSS pur (voir
// pages-marque.css, classes .marque-icone--*), donc l'admin doit choisir
// parmi cette liste fixe plutôt que taper un nom libre ou uploader un
// fichier.
export const ICONES_DISPONIBLES = [
  'coeur', 'atelier', 'outils', 'bijou', 'soleil', 'outil',
  'fleur', 'globe', 'boite', 'carte', 'balance', 'bouclier',
] as const;

export const REGISTRE_CONTENU: PageContenu[] = [
  {
    slug: 'accueil',
    titre: 'Accueil',
    champs: [
      { cle: 'hero_image', label: 'Image du bandeau principal', type: 'image', defaut: '/images/hero-mains.jpg' },
      { cle: 'hero_logo', label: 'Texte du logo (bandeau principal)', type: 'texte', defaut: 'Nabe' },
      {
        cle: 'hero_soustitre',
        label: 'Sous-titre du bandeau principal',
        type: 'texte_long',
        defaut: "Des bijoux façonnés à la main, inspirés par l'instant, la matière et le détail qui fait la différence.",
      },
      { cle: 'hero_bouton_1', label: 'Texte du 1er bouton (bandeau)', type: 'texte', defaut: 'Découvrir la collection' },
      { cle: 'hero_bouton_2', label: 'Texte du 2e bouton (bandeau)', type: 'texte', defaut: 'En savoir plus' },

      { cle: 'histoire_image', label: 'Image section "Notre histoire"', type: 'image', defaut: '/images/atelier-mains.jpg' },
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
      { cle: 'parcours_image', label: 'Image section "Mon parcours"', type: 'image', defaut: '/images/croquis.jpg' },
      {
        cle: 'parcours_texte',
        label: 'Texte section "Mon parcours"',
        type: 'texte_long',
        defaut:
          "Depuis toujours fascinée par la beauté des matières et le travail manuel, j'ai suivi un parcours en joaillerie où j'ai appris les gestes anciens et les techniques de fabrication traditionnelles. Chaque bijou que je crée raconte une histoire, la vôtre, et reflète l'attention portée aux détails et à la qualité.",
      },

      { cle: 'savoirfaire_label', label: 'Étiquette section "L\'atelier"', type: 'texte', defaut: "L'atelier" },
      { cle: 'savoirfaire_titre', label: 'Titre section "L\'atelier"', type: 'texte', defaut: 'Un savoir-faire artisanal.' },
      { cle: 'savoirfaire_image', label: 'Image section "L\'atelier"', type: 'image', defaut: '/images/bague-atelier.jpg' },
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
      { cle: 'hero_image', label: 'Image du bandeau principal', type: 'image', defaut: '/images/atelier-mains.jpg' },
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'L\u2019art de cr\u00e9er avec passion.' },
      { cle: 'hero_texte', label: 'Texte du bandeau principal', type: 'texte_long', defaut: 'Chaque bijou est le fruit d\u2019un savoir-faire artisanal et d\u2019une attention m\u00e9ticuleuse \u00e0 chaque \u00e9tape.' },

      { cle: 'etapes_label', label: 'Titre section \u00e9tapes de fabrication', type: 'texte', defaut: 'Les \u00e9tapes de fabrication' },
      { cle: 'etape1_image', label: '\u00c9tape 1 \u2014 image', type: 'image', defaut: '/images/croquis.jpg' },
      { cle: 'etape1_titre', label: '\u00c9tape 1 \u2014 titre', type: 'texte', defaut: 'Inspiration' },
      { cle: 'etape1_texte', label: '\u00c9tape 1 \u2014 texte', type: 'texte_long', defaut: 'Tout commence par une id\u00e9e, une \u00e9motion, une histoire. Nous imaginons des bijoux intemporels et \u00e9l\u00e9gants.' },
      { cle: 'etape2_image', label: '\u00c9tape 2 \u2014 image', type: 'image', defaut: '/images/savoirfaire-creation.jpg' },
      { cle: 'etape2_titre', label: '\u00c9tape 2 \u2014 titre', type: 'texte', defaut: 'Croquis' },
      { cle: 'etape2_texte', label: '\u00c9tape 2 \u2014 texte', type: 'texte_long', defaut: 'Nos cr\u00e9ations prennent vie sur papier, o\u00f9 chaque d\u00e9tail est soigneusement pens\u00e9.' },
      { cle: 'etape3_image', label: '\u00c9tape 3 \u2014 image', type: 'image', defaut: '/images/signature-bague.jpg' },
      { cle: 'etape3_titre', label: '\u00c9tape 3 \u2014 titre', type: 'texte', defaut: 'S\u00e9lection des pierres' },
      { cle: 'etape3_texte', label: '\u00c9tape 3 \u2014 texte', type: 'texte_long', defaut: 'Nous s\u00e9lectionnons avec soin des pierres naturelles et perles de haute qualit\u00e9.' },
      { cle: 'etape4_image', label: '\u00c9tape 4 \u2014 image', type: 'image', defaut: '/images/atelier-mains.jpg' },
      { cle: 'etape4_titre', label: '\u00c9tape 4 \u2014 titre', type: 'texte', defaut: 'Fabrication' },
      { cle: 'etape4_texte', label: '\u00c9tape 4 \u2014 texte', type: 'texte_long', defaut: 'Chaque pi\u00e8ce est fa\u00e7onn\u00e9e \u00e0 la main par nos artisans dans notre atelier.' },
      { cle: 'etape5_image', label: '\u00c9tape 5 \u2014 image', type: 'image', defaut: '/images/savoirfaire-fabrication.jpg' },
      { cle: 'etape5_titre', label: '\u00c9tape 5 \u2014 titre', type: 'texte', defaut: 'Polissage' },
      { cle: 'etape5_texte', label: '\u00c9tape 5 \u2014 texte', type: 'texte_long', defaut: 'Nos bijoux sont polis avec soin pour r\u00e9v\u00e9ler tout leur \u00e9clat et leur finesse.' },
      { cle: 'etape6_image', label: '\u00c9tape 6 \u2014 image', type: 'image', defaut: '/images/bague-atelier.jpg' },
      { cle: 'etape6_titre', label: '\u00c9tape 6 \u2014 titre', type: 'texte', defaut: 'Contr\u00f4le qualit\u00e9' },
      { cle: 'etape6_texte', label: '\u00c9tape 6 \u2014 texte', type: 'texte_long', defaut: 'Chaque bijou est v\u00e9rifi\u00e9 minutieusement avant de vous \u00eatre exp\u00e9di\u00e9.' },

      { cle: 'materiaux_label', label: 'Titre section mat\u00e9riaux', type: 'texte', defaut: 'Des mat\u00e9riaux d\u2019exception' },
      { cle: 'materiau1_image', label: 'Mat\u00e9riau 1 \u2014 image', type: 'image', defaut: '/images/savoirfaire-fabrication.jpg' },
      { cle: 'materiau1_titre', label: 'Mat\u00e9riau 1 \u2014 titre', type: 'texte', defaut: 'Argent 925' },
      { cle: 'materiau1_texte', label: 'Mat\u00e9riau 1 \u2014 texte', type: 'texte', defaut: 'Un m\u00e9tal pr\u00e9cieux r\u00e9sistant et lumineux.' },
      { cle: 'materiau2_image', label: 'Mat\u00e9riau 2 \u2014 image', type: 'image', defaut: '/images/signature-bague.jpg' },
      { cle: 'materiau2_titre', label: 'Mat\u00e9riau 2 \u2014 titre', type: 'texte', defaut: 'Or 18 carats' },
      { cle: 'materiau2_texte', label: 'Mat\u00e9riau 2 \u2014 texte', type: 'texte', defaut: 'Un or de qualit\u00e9 pour des bijoux durables.' },
      { cle: 'materiau3_image', label: 'Mat\u00e9riau 3 \u2014 image', type: 'image', defaut: '/images/savoirfaire-inspiration.jpg' },
      { cle: 'materiau3_titre', label: 'Mat\u00e9riau 3 \u2014 titre', type: 'texte', defaut: 'Pierres naturelles' },
      { cle: 'materiau3_texte', label: 'Mat\u00e9riau 3 \u2014 texte', type: 'texte', defaut: 'S\u00e9lectionn\u00e9es pour leur beaut\u00e9 et leur \u00e9clat.' },
      { cle: 'materiau4_image', label: 'Mat\u00e9riau 4 \u2014 image', type: 'image', defaut: '/images/main-bague.jpg' },
      { cle: 'materiau4_titre', label: 'Mat\u00e9riau 4 \u2014 titre', type: 'texte', defaut: 'Perles' },
      { cle: 'materiau4_texte', label: 'Mat\u00e9riau 4 \u2014 texte', type: 'texte', defaut: 'Perles d\u2019eau douce aux reflets uniques.' },

      { cle: 'qualites_label', label: 'Titre section engagements qualit\u00e9', type: 'texte', defaut: 'Nos engagements qualit\u00e9' },
      { cle: 'qualite1_icone', label: 'Qualit\u00e9 1 \u2014 ic\u00f4ne', type: 'icone', defaut: 'fleur' },
      { cle: 'qualite1_titre', label: 'Qualit\u00e9 1 \u2014 titre', type: 'texte', defaut: 'Fait main' },
      { cle: 'qualite1_texte', label: 'Qualit\u00e9 1 \u2014 texte', type: 'texte', defaut: 'Chaque bijou est r\u00e9alis\u00e9 \u00e0 la main dans notre atelier.' },
      { cle: 'qualite2_icone', label: 'Qualit\u00e9 2 \u2014 ic\u00f4ne', type: 'icone', defaut: 'balance' },
      { cle: 'qualite2_titre', label: 'Qualit\u00e9 2 \u2014 titre', type: 'texte', defaut: 'Durable' },
      { cle: 'qualite2_texte', label: 'Qualit\u00e9 2 \u2014 texte', type: 'texte', defaut: 'Nous utilisons des mat\u00e9riaux de qualit\u00e9 et responsables.' },
      { cle: 'qualite3_icone', label: 'Qualit\u00e9 3 \u2014 ic\u00f4ne', type: 'icone', defaut: 'bouclier' },
      { cle: 'qualite3_titre', label: 'Qualit\u00e9 3 \u2014 titre', type: 'texte', defaut: 'Responsable' },
      { cle: 'qualite3_texte', label: 'Qualit\u00e9 3 \u2014 texte', type: 'texte', defaut: 'Nous privil\u00e9gions une production raisonn\u00e9e et \u00e9thique.' },
      { cle: 'qualite4_icone', label: 'Qualit\u00e9 4 \u2014 ic\u00f4ne', type: 'icone', defaut: 'soleil' },
      { cle: 'qualite4_titre', label: 'Qualit\u00e9 4 \u2014 titre', type: 'texte', defaut: 'Contr\u00f4l\u00e9' },
      { cle: 'qualite4_texte', label: 'Qualit\u00e9 4 \u2014 texte', type: 'texte', defaut: 'Chaque pi\u00e8ce est contr\u00f4l\u00e9e avec soin avant exp\u00e9dition.' },

      { cle: 'cta_image', label: 'Image du bandeau final', type: 'image', defaut: '/images/atelier-portrait.jpg' },
      { cle: 'cta_titre', label: 'Titre du bandeau final', type: 'texte', defaut: 'Chaque cr\u00e9ation est r\u00e9alis\u00e9e dans notre atelier.' },
      { cle: 'cta_texte', label: 'Texte du bandeau final', type: 'texte', defaut: 'Aucune production industrielle.' },
      { cle: 'cta_bouton', label: 'Bouton du bandeau final', type: 'texte', defaut: 'D\u00e9couvrir notre histoire' },
    ],
  },
  {
    slug: 'mon-histoire',
    titre: 'Mon histoire',
    champs: [
      { cle: 'hero_image', label: 'Image du bandeau principal', type: 'image', defaut: '/images/atelier-portrait.jpg' },
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Notre histoire' },
      { cle: 'hero_texte', label: 'Texte du bandeau principal', type: 'texte_long', defaut: 'Chaque bijou commence par une \u00e9motion.<br>Fabriqu\u00e9 \u00e0 la main dans notre atelier en France.' },
      { cle: 'hero_bouton', label: 'Bouton du bandeau principal', type: 'texte', defaut: 'D\u00e9couvrir l\u2019atelier' },

      { cle: 'vision_image', label: 'Image section vision', type: 'image', defaut: '/images/main-bague.jpg' },
      { cle: 'vision_label', label: '\u00c9tiquette section vision', type: 'texte', defaut: 'Notre vision' },
      { cle: 'vision_titre', label: 'Titre section vision', type: 'texte', defaut: 'Cr\u00e9er des bijoux qui traversent le temps.' },
      { cle: 'vision_texte', label: 'Texte section vision', type: 'texte_long', defaut: 'Nabe est n\u00e9e d\u2019une envie simple\u00a0: proposer des cr\u00e9ations artisanales, intemporelles et r\u00e9alis\u00e9es avec passion.<br><br>Chaque pi\u00e8ce est imagin\u00e9e, dessin\u00e9e puis fabriqu\u00e9e dans notre atelier.<br><br>Nous privil\u00e9gions les petites s\u00e9ries, les mat\u00e9riaux de qualit\u00e9 et le travail minutieux.' },

      { cle: 'frise_label', label: 'Titre section dates cl\u00e9s', type: 'texte', defaut: 'Notre histoire en quelques dates' },
      { cle: 'date1_icone', label: 'Date 1 \u2014 ic\u00f4ne', type: 'icone', defaut: 'coeur' },
      { cle: 'date1_titre', label: 'Date 1 \u2014 titre', type: 'texte', defaut: '2024' },
      { cle: 'date1_texte', label: 'Date 1 \u2014 texte', type: 'texte', defaut: 'Cr\u00e9ation de Nabe' },
      { cle: 'date2_icone', label: 'Date 2 \u2014 ic\u00f4ne', type: 'icone', defaut: 'atelier' },
      { cle: 'date2_titre', label: 'Date 2 \u2014 titre', type: 'texte', defaut: '100 %' },
      { cle: 'date2_texte', label: 'Date 2 \u2014 texte', type: 'texte', defaut: 'Fabrication artisanale' },
      { cle: 'date3_icone', label: 'Date 3 \u2014 ic\u00f4ne', type: 'icone', defaut: 'bijou' },
      { cle: 'date3_titre', label: 'Date 3 \u2014 titre', type: 'texte', defaut: 'Chaque bijou' },
      { cle: 'date3_texte', label: 'Date 3 \u2014 texte', type: 'texte', defaut: 'Fabriqu\u00e9 \u00e0 la commande' },
      { cle: 'date4_icone', label: 'Date 4 \u2014 ic\u00f4ne', type: 'icone', defaut: 'outil' },
      { cle: 'date4_titre', label: 'Date 4 \u2014 titre', type: 'texte', defaut: '1 atelier' },
      { cle: 'date4_texte', label: 'Date 4 \u2014 texte', type: 'texte', defaut: 'En France' },

      { cle: 'atelier_label', label: 'Titre section galerie atelier', type: 'texte', defaut: 'Notre atelier' },
      { cle: 'galerie1_image', label: 'Galerie \u2014 image 1', type: 'image', defaut: '/images/atelier-mains.jpg' },
      { cle: 'galerie2_image', label: 'Galerie \u2014 image 2', type: 'image', defaut: '/images/bague-atelier.jpg' },
      { cle: 'galerie3_image', label: 'Galerie \u2014 image 3', type: 'image', defaut: '/images/atelier-portrait.jpg' },
      { cle: 'galerie4_image', label: 'Galerie \u2014 image 4', type: 'image', defaut: '/images/savoirfaire-inspiration.jpg' },
      { cle: 'galerie5_image', label: 'Galerie \u2014 image 5', type: 'image', defaut: '/images/savoirfaire-fabrication.jpg' },

      { cle: 'citation_texte', label: 'Citation', type: 'texte_long', defaut: 'Nous ne fabriquons pas seulement des bijoux.<br>Nous cr\u00e9ons des souvenirs.' },

      { cle: 'cta_image', label: 'Image du bandeau final', type: 'image', defaut: '/images/signature-bague.jpg' },
      { cle: 'cta_label', label: '\u00c9tiquette du bandeau final', type: 'texte', defaut: 'D\u00e9couvrez notre univers' },
      { cle: 'cta_titre', label: 'Titre du bandeau final', type: 'texte', defaut: 'D\u00e9couvrez nos collections' },
      { cle: 'cta_bouton', label: 'Bouton du bandeau final', type: 'texte', defaut: 'Voir les bijoux' },
    ],
  },
  {
    slug: 'engagements',
    titre: 'Engagements',
    champs: [
      { cle: 'hero_image', label: 'Image du bandeau principal', type: 'image', defaut: '/images/signature-bague.jpg' },
      { cle: 'hero_titre', label: 'Titre du bandeau principal', type: 'texte', defaut: 'Nos engagements' },
      { cle: 'hero_texte', label: 'Texte du bandeau principal', type: 'texte_long', defaut: 'Cr\u00e9er de beaux bijoux<br>sans compromis.' },

      { cle: 'valeurs_label', label: 'Titre section valeurs', type: 'texte', defaut: 'Nos valeurs' },
      { cle: 'valeur1_icone', label: 'Valeur 1 \u2014 ic\u00f4ne', type: 'icone', defaut: 'outils' },
      { cle: 'valeur1_titre', label: 'Valeur 1 \u2014 titre', type: 'texte', defaut: 'Artisanat' },
      { cle: 'valeur1_texte', label: 'Valeur 1 \u2014 texte', type: 'texte', defaut: 'Chaque bijou est fabriqu\u00e9 \u00e0 la main avec savoir-faire et passion.' },
      { cle: 'valeur2_icone', label: 'Valeur 2 \u2014 ic\u00f4ne', type: 'icone', defaut: 'soleil' },
      { cle: 'valeur2_titre', label: 'Valeur 2 \u2014 titre', type: 'texte', defaut: 'Durabilit\u00e9' },
      { cle: 'valeur2_texte', label: 'Valeur 2 \u2014 texte', type: 'texte', defaut: 'Nous cr\u00e9ons des bijoux faits pour durer, avec des mat\u00e9riaux de qualit\u00e9.' },
      { cle: 'valeur3_icone', label: 'Valeur 3 \u2014 ic\u00f4ne', type: 'icone', defaut: 'fleur' },
      { cle: 'valeur3_titre', label: 'Valeur 3 \u2014 titre', type: 'texte', defaut: '\u00c9thique' },
      { cle: 'valeur3_texte', label: 'Valeur 3 \u2014 texte', type: 'texte', defaut: 'Nous travaillons avec des fournisseurs s\u00e9lectionn\u00e9s avec soin et \u00e9thique.' },
      { cle: 'valeur4_icone', label: 'Valeur 4 \u2014 ic\u00f4ne', type: 'icone', defaut: 'globe' },
      { cle: 'valeur4_titre', label: 'Valeur 4 \u2014 titre', type: 'texte', defaut: 'Transparence' },
      { cle: 'valeur4_texte', label: 'Valeur 4 \u2014 texte', type: 'texte', defaut: 'Nous vous partageons toutes les informations sur nos mat\u00e9riaux et pratiques.' },

      { cle: 'fabrication_image', label: 'Image section fabrication responsable', type: 'image', defaut: '/images/atelier-mains.jpg' },
      { cle: 'fabrication_titre', label: 'Titre section fabrication responsable', type: 'texte', defaut: 'Une fabrication responsable' },
      { cle: 'fabrication_texte', label: 'Texte section fabrication responsable', type: 'texte_long', defaut: 'Nos bijoux sont fabriqu\u00e9s \u00e0 la commande, en petites s\u00e9ries, pour limiter la surproduction et le gaspillage.<br><br>Nous privil\u00e9gions les circuits courts et le savoir-faire local.' },
      { cle: 'fabrication_bouton', label: 'Bouton section fabrication responsable', type: 'texte', defaut: 'En savoir plus' },

      { cle: 'raisons_label', label: 'Titre section \u00ab pourquoi choisir Nabe \u00bb', type: 'texte', defaut: 'Pourquoi choisir Nabe\u00a0?' },
      { cle: 'raison1_icone', label: 'Raison 1 \u2014 ic\u00f4ne', type: 'icone', defaut: 'boite' },
      { cle: 'raison1_titre', label: 'Raison 1 \u2014 titre', type: 'texte', defaut: 'Bijoux fabriqu\u00e9s \u00e0 la commande' },
      { cle: 'raison2_icone', label: 'Raison 2 \u2014 ic\u00f4ne', type: 'icone', defaut: 'soleil' },
      { cle: 'raison2_titre', label: 'Raison 2 \u2014 titre', type: 'texte', defaut: 'Moins de gaspillage' },
      { cle: 'raison3_icone', label: 'Raison 3 \u2014 ic\u00f4ne', type: 'icone', defaut: 'carte' },
      { cle: 'raison3_titre', label: 'Raison 3 \u2014 titre', type: 'texte', defaut: 'Production raisonn\u00e9e' },
      { cle: 'raison4_icone', label: 'Raison 4 \u2014 ic\u00f4ne', type: 'icone', defaut: 'coeur' },
      { cle: 'raison4_titre', label: 'Raison 4 \u2014 titre', type: 'texte', defaut: 'Cr\u00e9ations intemporelles' },

      { cle: 'stat1_valeur', label: 'Statistique 1 \u2014 valeur', type: 'texte', defaut: '100 %' },
      { cle: 'stat1_label', label: 'Statistique 1 \u2014 libell\u00e9', type: 'texte', defaut: 'Fabrication artisanale' },
      { cle: 'stat2_valeur', label: 'Statistique 2 \u2014 valeur', type: 'texte', defaut: '95 %' },
      { cle: 'stat2_label', label: 'Statistique 2 \u2014 libell\u00e9', type: 'texte', defaut: 'Clients satisfaits' },
      { cle: 'stat3_valeur', label: 'Statistique 3 \u2014 valeur', type: 'texte', defaut: '100 %' },
      { cle: 'stat3_label', label: 'Statistique 3 \u2014 libell\u00e9', type: 'texte', defaut: 'Contr\u00f4le qualit\u00e9' },
      { cle: 'stat4_valeur', label: 'Statistique 4 \u2014 valeur', type: 'texte', defaut: '100 %' },
      { cle: 'stat4_label', label: 'Statistique 4 \u2014 libell\u00e9', type: 'texte', defaut: 'Passion' },

      { cle: 'faq_label', label: 'Titre section FAQ', type: 'texte', defaut: 'Questions fr\u00e9quentes' },
      { cle: 'faq1_question', label: 'FAQ 1 \u2014 question', type: 'texte', defaut: 'Comment fabriquez-vous les bijoux\u00a0?' },
      { cle: 'faq1_reponse', label: 'FAQ 1 \u2014 r\u00e9ponse', type: 'texte_long', defaut: 'Chaque bijou est fa\u00e7onn\u00e9 \u00e0 la main dans notre atelier, du dessin jusqu\u2019aux finitions\u00a0: sciage, soudure, polissage et contr\u00f4le qualit\u00e9.' },
      { cle: 'faq2_question', label: 'FAQ 2 \u2014 question', type: 'texte', defaut: 'Pourquoi uniquement de petites s\u00e9ries\u00a0?' },
      { cle: 'faq2_reponse', label: 'FAQ 2 \u2014 r\u00e9ponse', type: 'texte_long', defaut: 'Les petites s\u00e9ries nous permettent de garder un contr\u00f4le qualit\u00e9 rigoureux sur chaque pi\u00e8ce et de limiter le gaspillage li\u00e9 \u00e0 la surproduction.' },
      { cle: 'faq3_question', label: 'FAQ 3 \u2014 question', type: 'texte', defaut: 'Quels mat\u00e9riaux utilisez-vous\u00a0?' },
      { cle: 'faq3_reponse', label: 'FAQ 3 \u2014 r\u00e9ponse', type: 'texte_long', defaut: 'Nous travaillons principalement l\u2019argent 925 et le vermeil, compl\u00e9t\u00e9s de pierres naturelles s\u00e9lectionn\u00e9es avec soin.' },
      { cle: 'faq4_question', label: 'FAQ 4 \u2014 question', type: 'texte', defaut: 'Puis-je commander un bijou personnalis\u00e9\u00a0?' },
      { cle: 'faq4_reponse', label: 'FAQ 4 \u2014 r\u00e9ponse', type: 'texte_long', defaut: 'Oui, nous proposons un service sur-mesure. Rendez-vous sur notre page Sur-mesure pour nous transmettre votre demande.' },

      { cle: 'cta_image', label: 'Image du bandeau final', type: 'image', defaut: '/images/savoirfaire-inspiration.jpg' },
      { cle: 'cta_titre', label: 'Titre du bandeau final', type: 'texte', defaut: 'D\u00e9couvrez l\u2019univers Nabe' },
      { cle: 'cta_texte', label: 'Texte du bandeau final', type: 'texte', defaut: 'Des bijoux artisanaux, intemporels et porteurs de sens.' },
      { cle: 'cta_bouton', label: 'Bouton du bandeau final', type: 'texte', defaut: 'Voir les collections' },
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
    slug: 'guide-des-tailles',
    titre: 'Guide des tailles',
    champs: [
      { cle: 'hero_titre', label: 'Titre principal', type: 'texte', defaut: 'Guide des tailles de bagues' },
      { cle: 'hero_texte', label: 'Texte d\u2019introduction', type: 'texte_long', defaut: '<p>Trouver la bonne taille est essentiel pour porter votre bague avec confort, au quotidien. Voici comment la déterminer facilement, et notre tableau de conversion complet.</p>' },
      { cle: 'mesurer_titre', label: 'Section \u00ab Comment mesurer \u00bb \u2014 titre', type: 'texte', defaut: 'Comment mesurer votre taille ?' },
      { cle: 'mesurer_texte', label: 'Section \u00ab Comment mesurer \u00bb \u2014 texte', type: 'texte_long', defaut: '<p>Prenez un fil ou une bande de papier fine, enroulez-le autour de la base de votre doigt, puis marquez l\u2019endroit où les deux extrémités se rejoignent. Mesurez cette longueur en millimètres avec une règle : c\u2019est votre circonférence. Comparez-la ensuite au tableau ci-dessous.</p><p>Astuce : mesurez en fin de journée, lorsque vos doigts sont le plus naturellement dilatés, et évitez de mesurer par temps froid.</p>' },
      { cle: 'tableau_titre', label: 'Titre du tableau de conversion', type: 'texte', defaut: 'Tableau de conversion des tailles' },
      { cle: 'faq_titre', label: 'Section \u00ab taille indisponible \u00bb \u2014 titre', type: 'texte', defaut: 'Je ne trouve pas ma taille, que faire ?' },
      { cle: 'faq_texte', label: 'Section \u00ab taille indisponible \u00bb \u2014 texte', type: 'texte_long', defaut: '<p>Si une bague n\u2019est pas disponible dans votre taille, contactez-nous pour une pré-commande : nous pouvons la réaliser spécialement pour vous.</p>' },
      { cle: 'faq_bouton', label: 'Bouton de pr\u00e9-commande', type: 'texte', defaut: 'Faire une demande de pré-commande' },
    ],
  },
  {
    slug: 'entretien-bijoux',
    titre: 'Entretien des bijoux',
    champs: [
      { cle: 'hero_titre', label: 'Titre principal', type: 'texte', defaut: 'Entretenir vos bijoux Nabe' },
      { cle: 'hero_texte', label: 'Texte d\u2019introduction', type: 'texte_long', defaut: '<p>Un bijou bien entretenu traverse les années sans perdre de son éclat. Voici nos conseils pour préserver la beauté de vos créations Nabe au quotidien.</p>' },

      { cle: 'conseil1_icone', label: 'Conseil 1 \u2014 ic\u00f4ne', type: 'icone', defaut: 'bijou' },
      { cle: 'conseil1_titre', label: 'Conseil 1 \u2014 titre', type: 'texte', defaut: 'Argent 925' },
      { cle: 'conseil1_texte', label: 'Conseil 1 \u2014 texte', type: 'texte_long', defaut: '<p>L\u2019argent peut légèrement ternir au contact de l\u2019air et de l\u2019humidité. Nettoyez-le régulièrement avec un chiffon doux et sec, ou un chiffon spécial argenterie. Évitez le contact avec le chlore, les parfums et les crèmes.</p>' },

      { cle: 'conseil2_icone', label: 'Conseil 2 \u2014 ic\u00f4ne', type: 'icone', defaut: 'soleil' },
      { cle: 'conseil2_titre', label: 'Conseil 2 \u2014 titre', type: 'texte', defaut: 'Vermeil & or' },
      { cle: 'conseil2_texte', label: 'Conseil 2 \u2014 texte', type: 'texte_long', defaut: '<p>Évitez les frottements avec des surfaces dures et retirez vos bijoux avant la douche, la piscine ou le sport. Rangez-les à l\u2019abri de la lumière directe pour préserver leur dorure.</p>' },

      { cle: 'conseil3_icone', label: 'Conseil 3 \u2014 ic\u00f4ne', type: 'icone', defaut: 'fleur' },
      { cle: 'conseil3_titre', label: 'Conseil 3 \u2014 titre', type: 'texte', defaut: 'Pierres naturelles' },
      { cle: 'conseil3_texte', label: 'Conseil 3 \u2014 texte', type: 'texte_long', defaut: '<p>Évitez les chocs et les produits chimiques (parfum, laque, produits ménagers). Nettoyez délicatement à l\u2019eau tiède savonneuse avec une brosse très souple, puis séchez avec un chiffon doux.</p>' },

      { cle: 'conseil4_icone', label: 'Conseil 4 \u2014 ic\u00f4ne', type: 'icone', defaut: 'coeur' },
      { cle: 'conseil4_titre', label: 'Conseil 4 \u2014 titre', type: 'texte', defaut: 'Au quotidien' },
      { cle: 'conseil4_texte', label: 'Conseil 4 \u2014 texte', type: 'texte_long', defaut: '<p>Mettez vos bijoux en dernier, après le maquillage et le parfum. Retirez-les avant de dormir, de faire du sport ou des tâches ménagères. Rangez-les séparément pour éviter les rayures entre eux.</p>' },

      { cle: 'cta_titre', label: 'Titre du bandeau final', type: 'texte', defaut: 'Une question sur l\u2019entretien de votre bijou ?' },
      { cle: 'cta_bouton', label: 'Bouton du bandeau final', type: 'texte', defaut: 'Nous contacter' },
    ],
  },
  {
    // Emails transactionnels envoyés automatiquement (inscription, commande,
    // mot de passe...). Seuls le sujet et le message d'accueil sont
    // éditables : les éléments structurels (tableau des articles, bouton de
    // réinitialisation, avertissements de sécurité) restent fixes pour ne
    // jamais casser un lien ou une information essentielle. Le sujet peut
    // contenir {numero} ou {prenom}, remplacé automatiquement par la vraie
    // valeur à l'envoi.
    slug: 'emails',
    titre: 'E-mails automatiques',
    champs: [
      { cle: 'inscription_sujet', label: 'Bienvenue (création de compte) — Sujet', type: 'texte', defaut: 'Bienvenue chez Nabe' },
      { cle: 'inscription_message', label: 'Bienvenue (création de compte) — Message', type: 'texte_long', defaut: "<p>Votre compte a bien été créé. Vous pouvez désormais suivre vos commandes, gérer vos favoris et vos informations depuis votre espace client.</p><p>À très vite,<br/>L'équipe Nabe</p>" },

      { cle: 'newsletter_sujet', label: 'Bienvenue newsletter — Sujet', type: 'texte', defaut: "Bienvenue dans l'univers Nabe ✨" },
      { cle: 'newsletter_message', label: 'Bienvenue newsletter — Message', type: 'texte_long', defaut: '<p>Merci de nous rejoindre. Vous serez parmi les premiers informés de nos nouvelles créations, de nos collections exclusives et de nos événements.</p><p>Avec élégance,<br/>L\u2019équipe Nabe</p>' },

      { cle: 'popup_surprise_sujet', label: 'Code de bienvenue (popup) — Sujet', type: 'texte', defaut: '{prenom}, votre surprise Nabe vous attend 🎁' },
      { cle: 'popup_surprise_message', label: 'Code de bienvenue (popup) — Message', type: 'texte_long', defaut: "<p>Merci de rejoindre l'univers Nabe. Voici votre code de réduction, valable sur votre prochaine commande :</p>" },

      { cle: 'commande_confirmee_sujet', label: 'Confirmation de commande — Sujet', type: 'texte', defaut: 'Commande {numero} confirmée — Nabe' },
      { cle: 'commande_confirmee_message', label: 'Confirmation de commande — Message', type: 'texte_long', defaut: '<p>Votre commande <strong>{numero}</strong> est confirmée et va être préparée avec soin.</p>' },

      { cle: 'commande_expediee_sujet', label: 'Commande expédiée — Sujet', type: 'texte', defaut: 'Commande {numero} expédiée — Nabe' },
      { cle: 'commande_expediee_message', label: 'Commande expédiée — Message', type: 'texte_long', defaut: "<p>Votre commande vient d'être expédiée et est en chemin vers vous.</p>" },

      { cle: 'commande_annulee_sujet', label: 'Commande annulée/remboursée — Sujet', type: 'texte', defaut: 'Commande {numero} annulée — Nabe' },
      { cle: 'commande_annulee_message', label: 'Commande annulée/remboursée — Message', type: 'texte_long', defaut: "<p>Nous vous informons que votre commande a été annulée.</p>" },

      { cle: 'mdp_reinit_sujet', label: 'Demande de réinitialisation mot de passe — Sujet', type: 'texte', defaut: 'Reinitialiser votre mot de passe Nabe' },
      { cle: 'mdp_reinit_message', label: 'Demande de réinitialisation mot de passe — Message', type: 'texte_long', defaut: 'Vous avez demande a reinitialiser le mot de passe de votre compte Nabe.' },

      { cle: 'mdp_modifie_sujet', label: 'Confirmation mot de passe modifié — Sujet', type: 'texte', defaut: 'Votre mot de passe Nabe a ete modifie' },
      { cle: 'mdp_modifie_message', label: 'Confirmation mot de passe modifié — Message', type: 'texte_long', defaut: "<p>Nous confirmons que le mot de passe de votre compte Nabe vient d'etre modifie.</p><p>Si vous n'etes pas a l'origine de cette action, contactez-nous immediatement en repondant a cet e-mail.</p>" },

      { cle: 'suppression_sujet', label: 'Confirmation de suppression de compte — Sujet', type: 'texte', defaut: 'Confirmation de suppression de votre compte Nabe' },
      { cle: 'suppression_message', label: 'Confirmation de suppression de compte — Message', type: 'texte_long', defaut: "<p>Nous confirmons la suppression de votre compte Nabe, comme vous l'avez demandé.</p><p>Vos informations personnelles ont été supprimées de nos systèmes.</p><p>Vous pouvez recréer un compte à tout moment si vous changez d'avis.</p>" },

      { cle: 'vente_sujet', label: 'Notification de vente (vous) — Sujet', type: 'texte', defaut: '💰 Nouvelle vente — {numero} ({montant} €)' },
      { cle: 'vente_message', label: 'Notification de vente (vous) — Note en tête', type: 'texte_long', defaut: "Une nouvelle commande vient d'être payée :" },

      { cle: 'probleme_sujet', label: 'Signalement de problème (vous) — Sujet', type: 'texte', defaut: '⚠️ Signalement de problème — {sujet}' },
      { cle: 'probleme_message', label: 'Signalement de problème (vous) — Note en tête', type: 'texte_long', defaut: 'Ce message a été envoyé via le bouton "Signaler un problème" depuis une commande.' },
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
