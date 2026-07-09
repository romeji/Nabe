import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formaterPrix } from '@/lib/utils';
import FormulaireCodePromo from '@/components/admin/FormulaireCodePromo';
import LigneCodePromo from '@/components/admin/LigneCodePromo';
import './codes-promo.css';

export default async function PageAdminCodesPromo() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const codes = await prisma.codeReduction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { commandes: { select: { total: true } } },
  });

  const codesAvecStats = codes.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    valeur: parseFloat(c.valeur.toString()),
    actif: c.actif,
    nomCollaborateur: c.nomCollaborateur,
    commissionPourcentage: c.commissionPourcentage ? parseFloat(c.commissionPourcentage.toString()) : null,
    dateExpiration: c.dateExpiration?.toISOString() || null,
    utilisationMax: c.utilisationMax,
    nombreUtilisations: c.commandes.length,
    chiffreAffairesGenere: c.commandes.reduce((acc, cmd) => acc + parseFloat(cmd.total.toString()), 0),
  }));

  return (
    <div className="admin-codes-promo">
      <div className="admin-entete">
        <h1>Codes de réduction</h1>
      </div>

      <div className="admin-codes-promo__grille">
        <div>
          <div className="admin-table-scroll"><table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Réduction</th>
                <th>Utilisations</th>
                <th>CA généré</th>
                <th>Collaborateur</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {codesAvecStats.map((c) => (
                <LigneCodePromo key={c.id} code={c} />
              ))}
            </tbody>
          </table></div>

          {codesAvecStats.length === 0 && (
            <p style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic', marginTop: '1rem' }}>
              Aucun code de réduction pour le moment.
            </p>
          )}
        </div>

        <FormulaireCodePromo />
      </div>
    </div>
  );
}
