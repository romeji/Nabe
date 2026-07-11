import Image from 'next/image';
import Link from 'next/link';
import '../pages-marque.css';

export const metadata = { title: 'Engagements' };

const valeurs = [
  { icone: 'outils', titre: 'Artisanat', texte: 'Chaque bijou est fabriqué à la main avec savoir-faire et passion.' },
  { icone: 'soleil', titre: 'Durabilité', texte: 'Nous créons des bijoux faits pour durer, avec des matériaux de qualité.' },
  { icone: 'fleur', titre: 'Éthique', texte: 'Nous travaillons avec des fournisseurs sélectionnés avec soin et éthique.' },
  { icone: 'globe', titre: 'Transparence', texte: 'Nous vous partageons toutes les informations sur nos matériaux et pratiques.' },
];

const raisons = [
  { icone: 'boite', titre: 'Bijoux fabriqués à la commande' },
  { icone: 'soleil', titre: 'Moins de gaspillage' },
  { icone: 'carte', titre: 'Production raisonnée' },
  { icone: 'coeur', titre: 'Créations intemporelles' },
];

const stats = [
  ['100 %', 'Fabrication artisanale'],
  ['95 %', 'Clients satisfaits'],
  ['100 %', 'Contrôle qualité'],
  ['100 %', 'Passion'],
];

const questions = [
  'Comment fabriquez-vous les bijoux ?',
  'Pourquoi uniquement de petites séries ?',
  'Quels matériaux utilisez-vous ?',
  'Puis-je commander un bijou personnalisé ?',
];

export default function PageEngagements() {
  return (
    <main className="page-marque page-marque--engagements">
      <section className="marque-hero" style={{ backgroundImage: "url('/images/signature-bague.jpg')" }}>
        <div className="marque-hero__ombre" />
        <div className="marque-hero__contenu">
          <h1>Nos engagements</h1>
          <p>Créer de beaux bijoux</p>
          <p>sans compromis.</p>
        </div>
      </section>

      <section className="engagements-valeurs marque-section">
        <span className="marque-label">Nos valeurs</span>
        <div className="engagements-valeurs__grille">
          {valeurs.map((valeur: any) => (
            <article className="engagements-valeurs__carte" key={valeur.titre}>
              <span className={`marque-icone marque-icone--${valeur.icone}`} aria-hidden="true" />
              <h2>{valeur.titre}</h2>
              <p>{valeur.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="engagements-fabrication">
        <div className="engagements-fabrication__texte">
          <h2>Une fabrication responsable</h2>
          <p>
            Nos bijoux sont fabriqués à la commande, en petites séries,
            pour limiter la surproduction et le gaspillage.
          </p>
          <p>Nous privilégions les circuits courts et le savoir-faire local.</p>
          <Link href="/artisanat" className="marque-bouton">En savoir plus</Link>
        </div>
        <div className="engagements-fabrication__image">
          <Image src="/images/atelier-mains.jpg" alt="Bijou assemblé à la main" width={620} height={560} />
        </div>
      </section>

      <section className="marque-processus marque-section">
        <span className="marque-label">Pourquoi choisir Nabe ?</span>
        <div className="marque-processus__grille">
          {raisons.map((raison: any) => (
            <article className="marque-processus__item" key={raison.titre}>
              <span className={`marque-icone marque-icone--${raison.icone}`} aria-hidden="true" />
              <h3>{raison.titre}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="engagements-stats">
        {stats.map(([valeur, label]) => (
          <div key={label}>
            <strong>{valeur}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="engagements-faq marque-section">
        <span className="marque-label">Questions fréquentes</span>
        <div className="engagements-faq__liste">
          {questions.map((question: any) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>Chaque réponse dépend de la pièce choisie. Contactez l’atelier pour une information précise.</p>
            </details>
          ))}
        </div>
      </section>

      <section className="marque-cta marque-cta--sombre" style={{ backgroundImage: "url('/images/savoirfaire-inspiration.jpg')" }}>
        <div>
          <h2>Découvrez l’univers Nabe</h2>
          <p>Des bijoux artisanaux, intemporels et porteurs de sens.</p>
          <Link href="/collections" className="marque-bouton">Voir les collections</Link>
        </div>
      </section>
    </main>
  );
}
