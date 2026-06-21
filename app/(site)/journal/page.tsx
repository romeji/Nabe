import './journal.css';

export const metadata = { title: 'Journal' };

export default function PageJournal() {
  return (
    <div className="page-journal conteneur">
      <section className="journal-hero">
        <h1>Le Journal</h1>
        <p>Inspirations, coulisses de l'atelier et actualités de la maison Nabe.</p>
      </section>

      <div className="journal-vide">
        <p>
          Les premiers articles arrivent bientôt. Revenez prochainement pour découvrir les
          coulisses de l'atelier et nos inspirations.
        </p>
      </div>
    </div>
  );
}
