import type {
  Adapter,
  AdapterUser,
  VerificationToken,
} from 'next-auth/adapters';
import { prisma } from '@/lib/prisma';

type CreateUserInput =
  Parameters<NonNullable<Adapter['createUser']>>[0];
type UpdateUserInput =
  Parameters<NonNullable<Adapter['updateUser']>>[0];
type AccountIdentifier =
  Parameters<NonNullable<Adapter['getUserByAccount']>>[0];
type LinkAccountInput =
  Parameters<NonNullable<Adapter['linkAccount']>>[0];
type UnlinkAccountInput =
  Parameters<NonNullable<Adapter['unlinkAccount']>>[0];
type CreateSessionInput =
  Parameters<NonNullable<Adapter['createSession']>>[0];
type UpdateSessionInput =
  Parameters<NonNullable<Adapter['updateSession']>>[0];
type VerificationTokenInput =
  Parameters<NonNullable<Adapter['createVerificationToken']>>[0];
type UseVerificationTokenInput =
  Parameters<NonNullable<Adapter['useVerificationToken']>>[0];

function versAdapterUser(client: {
  id: string;
  nom: string | null;
  email: string;
  emailVerifie: Date | null;
  image: string | null;
}): AdapterUser {
  return {
    id: client.id,
    name: client.nom,
    email: client.email,
    emailVerified: client.emailVerifie,
    image: client.image,
  };
}

export function AuthClientAdapter(): Adapter {
  const adapter: Adapter = {
    async createUser(user: CreateUserInput) {
      if (!user.email) {
        throw new Error(
          'Google n’a pas fourni d’adresse e-mail pour ce compte.',
        );
      }

      const client = await prisma.client.create({
        data: {
          nom: user.name ?? null,
          email: user.email.trim().toLowerCase(),
          emailVerifie: user.emailVerified ?? null,
          image: user.image ?? null,
        },
      });

      return versAdapterUser(client);
    },

    async getUser(id: string) {
      const client = await prisma.client.findUnique({
        where: { id },
      });

      return client ? versAdapterUser(client) : null;
    },

    async getUserByEmail(email: string) {
      const client = await prisma.client.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      return client ? versAdapterUser(client) : null;
    },

    async getUserByAccount(
      { provider, providerAccountId }: AccountIdentifier,
    ) {
      const compte = await prisma.compteOAuth.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          client: true,
        },
      });

      return compte ? versAdapterUser(compte.client) : null;
    },

    async updateUser(user: UpdateUserInput) {
      const client = await prisma.client.update({
        where: { id: user.id },
        data: {
          ...(user.name !== undefined
            ? { nom: user.name ?? null }
            : {}),
          ...(user.email !== undefined && user.email
            ? { email: user.email.trim().toLowerCase() }
            : {}),
          ...(user.emailVerified !== undefined
            ? { emailVerifie: user.emailVerified ?? null }
            : {}),
          ...(user.image !== undefined
            ? { image: user.image ?? null }
            : {}),
        },
      });

      return versAdapterUser(client);
    },

    async deleteUser(userId: string) {
      await prisma.client.delete({
        where: { id: userId },
      });
    },

    async linkAccount(account: LinkAccountInput) {
      await prisma.compteOAuth.create({
        data: {
          clientId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token ?? null,
          access_token: account.access_token ?? null,
          expires_at: account.expires_at ?? null,
          token_type: account.token_type ?? null,
          scope: account.scope ?? null,
          id_token: account.id_token ?? null,
          session_state:
            typeof account.session_state === 'string'
              ? account.session_state
              : account.session_state != null
                ? String(account.session_state)
                : null,
        },
      });
    },

    async unlinkAccount(
      { provider, providerAccountId }: UnlinkAccountInput,
    ) {
      await prisma.compteOAuth.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },

    async createSession(session: CreateSessionInput) {
      const creee = await prisma.sessionClient.create({
        data: {
          sessionToken: session.sessionToken,
          clientId: session.userId,
          expires: session.expires,
        },
      });

      return {
        sessionToken: creee.sessionToken,
        userId: creee.clientId,
        expires: creee.expires,
      };
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.sessionClient.findUnique({
        where: { sessionToken },
      });

      if (!session) {
        return null;
      }

      const client = await prisma.client.findUnique({
        where: { id: session.clientId },
      });

      if (!client) {
        return null;
      }

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.clientId,
          expires: session.expires,
        },
        user: versAdapterUser(client),
      };
    },

    async updateSession(session: UpdateSessionInput) {
      const miseAJour = await prisma.sessionClient.update({
        where: {
          sessionToken: session.sessionToken,
        },
        data: {
          ...(session.expires !== undefined
            ? { expires: session.expires }
            : {}),
          ...(session.userId !== undefined
            ? { clientId: session.userId }
            : {}),
        },
      });

      return {
        sessionToken: miseAJour.sessionToken,
        userId: miseAJour.clientId,
        expires: miseAJour.expires,
      };
    },

    async deleteSession(sessionToken: string) {
      await prisma.sessionClient.delete({
        where: { sessionToken },
      });
    },

    async createVerificationToken(
      token: VerificationTokenInput,
    ) {
      const cree = await prisma.verificationToken.create({
        data: {
          identifier: token.identifier,
          token: token.token,
          expires: token.expires,
        },
      });

      return cree as VerificationToken;
    },

    async useVerificationToken(
      { identifier, token }: UseVerificationTokenInput,
    ) {
      try {
        const supprime =
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier,
                token,
              },
            },
          });

        return supprime as VerificationToken;
      } catch {
        return null;
      }
    },
  };

  return adapter;
}
