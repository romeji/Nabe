'use client';

import { useRouter } from 'next/navigation';
import type { PageContenu } from '@/lib/registre-contenu';

export default function SelecteurPageContenu({
  pages,
  slugActif,
}: {
  pages: PageContenu[];
  slugActif: string;
}) {
  const router = useRouter();

  return (
    <div className="admin-contenu__onglets">
      {pages.map((p) => (
        <button
          key={p.slug}
          className={`admin-contenu__onglet ${p.slug === slugActif ? 'actif' : ''}`}
          onClick={() => router.push(`/admin/contenu?page=${p.slug}`)}
        >
          {p.titre}
        </button>
      ))}
    </div>
  );
}
