import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAUTS_POLITIQUES: Record<string, { titre: string; contenu: string; ordre: number }> = {
  'contact-intro':      { titre: 'UNE QUESTION ?', contenu: 'Notre équipe est à votre service pour répondre à toutes vos demandes, que ce soit pour vous aider avec vos commandes, vous conseiller sur des créations ou vous suggérer des idées de cadeaux.', ordre: 0 },
  'contact-appeler':    { titre: 'NOUS APPELER', contenu: 'Notre équipe est disponible du lundi au samedi, de 10h à 19h.\n\nTéléphone : +33 (0)1 XX XX XX XX', ordre: 1 },
  'contact-ecrire':     { titre: 'NOUS ÉCRIRE', contenu: 'Nous vous invitons à nous écrire pour nous poser vos questions. Email : contact@nabe-bijoux.fr', ordre: 2 },
  'entretien-intro':    { titre: "SERVICE D'ENTRETIEN", contenu: "Nos créations Nabe sont conçues à partir de matériaux délicats et d'exception.", ordre: 10 },
  'entretien-service':  { titre: 'FAIRE UNE DEMANDE DE SERVICE', contenu: 'Pour toute demande de service, contactez-nous directement ou déposez votre création en boutique.', ordre: 11 },
  'entretien-eclat':    { titre: 'NOUVEL ÉCLAT', contenu: "Votre création peut se voir offrir une brillance nouvelle grâce à un nettoyage en douceur.", ordre: 12 },
  'livraison-intro':    { titre: 'LIVRAISON', contenu: 'La livraison est offerte pour toute commande. Délai : 3 à 5 jours ouvrés.', ordre: 20 },
  'livraison-retours':  { titre: 'RETOURS ET ÉCHANGES', contenu: "Retours et échanges offerts dans un délai de 30 jours à compter de la date de livraison.", ordre: 21 },
  'livraison-paiement': { titre: 'PAIEMENT', contenu: 'Paiement sécurisé par carte bancaire, PayPal ou virement.', ordre: 22 },
};

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section');

  const items = await prisma.contenuPolitique.findMany({
    where: section ? { cle: { startsWith: section } } : {},
    orderBy: { ordre: 'asc' },
  });

  const clesSection = Object.keys(DEFAUTS_POLITIQUES).filter(k => !section || k.startsWith(section));
  const resultat = clesSection.map(cle => {
    const enDb = items.find(i => i.cle === cle);
    if (enDb) return enDb;
    return { cle, ...DEFAUTS_POLITIQUES[cle], updatedAt: new Date() };
  }).sort((a, b) => a.ordre - b.ordre);

  return NextResponse.json(resultat);
}
