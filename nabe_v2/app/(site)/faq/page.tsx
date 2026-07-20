import FaqAccordeon from '@/components/site/FaqAccordeon';
import '../page-info.css';

export const metadata = { title: 'FAQ' };

export default function PageFaq() {
  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>Foire aux questions</h1>
        <p>Retrouvez les réponses aux questions les plus fréquentes.</p>
      </div>

      <FaqAccordeon />

      <section className="page-info__section" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <h2>Vous n'avez pas trouvé votre réponse ?</h2>
        <p>
          Écrivez-nous via notre <a href="/contact">page Contact</a>, nous vous répondrons avec
          plaisir.
        </p>
      </section>
    </div>
  );
}
