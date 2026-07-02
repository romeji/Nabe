import Link from 'next/link';
import './checkout-layout.css';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="checkout-layout">
      <header className="checkout-layout__entete">
        <Link href="/" className="checkout-layout__logo">Nabe</Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
