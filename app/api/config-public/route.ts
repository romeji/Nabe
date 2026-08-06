import { NextResponse } from 'next/server';
import { getConfigSite, masquerConfigSensible } from '@/lib/config-site';

// Cette route ne doit jamais être mise en cache statiquement par Next.js,
// sinon les modifications faites depuis l'admin (Réglages) n'apparaissent
// jamais côté site public tant que l'app n'est pas redéployée.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const config = await getConfigSite();
  return NextResponse.json(masquerConfigSensible(config));
}
