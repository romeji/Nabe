import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PierresEtCouleursClient from '@/components/admin/PierresEtCouleursClient';
import '../categories/categories.css';

export default async function PageAdminPierres() {
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  const [pierres, couleurs] = await Promise.all([
    prisma.pierre.findMany({
      orderBy: { ordre: 'asc' },
      include: {
        couleurs: { include: { couleurPierre: true } },
        _count: { select: { produits: true } },
      },
    }),
    prisma.couleurPierre.findMany({
      orderBy: { ordre: 'asc' },
      include: { _count: { select: { pierres: true } } },
    }),
  ]);

  return (
    <PierresEtCouleursClient
      pierres={JSON.parse(JSON.stringify(pierres))}
      couleurs={JSON.parse(JSON.stringify(couleurs))}
    />
  );
}
