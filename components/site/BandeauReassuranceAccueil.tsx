const garanties = [
  {
    texte: 'Fabrication artisanale',
    icone: <><path d="M14 3l2.5 2.5L7 15l-4 1 1-4z" /><path d="M17.5 2.5 21 6l-2 2-3.5-3.5z" /></>,
  },
  {
    texte: 'Matériaux de qualité',
    icone: <><path d="M6 3h12l3.5 5L12 21 2.5 8z" /><path d="M2.5 8h19M9 3l-2 5 5 13 5-13-2-5" /></>,
  },
  {
    texte: 'Paiement sécurisé',
    icone: <path d="M12 2 4 5.5v6C4 16.7 7.4 20.9 12 22c4.6-1.1 8-5.3 8-10.5v-6z" />,
  },
  {
    texte: 'Retours sous 14 jours',
    icone: <><path d="M21 12a9 9 0 1 1-3.5-7.1" /><path d="M21 3v5h-5" /></>,
  },
];

function GroupeGaranties({ masque = false }: { masque?: boolean }) {
  return (
    <div className="accueil-reassurance__groupe" aria-hidden={masque || undefined}>
      {garanties.map((garantie) => (
        <div className="accueil-reassurance__item" key={garantie.texte}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            {garantie.icone}
          </svg>
          <span>{garantie.texte}</span>
        </div>
      ))}
    </div>
  );
}

export default function BandeauReassuranceAccueil() {
  return (
    <section className="accueil-reassurance" aria-label="Les garanties Nabe">
      <div className="accueil-reassurance__piste">
        <GroupeGaranties />
        <GroupeGaranties masque />
      </div>
    </section>
  );
}
