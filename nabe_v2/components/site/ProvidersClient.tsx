'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

export default function ProvidersClient({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider basePath="/api/auth" session={session}>
      {children}
    </SessionProvider>
  );
}
