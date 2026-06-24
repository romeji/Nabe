import { NextResponse } from 'next/server';
import { getConfigSite } from '@/lib/config-site';

export async function GET() {
  const config = await getConfigSite();
  // On expose uniquement ce qui est nécessaire au rendu public (pas de données sensibles dans ConfigSite de toute façon)
  return NextResponse.json(config);
}
