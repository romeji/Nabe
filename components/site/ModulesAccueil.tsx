import Link from 'next/link';

type ModulesAccueilProps = {
  config: Record<string, string>;
};

export default function ModulesAccueil({ config }: ModulesAccueilProps) {
  const surMesureActif = config.accueil_module_sur_mesure_actif === 'true';

  if (!surMesureActif) return null;

  return (
    <section className="accueil-modules conteneur" aria-label="Modules éditoriaux Nabe">
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
