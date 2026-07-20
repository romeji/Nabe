'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PopupLateraleProps {
  ouverte: boolean;
  onFermer: () => void;
  titre: string;
  children: React.ReactNode;
}

export default function PopupLaterale({ ouverte, onFermer, titre, children }: PopupLateraleProps) {
  useEffect(() => {
    if (ouverte) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [ouverte]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`popup-laterale__overlay${ouverte ? ' popup-laterale__overlay--visible' : ''}`}
        onClick={onFermer}
        aria-hidden="true"
      />
      {/* Panneau */}
      <div
        className={`popup-laterale${ouverte ? ' popup-laterale--ouverte' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
      >
        <div className="popup-laterale__entete">
          <h2 className="popup-laterale__titre">{titre}</h2>
          <button className="popup-laterale__fermer" onClick={onFermer} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="popup-laterale__corps">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
