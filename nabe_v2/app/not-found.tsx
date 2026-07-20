import Link from 'next/link';
import './not-found.css';

export const metadata = { title: 'Page introuvable' };

export default function NotFound() {
  return (
    <main className="page-404">
      <div className="page-404__carte">
        <p className="page-404__meme-haut">QUAND TU CHERCHES CETTE PAGE</p>

        <div className="page-404__illustration" aria-hidden="true">
          <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            {/* Loupe */}
            <circle cx="95" cy="95" r="55" fill="none" stroke="#9f5434" strokeWidth="10" />
            <line x1="134" y1="134" x2="185" y2="185" stroke="#9f5434" strokeWidth="14" strokeLinecap="round" />
            {/* Écrin vide */}
            <rect x="65" y="75" width="60" height="40" rx="4" fill="#f1e0cb" stroke="#7c4027" strokeWidth="3" />
            <path d="M65 90 L125 90" stroke="#7c4027" strokeWidth="2" />
            {/* Petits éclats / étoiles perdues */}
            <g fill="#b8923f">
              <circle cx="40" cy="40" r="4" />
              <circle cx="190" cy="60" r="3" />
              <circle cx="200" cy="150" r="4" />
              <circle cx="30" cy="170" r="3" />
            </g>
            {/* Visage confus sur l'écrin */}
            <circle cx="85" cy="98" r="3" fill="#2a1c14" />
            <circle cx="105" cy="98" r="3" fill="#2a1c14" />
            <path d="M85 108 Q95 103 105 108" stroke="#2a1c14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <p className="page-404__meme-bas">MAIS ELLE S&apos;EST FAIT LA MALLE AVEC LES BIJOUX</p>

        <h1>Erreur 404</h1>
        <p className="page-404__texte">
          Cette page a visiblement décidé de partir à l&apos;aventure sans laisser d&apos;adresse.
          Nos bijoux, eux, n&apos;ont pas bougé.
        </p>

        <div className="page-404__actions">
          <Link href="/" className="btn btn-primaire">Retour à l&apos;accueil</Link>
          <Link href="/collections" className="btn">Voir les collections</Link>
        </div>
      </div>
    </main>
  );
}
