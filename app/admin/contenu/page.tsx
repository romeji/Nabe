import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { REGISTRE_CONTENU } from '@/lib/registre-contenu';
import SelecteurPageContenu from '@/components/admin/SelecteurPageContenu';
import EditeurContenuClient from '@/components/admin/EditeurContenuClient';
import './contenu.css';

export default async function PageAdminContenu({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const slugActif = searchParams.page || REGISTRE_CONTENU[0].slug;
  const pageRegistre = REGISTRE_CONTENU.find((p) => p.slug === slugActif) || REGISTRE_CONTENU[0];

  // Récupère ce qui est déjà enregistré en base pour cette page précise
  const enregistres = await prisma.contenuPage.findMany({ where: { page: pageRegistre.slug } });
  const valeursEnDb: Record<string, string> = {};
  enregistres.forEach((item) => (valeursEnDb[item.cle] = item.valeur));

  // Pré-remplit chaque champ : valeur en DB si elle existe et n'est pas vide, sinon le texte par défaut du code
  const valeursInitiales = pageRegistre.champs.reduce((acc, champ) => {
    const valeurDb = valeursEnDb[champ.cle];
    acc[champ.cle] = valeurDb && valeurDb.trim() !== '' ? valeurDb : champ.defaut;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="admin-contenu">
      <div className="admin-entete">
        <h1>Contenu du site</h1>
      </div>
      <p className="admin-contenu__intro">
        Modifiez les textes affichés sur les pages publiques sans toucher au code. Chaque champ
        affiche le texte actuellement en ligne sur le site — vous pouvez le corriger ou le
        remplacer entièrement.
      </p>

      <SelecteurPageContenu pages={REGISTRE_CONTENU} slugActif={pageRegistre.slug} />

      <EditeurContenuClient
        key={pageRegistre.slug}
        page={pageRegistre.slug}
        titrePage={pageRegistre.titre}
        champs={pageRegistre.champs}
        valeursInitiales={valeursInitiales}
      />
    </div>
  );
}
