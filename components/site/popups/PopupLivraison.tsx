'use client';
import { useState, useEffect } from 'react';
import PopupLaterale from './PopupLaterale';
import './popup-laterale.css';

interface Section { cle: string; titre: string; contenu: string; }

export default function PopupLivraison({ ouverte, onFermer }: { ouverte: boolean; onFermer: () => void }) {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (ouverte && sections.length === 0) {
      fetch('/api/politiques?section=livraison')
        .then(r => r.json())
        .then(setSections)
        .catch(() => {});
    }
  }, [ouverte]);

  return (
    <PopupLaterale ouverte={ouverte} onFermer={onFermer} titre="LIVRAISON ET PAIEMENT">
      <div className="popup-politique">
        {sections.map(item => (
          <div key={item.cle} className="popup-politique__section">
            <h3 className="popup-politique__section-titre">{item.titre}</h3>
            <div className="popup-politique__section-corps">
              <div dangerouslySetInnerHTML={{ __html: item.contenu }} />
            </div>
            <div className="popup-politique__separateur" />
          </div>
        ))}
      </div>
    </PopupLaterale>
  );
}
