import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EditeurPolitiquesClient from './EditeurPolitiquesClient';

const DEFAUTS: Record<string, { titre: string; contenu: string; ordre: number }> = {
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

export default async function AdminPolitiquesPage() {
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  const enDb = await prisma.contenuPolitique.findMany({ orderBy: { ordre: 'asc' } });

  const politiques = Object.entries(DEFAUTS).map(([cle, defaut]) => {
    const db = enDb.find(i => i.cle === cle);
    return { cle, titre: db?.titre ?? defaut.titre, contenu: db?.contenu ?? defaut.contenu, ordre: defaut.ordre };
  });

  return <EditeurPolitiquesClient politiques={politiques} />;
}
