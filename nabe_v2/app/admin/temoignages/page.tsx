import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TemoignagesAdminClient from '@/components/admin/TemoignagesAdminClient';
import '../categories/categories.css';

export default async function PageAdminTemoignages() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const temoignages = await prisma.temoignage.findMany({ orderBy: { ordre: 'asc' } });

  return (
    <div className="admin-categories">
      <div className="admin-entete">
        <h1>Témoignages ({temoignages.length})</h1>
        <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.85rem' }}>
          Ces témoignages alimentent la section "Ils nous font confiance" de la page d'accueil. Vous
          pouvez activer/désactiver toute la section depuis Réglages → Accueil, et gérer ici le contenu
          affiché (jusqu'à 3 témoignages actifs affichés, dans l'ordre choisi).
        </p>
      </div>

      <TemoignagesAdminClient temoignages={temoignages} />
    </div>
  );
}
