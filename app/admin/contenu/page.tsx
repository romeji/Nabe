import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EditeurContenuClient from '@/components/admin/EditeurContenuClient';
import './contenu.css';

const CHAMPS_PAR_PAGE: Record<string, { cle: string; label: string; type: 'texte' | 'html' }[]> = {
  accueil: [
    { cle: 'hero_soustitre', label: 'Sous-titre du hero', type: 'texte' },
    { cle: 'histoire_texte', label: 'Texte "Notre histoire"', type: 'html' },
  ],
  'la-maison': [
    { cle: 'parcours_texte', label: 'Texte "Mon parcours"', type: 'html' },
    { cle: 'savoirfaire_texte', label: 'Texte "Un savoir-faire artisanal"', type: 'html' },
  ],
};

export default async function PageAdminContenu() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const tousLesContenus = await prisma.contenuPage.findMany();
  const map: Record<string, string> = {};
  tousLesContenus.forEach((c) => (map[`${c.page}.${c.cle}`] = c.valeur));

  return (
    <div className="admin-contenu">
      <div className="admin-entete">
        <h1>Contenu du site</h1>
      </div>
      <p className="admin-contenu__intro">
        Modifiez les textes affichés sur les pages publiques sans toucher au code. Les champs non
        renseignés ici affichent le texte par défaut prévu dans le design.
      </p>

      {Object.entries(CHAMPS_PAR_PAGE).map(([page, champs]) => (
        <EditeurContenuClient
          key={page}
          page={page}
          titrePage={page === 'accueil' ? 'Accueil' : 'La Maison'}
          champs={champs}
          valeursInitiales={champs.reduce((acc, c) => {
            acc[c.cle] = map[`${page}.${c.cle}`] || '';
            return acc;
          }, {} as Record<string, string>)}
        />
      ))}
    </div>
  );
}
