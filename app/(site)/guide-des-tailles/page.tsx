import Link from 'next/link';
import { getContenuPage } from '@/lib/contenu';
import TexteRiche from '@/components/site/TexteRiche';
import { TAILLES_BAGUES } from '@/lib/tailles';
import '../page-info.css';
import '@/components/site/guide-tailles.css';

export const metadata = { title: 'Guide des tailles' };

export default async function PageGuideTailles() {
  const c = await getContenuPage('guide-des-tailles');

  return (
    <div className="page-info">
      <div className="page-info__entete">
        <h1>{c.hero_titre}</h1>
        <TexteRiche html={c.hero_texte} />
      </div>

      <section className="page-info__section">
        <h2>{c.mesurer_titre}</h2>
        <TexteRiche html={c.mesurer_texte} />
      </section>

      <section className="page-info__section">
        <h2>{c.tableau_titre}</h2>
        <div className="guide-tailles__tableau-wrap">
          <table className="guide-tailles__tableau">
            <thead>
              <tr>
                <th>ISO / EU</th>
                <th>Circonf.</th>
                <th>Diamètre</th>
                <th>US</th>
                <th>UK</th>
                <th>IT</th>
              </tr>
            </thead>
            <tbody>
              {TAILLES_BAGUES.map((t: any) => (
                <tr key={t.iso}>
                  <td>{t.iso}</td>
                  <td>{t.circ}</td>
                  <td>{t.diam}</td>
                  <td>{t.us}</td>
                  <td>{t.uk}</td>
                  <td>{t.it}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-info__section">
        <h2>{c.faq_titre}</h2>
        <TexteRiche html={c.faq_texte} />
        <Link href="/sur-mesure" className="btn btn-primaire">{c.faq_bouton}</Link>
      </section>
    </div>
  );
}
