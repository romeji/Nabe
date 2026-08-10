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

// Une vidéo directe (mp4/webm/mov) : lecteur minimal maison — la vidéo
// remplit toute la carte, un bouton play est la seule chose ajoutée
// par-dessus, et il disparaît dès que la lecture démarre. Pas de barre de
// contrôle native du navigateur, pas de badge, pas de logo Instagram : la
// vidéo joue directement depuis notre site, sans jamais afficher la page
// Instagram derrière (contrairement à une intégration en iframe).
function CarteVideoDirecte({ url, index }: { url: string; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enLecture, setEnLecture] = useState(false);

  function basculerLecture() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  return (
    <article
      className={`instagram-module__carte${enLecture ? ' instagram-module__carte--en-lecture' : ''}`}
      onClick={basculerLecture}
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        src={url}
        onPlay={() => setEnLecture(true)}
        onPause={() => setEnLecture(false)}
        onEnded={() => setEnLecture(false)}
      />
      {!enLecture && (
        <button
          type="button"
          className="instagram-module__play"
          aria-label={`Lire la vidéo ${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            basculerLecture();
          }}
        >
          <svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}
    </article>
  );
}

export default function InstagramModule({ config }: InstagramModuleProps) {
  const urls = (config.instagram_videos || '')
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(estUrlValide)
    .slice(0, 5);

  // La section reste visible comme état d'attente engageant avant qu'un premier
  // Reel ne soit sélectionné en administration. Une fois des vidéos présentes,
  // l'interrupteur admin peut toujours masquer tout le module.
  if (config.instagram_module_actif === 'false' && urls.length > 0) return null;

  const profil = estUrlValide(config.instagram_profil_url || '')
    ? config.instagram_profil_url
    : 'https://www.instagram.com/nabe.bijoux/';
  const identifiant = config.instagram_identifiant?.trim() || '@nabe.bijoux';

  return (
    <section className="instagram-module conteneur" aria-label="Vidéos Instagram">
      <div className="instagram-module__entete">
        <div>
          <span className="etiquette">Suivez-nous</span>
          <h2>
            Nabe sur <span className="accent">Instagram</span>
          </h2>
          <p>Dans l&apos;atelier, entre deux créations : les coulisses, les nouveautés et les pièces portées, en images.</p>
        </div>
        {profil && (
          <a className="instagram-module__suivre" href={profil} target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
            </svg>
            {identifiant}
          </a>
        )}
      </div>

      {urls.length > 0 ? (
        <div className="instagram-module__videos">
          {urls.map((url, index) => {
            if (estVideoDirecte(url)) {
              return <CarteVideoDirecte key={`${url}-${index}`} url={url} index={index} />;
            }
            // Pas un fichier vidéo direct (ex : lien vers un post/reel Instagram) :
            // on ne l'intègre plus en iframe, car cela affichait la page Instagram
            // complète (leur logo, "voir le profil", etc.) autour de la vidéo. On
            // propose à la place un simple lien pour l'ouvrir sur Instagram.
            return (
              <article className="instagram-module__carte" key={`${url}-${index}`}>
                <a href={url} target="_blank" rel="noreferrer noopener" className="instagram-module__lien-externe">
                  <span className="instagram-module__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </a>
              </article>
            );
          })}
        </div>
      ) : (
        <a className="instagram-module__attente" href={profil} target="_blank" rel="noreferrer noopener">
          <span className="instagram-module__attente-icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span><strong>Les prochaines vidéos arrivent ici.</strong> Retrouvez dès maintenant les coulisses de Nabe sur Instagram.</span>
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
