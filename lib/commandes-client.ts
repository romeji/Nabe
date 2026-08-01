import { prisma } from '@/lib/prisma';

/**
 * Rattache au compte les commandes passées auparavant en invité avec la même
 * adresse e-mail. Une commande déjà rattachée à un autre compte n'est jamais
 * déplacée.
 */
export async function rattacherCommandesInvitees(clientId: string, email: string) {
  const emailNormalise = email.trim().toLowerCase();
  if (!emailNormalise) return 0;

  const resultat = await prisma.commande.updateMany({
    where: {
      clientId: null,
      clientEmail: { equals: emailNormalise, mode: 'insensitive' },
    },
    data: { clientId },
  });

  return resultat.count;
}
