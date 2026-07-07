import Link from 'next/link';
import { getConfigSite, configEstActive } from '@/lib/config-site';
import './footer.css';

export default async function Footer() {
  const config = await getConfigSite();
  const journalActif = configEstActive(config, 'journal_actif');

  return (
    <footer className="nabe-footer">
      <div className="nabe-footer__conteneur">
        <div className="nabe-footer__colonne nabe-footer__logo-col">
          <span className="nabe-footer__logo">Nabe</span>
          <p>L&apos;&eacute;clat de chaque histoire.</p>
          <div className="nabe-footer__sociaux" aria-label="Reseaux sociaux">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              Ig
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              P
            </a>
          </div>
        </div>

        <div className="nabe-footer__colonne">
          <h4>Boutique</h4>
          <ul>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/collections">Nouveaut&eacute;s</Link></li>
            <li><Link href="/collections">Best-sellers</Link></li>
            <li><Link href="/sur-mesure">Sur mesure</Link></li>
            {journalActif && <li><Link href="/journal">Journal</Link></li>}
          </ul>
        </div>

        <div className="nabe-footer__colonne">
          <h4>&Agrave; propos</h4>
          <ul>
            <li><Link href="/la-maison">L&apos;Atelier</Link></li>
            <li><Link href="/mon-histoire">Mon histoire</Link></li>
            <li><Link href="/artisanat">Artisanat</Link></li>
            <li><Link href="/engagements">Engagements</Link></li>
          </ul>
        </div>

        <div className="nabe-footer__colonne">
          <h4>Aide</h4>
          <ul>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/livraison-retours">Livraison &amp; retours</Link></li>
            <li><Link href="/paiement-securise">Paiement</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="nabe-footer__bas">
        <span>&copy; {new Date().getFullYear()} Nabe - Tous droits r&eacute;serv&eacute;s</span>
        <Link href="/mentions-legales">Mentions l&eacute;gales</Link>
        <Link href="/cgv">CGV</Link>
      </div>
    </footer>
  );
}
