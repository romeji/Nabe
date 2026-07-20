'use client';
import PopupLaterale from './PopupLaterale';
import './popup-laterale.css';

interface Pierre {
  nom: string;
  description?: string | null;
  couleurs: Array<{ nom: string; codeHex: string }>;
}

interface PopupDetailsProduitProps {
  ouverte: boolean;
  onFermer: () => void;
  reference: string;
  description: string;
  pierres: Pierre[];
  taillesDisponibles: string[];
}

export default function PopupDetailsProduit({
  ouverte, onFermer, reference, description, pierres, taillesDisponibles,
}: PopupDetailsProduitProps) {
  const gamme = taillesDisponibles.length >= 2
    ? `${taillesDisponibles[0]}–${taillesDisponibles[taillesDisponibles.length - 1]}`
    : taillesDisponibles.join(', ');

  return (
    <PopupLaterale ouverte={ouverte} onFermer={onFermer} titre="DÉTAILS PRODUITS">
      <div className="details-produit">
        {/* Description */}
        {description && (
          <p className="details-produit__description">{description}</p>
        )}

        <div className="details-produit__separateur" />

        {/* Référence */}
        <div className="details-produit__ligne">
          <span className="details-produit__libelle">RÉFÉRENCE</span>
          <span className="details-produit__valeur">{reference}</span>
        </div>

        <div className="details-produit__separateur" />

        {/* Pierres */}
        {pierres.length > 0 && (
          <>
            <div className="details-produit__ligne">
              <span className="details-produit__libelle">PIERRE{pierres.length > 1 ? 'S' : ''}</span>
              <div className="details-produit__valeur">
                {pierres.map((p: any, i: number) => (
                  <div key={i}>
                    <span>{p.nom}</span>
                    {p.couleurs.length > 0 && (
                      <span style={{ color: '#888', fontSize: '0.85rem' }}>
                        {' — '}{p.couleurs.map((c: any) => c.nom).join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="details-produit__separateur" />
          </>
        )}

        {/* Tailles */}
        {taillesDisponibles.length > 0 && (
          <>
            <div className="details-produit__ligne">
              <span className="details-produit__libelle">GAMME DE TAILLES</span>
              <span className="details-produit__valeur">{gamme}</span>
            </div>
            <div className="details-produit__separateur" />
          </>
        )}
      </div>

      <style>{`
        .details-produit { }
        .details-produit__description {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--nabe-encre);
          margin-bottom: 1.5rem;
        }
        .details-produit__separateur {
          height: 1px;
          background: #e8e4de;
          margin: 1.25rem 0;
        }
        .details-produit__ligne {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .details-produit__libelle {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: var(--nabe-pierre);
          font-weight: 500;
        }
        .details-produit__valeur {
          font-size: 0.95rem;
          color: var(--nabe-encre);
          line-height: 1.6;
        }
      `}</style>
    </PopupLaterale>
  );
}
