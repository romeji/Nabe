import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authClientOptions } from '@/lib/auth-client';
import { avecDelaiBase, prisma } from '@/lib/prisma';

/**
 * Vérifie qu'une session admin valide existe ET correspond bien à un compte
 * réellement présent dans la table Admin (et pas, par exemple, une session
 * client mal interprétée). Défense en profondeur en complément de
 * l'isolation des cookies (voir lib/auth.ts et lib/auth-client.ts) : même si
 * les cookies venaient à se chevaucher, cette vérification empêcherait tout
 * accès admin non autorisé.
 * Retourne la session si valide, ou null sinon.
 */
export async function verifierSessionAdmin() {
  try {
    const session = await getServerSession(authOptions);
    const adminId = (session?.user as any)?.id as string | undefined;
    if (!adminId) return null;

    const admin = await avecDelaiBase(prisma.admin.findUnique({ where: { id: adminId }, select: { id: true } }));
    if (!admin) return null;

    return session;
  } catch (error) {
    // Une session obsolÃ¨te ne doit jamais transformer /admin/login en erreur 500
    // lorsque Neon est indisponible : l'utilisateur peut toujours se reconnecter.
    console.error('VÃ©rification de session admin indisponible :', error instanceof Error ? error.name : 'erreur inconnue');
    return null;
  }
}

/**
 * Vérifie qu'une session client (compte boutique) valide existe ET
 * correspond bien à un compte réellement présent dans la table Client.
 * Retourne la session si valide, ou null sinon.
 */
export async function verifierSessionClient() {
  try {
    const session = await getServerSession(authClientOptions);
    const clientId = (session?.user as any)?.id as string | undefined;
    if (!clientId) return null;

    const client = await avecDelaiBase(prisma.client.findUnique({ where: { id: clientId }, select: { id: true } }));
    if (!client) return null;

    return session;
  } catch (error) {
    console.error('VÃ©rification de session client indisponible :', error instanceof Error ? error.name : 'erreur inconnue');
    return null;
  }
}
