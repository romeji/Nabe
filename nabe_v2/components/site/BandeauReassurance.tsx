export default function BandeauReassurance() {
  return (
    <div className="bandeau-reassurance">
      <div className="bandeau-reassurance__item">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M17 2.1l4 4-4 4" />
          <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8" />
          <path d="M7 21.9l-4-4 4-4" />
          <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
          <path d="M12 9.5a2.2 2.2 0 0 0-3.1 3.1L12 15.7l3.1-3.1A2.2 2.2 0 0 0 12 9.5z" />
        </svg>
        <h4>Satisfait ou remboursé</h4>
        <p>14 jours pour changer d'avis</p>
      </div>

      <div className="bandeau-reassurance__item">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="1" y="7" width="13" height="9" rx="1" />
          <path d="M14 10h3.5l3.5 3v3h-7z" />
          <circle cx="6" cy="18.5" r="1.6" />
          <circle cx="17" cy="18.5" r="1.6" />
        </svg>
        <h4>Suivre ton colis</h4>
        <p>Livraison en 24h - 72h avec ton numéro de suivi</p>
      </div>

      <div className="bandeau-reassurance__item">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4A8.5 8.5 0 1 1 21 11.5z" />
          <line x1="8" y1="10.5" x2="16" y2="10.5" />
          <line x1="8" y1="14" x2="13" y2="14" />
        </svg>
        <h4>Service client 24/7</h4>
        <p>
          Écris-nous via{' '}
          <a href="/contact">notre formulaire en ligne</a>
        </p>
      </div>

      <div className="bandeau-reassurance__item">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <line x1="2" y1="10.5" x2="22" y2="10.5" />
          <circle cx="17.5" cy="15.5" r="2" />
        </svg>
        <h4>Paiement sécurisé</h4>
        <p>Carte de crédit, PayPal, Klarna, Scalapay...</p>
      </div>
    </div>
  );
}
