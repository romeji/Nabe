import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FormulaireProduit from '@/components/admin/FormulaireProduit';
import BoutonSupprimerProduit from '@/components/admin/BoutonSupprimerProduit';

export default async function PageEditionProduit({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { ordre: 'asc' } } },
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
    pierre: produit.pierre,
    couleurPierreId: produit.couleurPierreId || '',
    delaiFabrication: produit.delaiFabrication || '',
    fabriqueEnFrance: produit.fabriqueEnFrance,
    tailleSurMesure: produit.tailleSurMesure,
    taillesDisponibles: produit.taillesDisponibles,
    disponibilite: produit.disponibilite,
    stock: produit.stock,
    actif: produit.actif,
    enAvant: produit.enAvant,
    images: produit.images.map((img) => ({ url: img.url, publicId: img.publicId || undefined, alt: img.alt || undefined })),
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
