import { prisma } from '@/lib/prisma';
import SurMesureFormulaire from '@/components/site/SurMesureFormulaire';
import './sur-mesure.css';

export const metadata = { title: 'Sur mesure' };
export const revalidate = 60;

export default async function PageSurMesure() {
  const produits = await prisma.produit.findMany({
    where: { actif: true },
    include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const produitsSerialises = produits.map((p) => ({
    id: p.id,
    nom: p.nom,
    type: p.type,
    images: p.images.map((img) => ({ url: img.url })),
  }));

  return (
    <div className="page-sur-mesure">
      <section className="surmesure-hero">
        <div className="surmesure-hero__overlay" />
        <div className="surmesure-hero__contenu">
          <h1>Sur-mesure</h1>
          <p>Une création unique, pensée pour vous.</p>
          <span>Chaque bijou raconte une histoire. La vôtre mérite une attention toute particulière.</span>
        </div>
      </section>

      <section className="surmesure-infos conteneur">
        <div className="surmesure-infos__item">
          <span className="surmesure-infos__icone">📅</span>
          <div>
            <h3>Pré-commande</h3>
            <p>
              Une pré-commande pour une taille non disponible nécessite un délai approximatif d'un
              mois. En renseignant votre email, vous serez prévenu de la mise à disposition du
              modèle.
            </p>
          </div>
        </div>
        <div className="surmesure-infos__item">
          <span className="surmesure-infos__icone">💍</span>
          <div>
            <h3>Taille non disponible ?</h3>
            <p>
              Si une bague n'est pas disponible dans votre taille, je peux la réaliser sur demande,
              avec un délai de préparation d'environ deux mois et paiement en amont.
            </p>
          </div>
        </div>
      </section>

      <SurMesureFormulaire produits={produitsSerialises} />
    </div>
  );
}
