import { NextResponse } from 'next/server';
import { getConfigSite } from '@/lib/config-site';

// Cette route ne doit jamais être mise en cache statiquement par Next.js,
// sinon les modifications faites depuis l'admin (Réglages) n'apparaissent
// jamais côté site public tant que l'app n'est pas redéployée.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const config = await getConfigSite();
  // On expose uniquement ce qui est nécessaire au rendu public (pas de données sensibles dans ConfigSite de toute façon)
  return NextResponse.json(config);
}
