'use client';
import { useState } from 'react';
import PopupContact from './popups/PopupContact';
import PopupEntretien from './popups/PopupEntretien';
import PopupLivraison from './popups/PopupLivraison';

export default function LiensInfoProduit() {
  const [popupOuverte, setPopupOuverte] = useState<'contact' | 'entretien' | 'livraison' | null>(null);

  return (
    <>
      <div className="liens-info-produit">
        <button type="button" className="liens-info-produit__item" onClick={() => setPopupOuverte('contact')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Contactez-nous
        </button>
        <button type="button" className="liens-info-produit__item" onClick={() => setPopupOuverte('entretien')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          Entretien et services
        </button>
        <button type="button" className="liens-info-produit__item" onClick={() => setPopupOuverte('livraison')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Livraison et Paiement
        </button>
      </div>

      <PopupContact ouverte={popupOuverte === 'contact'} onFermer={() => setPopupOuverte(null)} />
      <PopupEntretien ouverte={popupOuverte === 'entretien'} onFermer={() => setPopupOuverte(null)} />
      <PopupLivraison ouverte={popupOuverte === 'livraison'} onFermer={() => setPopupOuverte(null)} />

      <style>{`
        .liens-info-produit {
          display: flex;
          flex-direction: column;
          border-top: 1px solid #e8e4de;
          margin-top: 1.5rem;
        }
        .liens-info-produit__item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e8e4de;
          background: none;
          border-left: none; border-right: none; border-top: none;
          cursor: pointer;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nabe-encre);
          text-align: left;
        }
        .liens-info-produit__item:hover { color: var(--nabe-terracotta); }
        .liens-info-produit__item svg { color: var(--nabe-pierre); flex-shrink: 0; }
      `}</style>
    </>
  );
}
