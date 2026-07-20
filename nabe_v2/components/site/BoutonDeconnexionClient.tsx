'use client';

import { signOut } from 'next-auth/react';

export default function BoutonDeconnexionClient() {
  return (
    <button className="mon-compte__deconnexion" onClick={() => signOut({ callbackUrl: '/' })}>
      Se déconnecter
    </button>
  );
}
