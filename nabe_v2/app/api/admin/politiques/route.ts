import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierSessionAdmin } from '@/lib/auth-helpers';

// Données par défaut pour les 3 popups
const DEFAUTS_POLITIQUES = [
  // Contact
  { cle: 'contact-intro', titre: 'UNE QUESTION ?', contenu: 'Notre équipe est à votre service pour répondre à toutes vos demandes, que ce soit pour vous aider avec vos commandes, vous conseiller sur des créations ou vous suggérer des idées de cadeaux.', ordre: 0 },
  { cle: 'contact-appeler', titre: 'NOUS APPELER', contenu: 'Notre équipe est disponible du lundi au samedi, de 10h à 19h.\n\nTéléphone : +33 (0)1 XX XX XX XX', ordre: 1 },
  { cle: 'contact-ecrire', titre: 'NOUS ÉCRIRE', contenu: 'Nous vous invitons à nous écrire pour nous poser vos questions. Nos conseillers sont à votre service pour répondre à votre demande sous 24h.\n\nEmail : contact@nabe-bijoux.fr', ordre: 2 },
  // Entretien
  { cle: 'entretien-intro', titre: "SERVICE D'ENTRETIEN", contenu: 'Nos créations Nabe sont conçues à partir de matériaux délicats et d\'exception. La Maison offre divers services afin de préserver leur beauté au fil du temps.', ordre: 10 },
  { cle: 'entretien-service', titre: 'FAIRE UNE DEMANDE DE SERVICE', contenu: 'Pour toute demande de service, nous vous invitons à nous contacter directement ou à déposer votre création dans notre boutique. Nous proposons également un service de collecte à domicile.', ordre: 11 },
  { cle: 'entretien-eclat', titre: 'NOUVEL ÉCLAT', contenu: 'Votre création joaillière peut se voir offrir une brillance nouvelle grâce à un nettoyage en douceur qui révèle l\'éclat des premiers jours et efface les rayures superficielles.', ordre: 12 },
  // Livraison
  { cle: 'livraison-intro', titre: 'LIVRAISON, RETOURS ET ÉCHANGES', contenu: 'La livraison est offerte pour toute commande. Nous livrons en France métropolitaine et dans de nombreux pays.\n\nDélai de livraison : 3 à 5 jours ouvrés pour les bijoux en stock, 2 à 3 semaines pour les créations sur commande.', ordre: 20 },
  { cle: 'livraison-retours', titre: 'RETOURS ET ÉCHANGES', contenu: 'Retours et échanges offerts pour les commandes passées en ligne, dans un délai de 30 jours à compter de la date de livraison. Le service de collecte à domicile est disponible.\n\nVeuillez noter que les créations personnalisées, gravées, endommagées ou perdues ne sont pas éligibles pour retour ou échange.', ordre: 21 },
  { cle: 'livraison-paiement', titre: 'PAIEMENT', contenu: 'Nabe propose différentes options de paiement sécurisé :\n\n• Carte bancaire (Visa, Mastercard, American Express)\n• PayPal\n• Virement bancaire\n\nToutes les transactions sont sécurisées et chiffrées.', ordre: 22 },
];

export async function GET(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const section = req.nextUrl.searchParams.get('section'); // 'contact' | 'entretien' | 'livraison'

  const items = await prisma.contenuPolitique.findMany({
    where: section ? { cle: { startsWith: section } } : {},
    orderBy: { ordre: 'asc' },
  });

  // Fusionner avec les défauts pour les clés manquantes
  const resultat = DEFAUTS_POLITIQUES
    .filter((d: any) => !section || d.cle.startsWith(section))
    .map((defaut: any) => {
      const enDb = items.find((i: any) => i.cle === defaut.cle);
      return enDb || { ...defaut, updatedAt: new Date() };
    });

  return NextResponse.json(resultat);
}

export async function PUT(req: NextRequest) {
  const session = await verifierSessionAdmin();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const items: Array<{ cle: string; titre: string; contenu: string; ordre: number }> = await req.json();

    await Promise.all(
      items.map((item: any) =>
        prisma.contenuPolitique.upsert({
          where: { cle: item.cle },
          create: { cle: item.cle, titre: item.titre, contenu: item.contenu, ordre: item.ordre ?? 0 },
          update: { titre: item.titre, contenu: item.contenu },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
