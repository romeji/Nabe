import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authClientOptions } from '@/lib/auth-client';

/**
 * Vérifie qu'une session admin valide existe.
 * Retourne la session si valide, ou null sinon.
 */
export async function verifierSessionAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}

/**
 * Vérifie qu'une session client (compte boutique) valide existe.
 * Retourne la session si valide, ou null sinon.
 */
export async function verifierSessionClient() {
  const session = await getServerSession(authClientOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}
