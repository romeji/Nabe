import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel ouvre des fonctions courtes et nombreuses : la connexion poolée Neon
// évite de saturer ou de perdre les connexions PostgreSQL. En local et pour la
// rétrocompatibilité, DATABASE_URL reste le repli.
const datasourceUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Une instance Neon peut Ãªtre briÃ¨vement indisponible ou en cours de rÃ©veil.
 * Les pages publiques doivent alors rendre leurs valeurs de repli au lieu de
 * laisser la requÃªte HTTP attendre indÃ©finiment.
 */
export async function avecDelaiBase<T>(requete: Promise<T>, delaiMs = 1500): Promise<T> {
  let minuterie: ReturnType<typeof setTimeout> | undefined;
  const expiration = new Promise<never>((_, rejeter) => {
    minuterie = setTimeout(() => rejeter(new Error('DÃ©lai de connexion Ã  la base dÃ©passÃ©.')), delaiMs);
  });

  try {
    return await Promise.race([requete, expiration]);
  } finally {
    if (minuterie) clearTimeout(minuterie);
  }
}
