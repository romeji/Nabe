import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FormulaireProduit from '@/components/admin/FormulaireProduit';
import BoutonSupprimerProduit from '@/components/admin/BoutonSupprimerProduit';

export default async function PageEditionProduit({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { ordre: 'asc' } },
      pierres: { include: { pierre: true } },
      composeAvec: { orderBy: { ordre: 'asc' } },
      stockTailles: true,
    },
  });

  if (!produit) notFound();

  const produitInitial = {
    id: produit.id,
    nom: produit.nom,
    description: produit.description,
    prix: parseFloat(produit.prix.toString()),
    type: produit.type,
    categorieId: produit.categorieId || '',
    collectionId: produit.collectionId || '',
    matiereId: produit.matiereId || '',
    pierresIds: produit.pierres.map((pp: any) => pp.pierreId),
    delaiFabrication: produit.delaiFabrication || '',
    fabriqueEnFrance: produit.fabriqueEnFrance,
    tailleSurMesure: produit.tailleSurMesure,
    taillesDisponibles: produit.taillesDisponibles,
    disponibilite: produit.disponibilite,
    stock: produit.stock,
    stockParTaille: Object.fromEntries(produit.stockTailles.map((st: any) => [st.taille, st.quantite])),
    actif: produit.actif,
    enAvant: produit.enAvant,
    composerAvecActif: produit.composerAvecActif,
    composeAvecIds: produit.composeAvec.map((c: any) => c.produitSuggereId),
    images: produit.images.map((img: any) => ({ url: img.url, publicId: img.publicId || undefined, alt: img.alt || undefined })),
  };

  return (
    <div>
      <div className="admin-entete">
        <h1>Modifier « {produit.nom} »</h1>
        <BoutonSupprimerProduit produitId={produit.id} />
      </div>
      <FormulaireProduit produitInitial={produitInitial} />
    </div>
  );
}
