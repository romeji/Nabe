import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { REGISTRE_CONTENU } from '@/lib/registre-contenu';
import SelecteurPageContenu from '@/components/admin/SelecteurPageContenu';
import EditeurContenuClient from '@/components/admin/EditeurContenuClient';
import EditeurPolitiquesClient from '@/components/admin/EditeurPolitiquesClient';
import './contenu.css';

// Textes par défaut des popups de la fiche produit (Contact / Entretien / Livraison),
// utilisés tant que rien n'a encore été personnalisé depuis cet onglet.
const DEFAUTS_POLITIQUES: Record<string, { titre: string; contenu: string; ordre: number }> = {
  'contact-intro':      { titre: 'UNE QUESTION ?', contenu: 'Notre équipe est à votre service pour répondre à toutes vos demandes.', ordre: 0 },
  'contact-appeler':    { titre: 'NOUS APPELER', contenu: 'Notre équipe est disponible du lundi au samedi, de 10h à 19h.\n\nTéléphone : +33 (0)1 XX XX XX XX', ordre: 1 },
  'contact-ecrire':     { titre: 'NOUS ÉCRIRE', contenu: 'Nous vous invitons à nous écrire pour nous poser vos questions.\n\nEmail : contact@nabe-bijoux.fr', ordre: 2 },
  'entretien-intro':    { titre: "SERVICE D'ENTRETIEN", contenu: "Nos créations Nabe sont conçues à partir de matériaux délicats et d'exception. La Maison offre divers services afin de préserver leur beauté au fil du temps.", ordre: 10 },
  'entretien-service':  { titre: 'FAIRE UNE DEMANDE DE SERVICE', contenu: "Pour toute demande de service, nous vous invitons à nous contacter directement ou à déposer votre création dans notre boutique la plus proche afin d'y déposer votre création.", ordre: 11 },
  'entretien-eclat':    { titre: 'NOUVEL ÉCLAT', contenu: "Votre création joaillière peut se voir offrir une brillance nouvelle grâce à un nettoyage en douceur qui révèle l'éclat des premiers jours et efface les rayures superficielles.", ordre: 12 },
  'livraison-intro':    { titre: 'LIVRAISON', contenu: 'Les frais de livraison sont calculés selon le poids de votre commande et le mode choisi (Colissimo à domicile ou point relais Mondial Relay), affichés avant paiement. Délai de livraison : 2 à 4 jours ouvrés pour les bijoux en stock, 2 à 3 semaines pour les créations sur commande.', ordre: 20 },
  'livraison-retours':  { titre: 'RETOURS ET ÉCHANGES', contenu: "Vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour demander un retour ou un échange (voir nos Conditions Générales de Vente). Si votre commande n'a pas encore été expédiée, vous pouvez aussi l'annuler vous-même depuis la page Suivre ma commande.\n\nVeuillez noter que les créations personnalisées ou gravées ne sont pas éligibles pour retour ou échange.", ordre: 21 },
  'livraison-paiement': { titre: 'PAIEMENT', contenu: 'Nabe propose le paiement sécurisé par carte bancaire (Visa, Mastercard, American Express), via notre prestataire Stripe.\n\nToutes les transactions sont sécurisées et chiffrées.', ordre: 22 },
};

export default async function PageAdminContenu({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { page } = await searchParams;
  const slugActif = page || REGISTRE_CONTENU[0].slug;
  const pageRegistre = REGISTRE_CONTENU.find((p: any) => p.slug === slugActif) || REGISTRE_CONTENU[0];

  // Cas particulier : l'onglet "Popups fiche produit" utilise un système de données différent
  // (ContenuPolitique), avec son propre éditeur.
  if (pageRegistre.slug === 'popups-produit') {
    const enDb = await prisma.contenuPolitique.findMany({ orderBy: { ordre: 'asc' } });
    const politiques = Object.entries(DEFAUTS_POLITIQUES).map(([cle, defaut]) => {
      const db = enDb.find((i: any) => i.cle === cle);
      return { cle, titre: db?.titre ?? defaut.titre, contenu: db?.contenu ?? defaut.contenu, ordre: defaut.ordre };
    });

    return (
      <div className="admin-contenu">
        <div className="admin-entete">
          <h1>Contenu du site</h1>
        </div>
        <p className="admin-contenu__intro">
          Modifiez les textes affichés sur les pages publiques sans toucher au code. Chaque champ
          affiche le texte actuellement en ligne sur le site — vous pouvez le corriger ou le
          remplacer entièrement.
        </p>

        <SelecteurPageContenu pages={REGISTRE_CONTENU} slugActif={pageRegistre.slug} />

        <EditeurPolitiquesClient politiques={politiques} />
      </div>
    );
  }

  // Récupère ce qui est déjà enregistré en base pour cette page précise
  const enregistres = await prisma.contenuPage.findMany({ where: { page: pageRegistre.slug } });
  const valeursEnDb: Record<string, string> = {};
  enregistres.forEach((item: any) => (valeursEnDb[item.cle] = item.valeur));

  // Pré-remplit chaque champ : valeur en DB si elle existe et n'est pas vide, sinon le texte par défaut du code
  const valeursInitiales = pageRegistre.champs.reduce((acc: any, champ: any) => {
    const valeurDb = valeursEnDb[champ.cle];
    acc[champ.cle] = valeurDb && valeurDb.trim() !== '' ? valeurDb : champ.defaut;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="admin-contenu">
      <div className="admin-entete">
        <h1>Contenu du site</h1>
      </div>
      <p className="admin-contenu__intro">
        Modifiez les textes affichés sur les pages publiques sans toucher au code. Chaque champ
        affiche le texte actuellement en ligne sur le site — vous pouvez le corriger ou le
        remplacer entièrement.
      </p>

      <SelecteurPageContenu pages={REGISTRE_CONTENU} slugActif={pageRegistre.slug} />

      <EditeurContenuClient
        key={pageRegistre.slug}
        page={pageRegistre.slug}
        titrePage={pageRegistre.titre}
        champs={pageRegistre.champs}
        valeursInitiales={valeursInitiales}
      />
    </div>
  );
}
