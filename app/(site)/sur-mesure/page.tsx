import { prisma } from '@/lib/prisma';
import { getContenuPage } from '@/lib/contenu';
import SurMesureFormulaire from '@/components/site/SurMesureFormulaire';
import './sur-mesure.css';

export const metadata = { title: 'Sur mesure' };
export const revalidate = 60;

export default async function PageSurMesure() {
  const [contenu, produits] = await Promise.all([
    getContenuPage('sur-mesure'),
    prisma.produit.findMany({
      where: { actif: true },
      include: { images: { orderBy: { ordre: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

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
          <h1>{contenu.hero_titre}</h1>
          <p>{contenu.hero_soustitre}</p>
          <span>{contenu.hero_texte}</span>
        </div>
      </section>

      <section className="surmesure-infos conteneur">
        <div className="surmesure-infos__item">
          <span className="surmesure-infos__icone">📅</span>
          <div>
            <h3>{contenu.precommande_titre}</h3>
            <p>{contenu.precommande_texte}</p>
          </div>
        </div>
        <div className="surmesure-infos__item">
          <span className="surmesure-infos__icone">💍</span>
          <div>
            <h3>{contenu.taille_titre}</h3>
            <p>{contenu.taille_texte}</p>
          </div>
        </div>
      </section>

      <SurMesureFormulaire
        produits={produitsSerialises}
        colonne1Titre={contenu.colonne1_titre}
        colonne1Texte={contenu.colonne1_texte}
        colonne2Titre={contenu.colonne2_titre}
        colonne2Texte={contenu.colonne2_texte}
      />
    </div>
  );
}
