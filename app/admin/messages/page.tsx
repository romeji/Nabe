import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MessageCarte from '@/components/admin/MessageCarte';
import './messages.css';

export default async function PageAdminMessages() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const messages = await prisma.messageContact.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="admin-messages">
      <div className="admin-entete">
        <h1>Messages ({messages.length})</h1>
      </div>

      <div className="admin-messages__liste">
        {messages.map((m: any) => (
          <MessageCarte
            key={m.id}
            message={{
              id: m.id,
              nom: m.nom,
              email: m.email,
              sujet: m.sujet,
              message: m.message,
              statut: m.statut,
              createdAt: m.createdAt.toISOString(),
            }}
          />
        ))}
      </div>

      {messages.length === 0 && <p className="admin-messages__vide">Aucun message pour le moment.</p>}
    </div>
  );
}
