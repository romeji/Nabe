'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import './panneau-navigation.css';

type ItemSimple = { id: string; nom: string; slug: string };
type CategorieItem = ItemSimple & { logoAccueil?: string | null; image?: string | null };

type MenuConfig = {
  categoriesActif: boolean;
  collectionsActif: boolean;
  pagesActif: boolean;
  aideActif: boolean;
};

const iconesCategories = ['bagues', 'colliers', 'boucles', 'bracelets', 'diamant', 'cadeau'];

// Icône chevron utilisée pour les accordéons (repliés par défaut) qui
// remplacent les longues listes de liens toujours visibles.
function ChevronAccordeon({ ouvert }: { ouvert: boolean }) {
  return (
    <svg
      className={`panneau-nav__chevron${ouvert ? ' panneau-nav__chevron--ouvert' : ''}`}
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function PanneauNavigation({
  ouvert,
  onFermer,
}: {
  ouvert: boolean;
  onFermer: () => void;
}) {
  const [categories, setCategories] = useState<CategorieItem[]>([]);
  const [collections, setCollections] = useState<ItemSimple[]>([]);
  const [journalActif, setJournalActif] = useState(false);
  const [menu, setMenu] = useState<MenuConfig>({
    categoriesActif: true,
    collectionsActif: true,
    pagesActif: true,
    aideActif: true,
  });
  const [monte, setMonte] = useState(false);
  // Un seul accordéon ouvert à la fois : 'decouvrir' (catégories + collections)
  // ou 'infos' (à propos + aide). Les deux sont repliés par défaut pour que
  // le menu tienne sur un écran sans scroller.
  const [sectionOuverte, setSectionOuverte] = useState<'collections' | 'decouvrir' | 'infos' | null>(null);
  const { data: session } = useSession();

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (!ouvert) return;

    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowInitial;
    };
  }, [ouvert]);

  // Le menu repart replié à chaque nouvelle ouverture.
  useEffect(() => {
    if (ouvert) setSectionOuverte(null);
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return;

    function fermerAvecEchap(e: KeyboardEvent) {
      if (e.key === 'Escape') onFermer();
    }

    window.addEventListener('keydown', fermerAvecEchap);
    return () => window.removeEventListener('keydown', fermerAvecEchap);
  }, [ouvert, onFermer]);

  useEffect(() => {
    if (!ouvert) return;

    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setCollections(data.collections || []);
        setJournalActif(!!data.journalActif);
        setMenu((actuel) => ({ ...actuel, ...(data.menu || {}) }));
      })
      .catch(() => {});
  }, [ouvert]);

  if (!ouvert || !monte) return null;

  function basculer(section: 'collections' | 'decouvrir' | 'infos') {
    setSectionOuverte((actuelle) => (actuelle === section ? null : section));
  }

  const aInfos = menu.pagesActif || menu.aideActif;

  return createPortal(
    <div className="panneau-nav__overlay" role="presentation" onClick={onFermer}>
      <div className="panneau-nav" onClick={(e) => e.stopPropagation()}>
        <div className="panneau-nav__entete">
          <button className="panneau-nav__fermer" onClick={onFermer} aria-label="Fermer le menu">
            &times;
          </button>
        </div>

        <div className="panneau-nav__corps">
          {/* Lien principal, toujours visible */}
          <Link href="/nos-bijoux" className="panneau-nav__lien-principal" onClick={onFermer}>
            Nos bijoux
          </Link>
          <Link href="/sur-mesure" className="panneau-nav__lien-principal" onClick={onFermer}>
            Sur mesure
          </Link>

          {/* Accordéon "Nos collections" (gammes petit / moyen / haut de
              gamme à terme), replié par défaut comme les autres. */}
          {menu.collectionsActif && collections.length > 0 && (
            <section className="panneau-nav__accordeon">
              <button
                className="panneau-nav__accordeon-entete"
                onClick={() => basculer('collections')}
                aria-expanded={sectionOuverte === 'collections'}
              >
                <span>Nos collections</span>
                <ChevronAccordeon ouvert={sectionOuverte === 'collections'} />
              </button>

              {sectionOuverte === 'collections' && (
                <div className="panneau-nav__accordeon-corps">
                  {collections.map((c: any) => (
                    <Link key={c.id} href={`/nos-bijoux?collection=${c.slug}`} className="panneau-nav__lien" onClick={onFermer}>
                      <span>{c.nom}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Accordéon : catégories, repliées par défaut */}
          {menu.categoriesActif && categories.length > 0 && (
            <section className="panneau-nav__accordeon">
              <button
                className="panneau-nav__accordeon-entete"
                onClick={() => basculer('decouvrir')}
                aria-expanded={sectionOuverte === 'decouvrir'}
              >
                <span>Découvrir par catégorie</span>
                <ChevronAccordeon ouvert={sectionOuverte === 'decouvrir'} />
              </button>

              {sectionOuverte === 'decouvrir' && (
                <div className="panneau-nav__accordeon-corps">
                  {categories.map((c: any, index: number) => {
                    const logo = c.logoAccueil || c.image;
                    return (
                      <Link key={c.id} href={`/nos-bijoux?categorie=${c.slug}`} className="panneau-nav__lien panneau-nav__lien--icone" onClick={onFermer}>
                        {logo ? (
                          <img src={logo} alt="" className="panneau-nav__icone panneau-nav__icone--logo" aria-hidden="true" />
                        ) : (
                          <span className={`panneau-nav__icone panneau-nav__icone--${iconesCategories[index] || 'bijou'}`} aria-hidden="true" />
                        )}
                        <span>{c.nom}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Accordéon 2 : à propos + aide, fusionnés et repliés par défaut */}
          {aInfos && (
            <section className="panneau-nav__accordeon">
              <button
                className="panneau-nav__accordeon-entete"
                onClick={() => basculer('infos')}
                aria-expanded={sectionOuverte === 'infos'}
              >
                <span>Informations</span>
                <ChevronAccordeon ouvert={sectionOuverte === 'infos'} />
              </button>

              {sectionOuverte === 'infos' && (
                <div className="panneau-nav__accordeon-corps">
                  {menu.pagesActif && (
                    <>
                      <Link href="/mon-histoire" className="panneau-nav__lien" onClick={onFermer}>Mon Histoire</Link>
                      <Link href="/artisanat" className="panneau-nav__lien" onClick={onFermer}>Artisanat</Link>
                      <Link href="/engagements" className="panneau-nav__lien" onClick={onFermer}>Engagements</Link>
                      {journalActif && <Link href="/journal" className="panneau-nav__lien" onClick={onFermer}>Journal</Link>}
                    </>
                  )}
                  {menu.aideActif && (
                    <>
                      <Link href="/livraison-retours" className="panneau-nav__lien" onClick={onFermer}>Livraison &amp; Retours</Link>
                      <Link href="/paiement-securise" className="panneau-nav__lien" onClick={onFermer}>Paiement s&eacute;curis&eacute;</Link>
                      <Link href="/faq" className="panneau-nav__lien" onClick={onFermer}>FAQ</Link>
                      <Link href="/contact" className="panneau-nav__lien" onClick={onFermer}>Contact</Link>
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          <Link href="/mon-histoire" className="panneau-nav__histoire" onClick={onFermer}>
            <span>Chaque bijou<br />raconte une <em>histoire.</em></span>
            <strong>D&eacute;couvrir mon histoire</strong>
          </Link>

          <div className="panneau-nav__pied">
            <div className="panneau-nav__sociaux" aria-label="R&eacute;seaux sociaux">
              <a href="https://www.instagram.com/nabe.bijoux/" target="_blank" rel="noreferrer noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@nabe.bijoux" target="_blank" rel="noreferrer noopener" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M16.6 3c.3 2 1.6 3.6 3.6 3.9v2.7c-1.3.1-2.6-.3-3.6-1v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .5 0 .8.1v2.8a2.6 2.6 0 1 0 2 2.5V3h2.6z" />
                </svg>
              </a>
            </div>
            <Link
              href={monte && session?.user ? '/mon-compte' : '/connexion'}
              className="panneau-nav__compte"
              onClick={onFermer}
            >
              <span>{monte && session?.user ? 'Mon compte' : 'Connexion / Créer un compte'}</span>
              <span className="panneau-nav__compte-icone" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
