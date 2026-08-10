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

// Une vidéo directe (mp4/webm/mov) : lecteur minimal maison — la vidéo
// remplit toute la carte, un bouton play est la seule chose ajoutée
// par-dessus, et il disparaît dès que la lecture démarre. Pas de barre de
// contrôle native du navigateur, pas de badge, pas de texte.
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

  return (
    <section className="instagram-module conteneur" aria-label="Vidéos Instagram">
      {urls.length > 0 ? (
        <div className="instagram-module__videos">
          {urls.map((url, index) => {
            const embed = urlEmbedInstagram(url);
            if (estVideoDirecte(url)) {
              return <CarteVideoDirecte key={`${url}-${index}`} url={url} index={index} />;
            }
            return (
              <article className="instagram-module__carte" key={`${url}-${index}`}>
                {embed ? (
                  <iframe
                    src={embed}
                    title={`Publication Instagram ${index + 1}`}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                ) : (
                  <a href={url} target="_blank" rel="noreferrer noopener" className="instagram-module__lien-externe">
                    <span className="instagram-module__play" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <a className="instagram-module__attente" href={profil} target="_blank" rel="noreferrer noopener">
          Les prochaines vidéos arrivent ici.
        </a>
      )}
    </section>
  );
}
