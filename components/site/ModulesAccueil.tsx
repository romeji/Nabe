import Link from 'next/link';

type ModulesAccueilProps = {
  config: Record<string, string>;
};

function urlValide(url?: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('https://');
}

export default function ModulesAccueil({ config }: ModulesAccueilProps) {
  const videoActive = config.accueil_module_video_actif === 'true' && urlValide(config.accueil_module_video_url);
  const surMesureActif = config.accueil_module_sur_mesure_actif === 'true';

  if (!videoActive && !surMesureActif) return null;

  return (
    <section className="accueil-modules conteneur" aria-label="Modules éditoriaux Nabe">
      {videoActive && (
        <div className="accueil-module accueil-module--video">
          <div className="accueil-module__texte">
            <span className="etiquette">Atelier</span>
            <h2>{config.accueil_module_video_titre}</h2>
            <p>{config.accueil_module_video_texte}</p>
          </div>
          <video
            className="accueil-module__media"
            controls
            playsInline
            preload="metadata"
            poster={urlValide(config.accueil_module_video_poster) ? config.accueil_module_video_poster : undefined}
          >
            <source src={config.accueil_module_video_url} />
          </video>
        </div>
      )}

      {surMesureActif && (
        <div className="accueil-module accueil-module--sur-mesure">
          <div className="accueil-module__texte">
            <span className="etiquette">Sur mesure</span>
            <h2>{config.accueil_module_sur_mesure_titre}</h2>
            <p>{config.accueil_module_sur_mesure_texte}</p>
          </div>
          <Link href="/sur-mesure" className="btn btn-primaire">
            Demander un devis
          </Link>
        </div>
      )}
    </section>
  );
}
