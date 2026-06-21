import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
