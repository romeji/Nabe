import Link from 'next/link';
import './not-found.css';

export const metadata = { title: 'Page introuvable' };

export default function NotFound() {
  return (
    <main className="page-404">
      <div className="page-404__carte">
        <p className="page-404__meme-haut">CETTE PAGE</p>

        <div className="page-404__illustration" aria-hidden="true">
          <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">
            {/* Sol */}
            <line x1="10" y1="176" x2="230" y2="176" stroke="#e3c9a3" strokeWidth="3" strokeLinecap="round" />

            {/* Coffre-fort, porte grande ouverte et vide */}
            <g>
              <rect x="18" y="90" width="72" height="86" rx="6" fill="#7c4027" />
              <rect x="26" y="98" width="56" height="70" rx="3" fill="#2a1c14" />
              {/* Porte ouverte, pivotée, qui se détache du coffre */}
              <g transform="translate(88,120) rotate(-38)">
                <rect x="0" y="-26" width="14" height="52" rx="3" fill="#9f5434" />
                <circle cx="7" cy="0" r="8" fill="none" stroke="#d9b273" strokeWidth="2.5" />
                <circle cx="7" cy="0" r="2" fill="#d9b273" />
              </g>
              <circle cx="54" cy="130" r="3" fill="#d9b273" />
            </g>

            {/* Sirène d'alarme au-dessus du coffre, en pleine ronde */}
            <g>
              <rect x="43" y="70" width="12" height="14" rx="2" fill="#9f5434" />
              <path d="M49 70 a10 10 0 0 1 0 -20 a10 10 0 0 1 0 20" fill="#e07a52" />
              <path d="M28 46 q21 -22 42 0" stroke="#e07a52" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
              <path d="M20 54 q29 -34 58 0" stroke="#e07a52" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
            </g>

            {/* Traînée de course + poussière derrière le diamant en fuite */}
            <g stroke="#cfa999" strokeWidth="3" strokeLinecap="round" opacity="0.7">
              <line x1="96" y1="150" x2="118" y2="150" />
              <line x1="100" y1="160" x2="124" y2="160" />
              <line x1="104" y1="170" x2="130" y2="170" />
            </g>

            {/* Le diamant en cavale, petit masque de bandit et baluchon de butin */}
            <g transform="translate(158,138)">
              {/* Baluchon en tissu noué, porté sur l'épaule */}
              <circle cx="-24" cy="-38" r="13" fill="#e07a52" />
              <path d="M-24 -49 q4 -6 9 -3" stroke="#7c4027" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <line x1="-13" y1="-46" x2="4" y2="-30" stroke="#7c4027" strokeWidth="3" strokeLinecap="round" />

              {/* Corps : diamant taillé */}
              <polygon points="0,-38 22,-14 0,34 -22,-14" fill="#d9b273" stroke="#b8923f" strokeWidth="2" />
              <polygon points="0,-38 22,-14 -22,-14" fill="#f0d9a8" />
              <polygon points="-22,-14 0,34 -8,-14" fill="#c9a15c" opacity="0.7" />
              <polygon points="22,-14 0,34 8,-14" fill="#e8c98a" opacity="0.6" />

              {/* Masque de bandit */}
              <path d="M-13 -22 q13 -9 26 0 q-2 6 -13 6 q-11 0 -13 -6z" fill="#3d2417" />
              <circle cx="-7" cy="-19" r="2" fill="#fffdfa" />
              <circle cx="7" cy="-19" r="2" fill="#fffdfa" />

              {/* Jambes en pleine course */}
              <path d="M-6 30 L-20 52" stroke="#3d2417" strokeWidth="4" strokeLinecap="round" />
              <path d="M6 30 L18 46" stroke="#3d2417" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Étincelles éparpillées */}
            <g fill="#b8923f">
              <circle cx="196" cy="60" r="3" />
              <circle cx="210" cy="98" r="2.5" />
              <circle cx="150" cy="40" r="2" />
            </g>
          </svg>
        </div>

        <p className="page-404__meme-bas">S&apos;EST FAIT LA MALLE AVEC LES BIJOUX</p>

        <h1>Erreur 404</h1>
        <p className="page-404__texte">
          Notre diamant le plus espiègle a profité d&apos;une porte entrouverte pour s&apos;évader avec
          le reste de la page. Le reste de la collection, elle, est bien restée sagement en vitrine.
        </p>

        <div className="page-404__actions">
          <Link href="/" className="btn btn-primaire">Retour à l&apos;accueil</Link>
          <Link href="/nos-bijoux" className="btn">Voir nos bijoux</Link>
        </div>
      </div>
    </main>
  );
}
