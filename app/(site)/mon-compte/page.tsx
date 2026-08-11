import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authClientOptions } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import BoutonDeconnexionClient from '@/components/site/BoutonDeconnexionClient';
import './mon-compte.css';

export const metadata = { title: 'Mon compte' };

const CHEVRON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function IconeCommandes() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" strokeLinejoin="round" />
      <path d="M4 8.5 12 13l8-4.5M12 13v7" strokeLinejoin="round" />
    </svg>
  );
}

function IconeFavoris() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 20s-7-4.4-9.3-8.8C1.2 7.7 2.6 4.3 6 4.3c2 0 3.4 1.2 4.2 2.4.8-1.2 2.2-2.4 4.2-2.4 3.4 0 4.8 3.4 3.3 6.9C19 15.6 12 20 12 20Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconeAdresses() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.4" r="2.4" />
    </svg>
  );
}

function IconePaiement() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2.4" />
      <path d="M3 10.5h18" />
      <path d="M6.5 15h4" strokeLinecap="round" />
    </svg>
  );
}

function IconeProfil() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.5 20c1.4-3.8 4.5-5.7 7.5-5.7s6.1 1.9 7.5 5.7" strokeLinecap="round" />
    </svg>
  );
}

export default async function PageMonCompte() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) redirect('/connexion?redirect=/mon-compte');

  const clientId = (session.user as any).id as string;

  const [client, nombreFavoris, nombreCommandes, nombreAdresses] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.favori.count({ where: { clientId } }),
    prisma.commande.count({ where: { clientId } }),
    prisma.adressePostale.count({ where: { clientId } }),
  ]);

  const prenom = client?.nom?.split(' ')[0] || '';
  const initiale = (client?.nom || client?.email || '?').trim().charAt(0).toUpperCase();

  const cartes = [
    { href: '/mon-compte/commandes', icone: <IconeCommandes />, titre: 'Mes commandes', texte: `${nombreCommandes} commande${nombreCommandes !== 1 ? 's' : ''}` },
    { href: '/mon-compte/favoris', icone: <IconeFavoris />, titre: 'Mes favoris', texte: `${nombreFavoris} bijou${nombreFavoris !== 1 ? 'x' : ''}` },
    { href: '/mon-compte/adresses', icone: <IconeAdresses />, titre: 'Mes adresses', texte: `${nombreAdresses} adresse${nombreAdresses !== 1 ? 's' : ''}` },
    { href: '/mon-compte/paiement', icone: <IconePaiement />, titre: 'Mes moyens de paiement', texte: 'Gérer mes cartes' },
    { href: '/mon-compte/profil', icone: <IconeProfil />, titre: 'Mon profil', texte: 'Informations personnelles' },
  ];

  return (
    <div className="page-mon-compte conteneur">
      <div className="mon-compte__entete">
        <span className="mon-compte__avatar" aria-hidden="true">{initiale}</span>
        <div>
          <span className="mon-compte__eyebrow">Mon espace</span>
          <h1>
            Bonjour {prenom ? <em>{prenom}</em> : ''} 👋
          </h1>
          <p>{client?.email}</p>
        </div>
      </div>

      <div className="mon-compte__grille">
        {cartes.map((c) => (
          <Link key={c.href} href={c.href} className="mon-compte__carte">
            <span className="mon-compte__icone">{c.icone}</span>
            <span className="mon-compte__texte">
              <h3>{c.titre}</h3>
              <p>{c.texte}</p>
            </span>
            <span className="mon-compte__chevron">{CHEVRON}</span>
          </Link>
        ))}
      </div>

      <BoutonDeconnexionClient />
    </div>
  );
}
