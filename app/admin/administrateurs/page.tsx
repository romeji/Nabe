import { verifierSessionAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdministrateursClient from '@/components/admin/AdministrateursClient';
import '../categories/categories.css';

export default async function PageAdminAdministrateurs() {
  const session = await verifierSessionAdmin();
  if (!session) redirect('/admin/login');

  const administrateurs = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Administrateurs ({administrateurs.length})</h1>
        <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.85rem' }}>
          Gérez qui a accès à l'administration du site. Ce sont des comptes totalement distincts des
          comptes clients de la boutique — impossible de transformer un compte client en admin ou
          inversement, par sécurité.
        </p>
      </div>

      <AdministrateursClient
        administrateurs={administrateurs.map((a: any) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      />
    </div>
  );
}
