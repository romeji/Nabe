'use client';
import { useState, useEffect } from 'react';
import PopupLaterale from './PopupLaterale';
import './popup-laterale.css';

interface Section { cle: string; titre: string; contenu: string; ordre: number; }

interface PopupContactProps {
  ouverte: boolean;
  onFermer: () => void;
}

export default function PopupContact({ ouverte, onFermer }: PopupContactProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);

  useEffect(() => {
    if (ouverte && sections.length === 0) {
      fetch('/api/politiques?section=contact')
        .then(r => r.json())
        .then(setSections)
        .catch(() => {});
    }
  }, [ouverte]);

  const intro = sections.find(s => s.cle === 'contact-intro');
  const items = sections.filter(s => s.cle !== 'contact-intro');

  return (
    <PopupLaterale ouverte={ouverte} onFermer={onFermer} titre="UNE QUESTION ?">
      <div className="popup-politique">
        {intro && (
          <div className="popup-politique__intro" dangerouslySetInnerHTML={{ __html: intro.contenu }} />
        )}

        <div className="popup-politique__items">
          {/* NOUS APPELER */}
          {items.filter(i => i.cle === 'contact-appeler').map(item => (
            <div key={item.cle} className="popup-politique__item">
              <button
                className="popup-politique__item-titre"
                onClick={() => setOuvert(ouvert === item.cle ? null : item.cle)}
              >
                <span className="popup-politique__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item.titre}
                <span className="popup-politique__chevron">{ouvert === item.cle ? '−' : '+'}</span>
              </button>
              {ouvert === item.cle && (
                <div className="popup-politique__item-corps">
                  <div dangerouslySetInnerHTML={{ __html: item.contenu }} />
                </div>
              )}
            </div>
          ))}

          {/* NOUS ÉCRIRE */}
          {items.filter(i => i.cle === 'contact-ecrire').map(item => (
            <div key={item.cle} className="popup-politique__item">
              <button
                className="popup-politique__item-titre"
                onClick={() => setOuvert(ouvert === item.cle ? null : item.cle)}
              >
                <span className="popup-politique__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item.titre}
                <span className="popup-politique__chevron">{ouvert === item.cle ? '−' : '+'}</span>
              </button>
              {ouvert === item.cle && (
                <div className="popup-politique__item-corps">
                  <div dangerouslySetInnerHTML={{ __html: item.contenu }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PopupLaterale>
  );
}
