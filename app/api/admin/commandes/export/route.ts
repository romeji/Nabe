import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getConfigSite } from '@/lib/config-site';

/**
 * Export du livre des recettes au format CSV — utile en cas de contrôle
 * URSSAF/fiscal (obligation légale pour les micro-entrepreneurs de tenir un
 * registre chronologique des encaissements). Une ligne par commande payée,
 * avec toutes les colonnes attendues : date, numéro (pièce justificative),
 * client, nature de la prestation, mode de règlement, montants HT/TVA/TTC.
 *
 * Filtrable par période via ?debut=AAAA-MM-JJ&fin=AAAA-MM-JJ (pratique pour
 * sortir un mois, un trimestre ou une année civile complète).
 */
function echapperCsv(valeur: string): string {
  // Un champ contenant une virgule, un guillemet ou un retour à la ligne
  // doit être entouré de guillemets, et tout guillemet interne doublé —
  // règle standard du format CSV (RFC 4180), indispensable pour qu'Excel
  // ouvre le fichier sans décaler les colonnes sur un nom de client avec
  // une virgule par exemple.
  if (/[",\n]/.test(valeur)) {
    return `"${valeur.replace(/"/g, '""')}"`;
  }
  return valeur;
}

function formaterMontant(valeur: number): string {
  // Format numérique avec virgule décimale française, reconnu nativement
  // par Excel FR comme un nombre (pas comme du texte).
  return valeur.toFixed(2).replace('.', ',');
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const debut = searchParams.get('debut');
  const fin = searchParams.get('fin');

  const where: any = { statut: { notIn: ['ANNULEE', 'REMBOURSEE'] } };
  if (debut || fin) {
    where.createdAt = {};
    if (debut) where.createdAt.gte = new Date(`${debut}T00:00:00`);
    if (fin) where.createdAt.lte = new Date(`${fin}T23:59:59`);
  }

  const [commandes, config] = await Promise.all([
    prisma.commande.findMany({
      where,
      include: { lignes: true },
      orderBy: { createdAt: 'asc' },
    }),
    getConfigSite(),
  ]);

  const tvaApplicable = config.tva_applicable === 'true';
  const tvaTaux = parseFloat(config.tva_taux) || 20;

  const entetes = [
    'Date',
    'N° de commande',
    'Client',
    'Nature de la prestation',
    'Mode de règlement',
    tvaApplicable ? 'Montant HT (€)' : null,
    tvaApplicable ? 'TVA (€)' : null,
    'Montant encaissé TTC (€)',
  ].filter(Boolean) as string[];

  const lignesCsv = [entetes.join(';')];

  let totalEncaisse = 0;

  for (const commande of commandes) {
    const total = Number(commande.total);
    totalEncaisse += total;

    const nature = commande.lignes
      .map((l) => `${l.quantite} × ${l.nomProduit}${l.taille ? ` (taille ${l.taille})` : ''}`)
      .join(', ');

    const ligne = [
      new Date(commande.createdAt).toLocaleDateString('fr-FR'),
      commande.numero,
      commande.clientNom,
      nature,
      commande.modePaiementLabel || 'Carte bancaire',
    ];

    if (tvaApplicable) {
      const totalHT = total / (1 + tvaTaux / 100);
      const montantTva = total - totalHT;
      ligne.push(formaterMontant(totalHT), formaterMontant(montantTva));
    }

    ligne.push(formaterMontant(total));

    lignesCsv.push(ligne.map((v) => echapperCsv(String(v))).join(';'));
  }

  // Ligne de total en bas du tableau, pratique pour un pointage rapide.
  const ligneTotal = new Array(entetes.length).fill('');
  ligneTotal[0] = 'TOTAL';
  ligneTotal[entetes.length - 1] = formaterMontant(totalEncaisse);
  lignesCsv.push(ligneTotal.join(';'));

  // Le BOM UTF-8 (\uFEFF) est indispensable pour qu'Excel affiche
  // correctement les accents français à l'ouverture du fichier — sans lui,
  // Excel interprète le fichier en Latin-1 et affiche des caractères
  // corrompus sur "é", "à", etc.
  const contenu = '\uFEFF' + lignesCsv.join('\n');

  const nomFichier = `livre-des-recettes${debut ? `_${debut}` : ''}${fin ? `_a_${fin}` : ''}.csv`;

  return new NextResponse(contenu, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomFichier}"`,
    },
  });
}
