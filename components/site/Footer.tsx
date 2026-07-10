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
            <a href="https://www.instagram.com/nabe.bijoux/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@nabe.bijoux" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M16.6 3c.3 2 1.6 3.6 3.6 3.9v2.7c-1.3.1-2.6-.3-3.6-1v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .5 0 .8.1v2.8a2.6 2.6 0 1 0 2 2.5V3h2.6z" />
              </svg>
            </a>
          </div>
        </div>

        <details className="nabe-footer__colonne" open>
          <summary>Boutique</summary>
          <ul>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/collections">Nouveaut&eacute;s</Link></li>
            <li><Link href="/collections">Best-sellers</Link></li>
            <li><Link href="/sur-mesure">Sur mesure</Link></li>
            {journalActif && <li><Link href="/journal">Journal</Link></li>}
          </ul>
        </details>

        <details className="nabe-footer__colonne" open>
          <summary>&Agrave; propos</summary>
          <ul>
            <li><Link href="/la-maison">L&apos;Atelier</Link></li>
            <li><Link href="/mon-histoire">Mon histoire</Link></li>
            <li><Link href="/artisanat">Artisanat</Link></li>
            <li><Link href="/engagements">Engagements</Link></li>
          </ul>
        </details>

        <details className="nabe-footer__colonne" open>
          <summary>Aide</summary>
          <ul>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/suivi-commande">Suivre ma commande</Link></li>
            <li><Link href="/livraison-retours">Livraison &amp; retours</Link></li>
            <li><Link href="/paiement-securise">Paiement</Link></li>
            <li><Link href="/confidentialite">Confidentialit&eacute;</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </details>
      </div>

      <div className="nabe-footer__bas">
        <span>&copy; {new Date().getFullYear()} Nabe - Tous droits r&eacute;serv&eacute;s</span>
        <Link href="/mentions-legales">Mentions l&eacute;gales</Link>
        <Link href="/confidentialite">Confidentialit&eacute;</Link>
        <Link href="/cgv">CGV</Link>
      </div>
    </footer>
  );
}
