'use client';

import { useRef, useState } from 'react';
import './instagram-module.css';

type InstagramModuleProps = {
  config: Record<string, string>;
};

function estUrlValide(url: string) {
  try {
    const destination = new URL(url);
    return destination.protocol === 'https:';
  } catch {
    return false;
  }
}

function estVideoDirecte(url: string) {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
}

function urlEmbedInstagram(url: string) {
  try {
    const destination = new URL(url);
    if (!/(^|\.)instagram\.com$/i.test(destination.hostname)) return null;
    const chemin = destination.pathname.replace(/\/$/, '');
    return `${destination.origin}${chemin}/embed`;
  } catch {
    return null;
  }
}

const IconeInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconeLecture = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function InstagramModule({ config }: InstagramModuleProps) {
  const urls = (config.instagram_videos || '')
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(estUrlValide)
    .slice(0, 5);

  // La section reste visible comme état d'attente engageant avant qu'un
  // premier Reel ne soit sélectionné depuis l'administration. Une fois des
  // vidéos présentes, l'interrupteur admin peut toujours masquer le module.
  if (config.instagram_module_actif === 'false' && urls.length > 0) return null;

  const profil = estUrlValide(config.instagram_profil_url || '')
    ? config.instagram_profil_url
    : 'https://www.instagram.com/nabe.bijoux/';
  const identifiant = config.instagram_identifiant?.trim() || '@nabe.bijoux';

  const [demarrees, setDemarrees] = useState<Record<number, boolean>>({});
  const refsVideo = useRef<Record<number, HTMLVideoElement | null>>({});

  function lancerLecture(index: number) {
    setDemarrees((etat) => ({ ...etat, [index]: true }));
    // Le play() est déclenché après le rendu du <video autoPlay>, mais on
    // le tente aussi ici pour les navigateurs qui en ont besoin explicitement.
    requestAnimationFrame(() => refsVideo.current[index]?.play().catch(() => {}));
  }

  return (
    <section className="instagram-module conteneur" aria-label="Vidéos Instagram">
      <div className="instagram-module__entete">
        <div>
          <span className="etiquette">Suivez-nous</span>
          <h2>
            Nabe sur <span className="accent">Instagram</span>
          </h2>
          <p>Dans l&apos;atelier, entre deux créations : les coulisses, les nouveautés et les pièces portées.</p>
        </div>
        {profil && (
          <a className="instagram-module__suivre" href={profil} target="_blank" rel="noreferrer noopener">
            <IconeInstagram />
            {identifiant}
          </a>
        )}
      </div>

      {urls.length > 0 ? (
        <div className="instagram-module__videos">
          {urls.map((url, index) => {
            const embed = urlEmbedInstagram(url);
            const video = estVideoDirecte(url);
            const lancee = demarrees[index];

            return (
              <article className="instagram-module__carte" key={`${url}-${index}`}>
                <span className="instagram-module__badge" aria-hidden="true">
                  <IconeInstagram />
                </span>

                {video ? (
                  <>
                    <video
                      ref={(el) => {
                        refsVideo.current[index] = el;
                      }}
                      controls={lancee}
                      autoPlay={lancee}
                      playsInline
                      preload="metadata"
                      src={url}
                    />
                    {!lancee && (
                      <button
                        type="button"
                        className="instagram-module__lecture"
                        onClick={() => lancerLecture(index)}
                        aria-label={`Lire la vidéo ${index + 1}`}
                      >
                        <IconeLecture />
                      </button>
                    )}
                  </>
                ) : embed ? (
                  <iframe
                    src={embed}
                    title={`Publication Instagram ${index + 1}`}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                ) : (
                  <a href={url} target="_blank" rel="noreferrer noopener" className="instagram-module__lien-externe">
                    Voir la vidéo
                  </a>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <a className="instagram-module__attente" href={profil} target="_blank" rel="noreferrer noopener">
          <span className="instagram-module__attente-icone" aria-hidden="true">
            <IconeInstagram />
          </span>
          <span>
            <strong>Les prochaines vidéos arrivent ici.</strong> Retrouvez dès maintenant les coulisses de Nabe sur
            Instagram.
          </span>
        </a>
      )}

      {profil && (
        <p className="instagram-module__pied">
          Envie de voir la suite ? <a href={profil} target="_blank" rel="noreferrer noopener">Retrouvez-nous sur Instagram →</a>
        </p>
      )}
    </section>
  );
}
