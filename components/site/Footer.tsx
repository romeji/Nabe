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
          <p>Tous droits réservés</p>
        </div>

        <div className="nabe-footer__colonne">
          <h4>Menu</h4>
          <ul>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/la-maison">L'Atelier</Link></li>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/sur-mesure">Sur mesure</Link></li>
            {journalActif && <li><Link href="/journal">Journal</Link></li>}
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="nabe-footer__colonne">
          <h4>Informations</h4>
          <ul>
            <li><Link href="/livraison-retours">Livraison &amp; Retours</Link></li>
            <li><Link href="/paiement-securise">Paiement sécurisé</Link></li>
            <li><Link href="/cgv">CGV</Link></li>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className="nabe-footer__colonne">
          <h4>Suivez-nous</h4>
          <ul>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">Pinterest</a></li>
          </ul>
        </div>
      </div>

      <div className="nabe-footer__bas">
        © {new Date().getFullYear()} Nabe — Tous droits réservés
      </div>
    </footer>
  );
}
