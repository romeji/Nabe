import 'server-only';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const VERSION_API = process.env.META_GRAPH_API_VERSION || 'v22.0';

type ReponseMeta<T> = T & {
  error?: { message?: string; type?: string };
};

type ComptePage = {
  id: string;
  access_token?: string;
  instagram_business_account?: {
    id?: string;
    username?: string;
  };
};

type MediaMeta = {
  id: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
};

export type VideoInstagramAdmin = {
  id: string;
  apercu: string | null;
  lien: string;
  mediaUrl: string | null;
  titre: string;
  date: string | null;
};

function obtenirCleChiffrement() {
  const valeur = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY;
  if (!valeur) return null;

  try {
    const cle = Buffer.from(valeur, 'base64url');
    return cle.length === 32 ? cle : null;
  } catch {
    return null;
  }
}

function messageErreurMeta(reponse: ReponseMeta<unknown>) {
  return reponse.error?.message || 'La réponse d’Instagram est invalide.';
}

async function demanderMeta<T>(url: URL): Promise<T> {
  const reponse = await fetch(url, { cache: 'no-store' });
  const donnees = await reponse.json().catch(() => ({})) as ReponseMeta<T>;

  if (!reponse.ok || donnees.error) {
    throw new Error(messageErreurMeta(donnees));
  }

  return donnees;
}

export function instagramMetaEstConfigure() {
  return Boolean(
    process.env.INSTAGRAM_META_APP_ID
    && process.env.INSTAGRAM_META_APP_SECRET
    && obtenirCleChiffrement(),
  );
}

export function chiffrerJetonInstagram(jeton: string) {
  const cle = obtenirCleChiffrement();
  if (!cle) throw new Error('La clé de chiffrement Instagram est absente ou invalide.');

  const iv = crypto.randomBytes(12);
  const chiffreur = crypto.createCipheriv('aes-256-gcm', cle, iv);
  const contenu = Buffer.concat([chiffreur.update(jeton, 'utf8'), chiffreur.final()]);
  const tag = chiffreur.getAuthTag();

  return [iv, tag, contenu].map((partie) => partie.toString('base64url')).join('.');
}

export function dechiffrerJetonInstagram(valeur: string) {
  const cle = obtenirCleChiffrement();
  if (!cle) throw new Error('La clé de chiffrement Instagram est absente ou invalide.');

  const [ivBrut, tagBrut, contenuBrut] = valeur.split('.');
  if (!ivBrut || !tagBrut || !contenuBrut) throw new Error('Le jeton Instagram enregistré est invalide.');

  const dechiffreur = crypto.createDecipheriv('aes-256-gcm', cle, Buffer.from(ivBrut, 'base64url'));
  dechiffreur.setAuthTag(Buffer.from(tagBrut, 'base64url'));
  return Buffer.concat([
    dechiffreur.update(Buffer.from(contenuBrut, 'base64url')),
    dechiffreur.final(),
  ]).toString('utf8');
}

export function creerUrlAutorisationInstagram(urlRetour: string, etat: string) {
  const url = new URL(`https://www.facebook.com/${VERSION_API}/dialog/oauth`);
  url.searchParams.set('client_id', process.env.INSTAGRAM_META_APP_ID || '');
  url.searchParams.set('redirect_uri', urlRetour);
  url.searchParams.set('state', etat);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'instagram_basic,pages_show_list,pages_read_engagement');
  return url;
}

export async function connecterCompteInstagram(code: string, urlRetour: string) {
  const appId = process.env.INSTAGRAM_META_APP_ID;
  const secret = process.env.INSTAGRAM_META_APP_SECRET;
  if (!appId || !secret || !instagramMetaEstConfigure()) {
    throw new Error('La connexion Meta n’est pas configurée.');
  }

  const urlJeton = new URL(`https://graph.facebook.com/${VERSION_API}/oauth/access_token`);
  urlJeton.searchParams.set('client_id', appId);
  urlJeton.searchParams.set('client_secret', secret);
  urlJeton.searchParams.set('redirect_uri', urlRetour);
  urlJeton.searchParams.set('code', code);
  const jeton = await demanderMeta<{ access_token: string }>(urlJeton);

  const urlPages = new URL(`https://graph.facebook.com/${VERSION_API}/me/accounts`);
  urlPages.searchParams.set('fields', 'id,name,access_token,instagram_business_account{id,username}');
  urlPages.searchParams.set('access_token', jeton.access_token);
  const pages = await demanderMeta<{ data?: ComptePage[] }>(urlPages);
  const compte = pages.data?.find((page) => page.access_token && page.instagram_business_account?.id);

  if (!compte?.access_token || !compte.instagram_business_account?.id) {
    throw new Error('Aucun compte Instagram professionnel relié à une Page Facebook n’a été trouvé.');
  }

  const identifiant = compte.instagram_business_account.username
    ? `@${compte.instagram_business_account.username.replace(/^@/, '')}`
    : '';
  const profil = compte.instagram_business_account.username
    ? `https://www.instagram.com/${compte.instagram_business_account.username.replace(/^@/, '')}/`
    : '';
  const jetonChiffre = chiffrerJetonInstagram(compte.access_token);

  await prisma.$transaction([
    prisma.configSite.upsert({
      where: { cle: 'instagram_meta_token_chiffre' },
      update: { valeur: jetonChiffre },
      create: { cle: 'instagram_meta_token_chiffre', valeur: jetonChiffre },
    }),
    prisma.configSite.upsert({
      where: { cle: 'instagram_meta_utilisateur_id' },
      update: { valeur: compte.instagram_business_account.id },
      create: { cle: 'instagram_meta_utilisateur_id', valeur: compte.instagram_business_account.id },
    }),
    prisma.configSite.upsert({
      where: { cle: 'instagram_meta_connecte' },
      update: { valeur: 'true' },
      create: { cle: 'instagram_meta_connecte', valeur: 'true' },
    }),
    ...(identifiant ? [prisma.configSite.upsert({
      where: { cle: 'instagram_identifiant' },
      update: { valeur: identifiant },
      create: { cle: 'instagram_identifiant', valeur: identifiant },
    })] : []),
    ...(profil ? [prisma.configSite.upsert({
      where: { cle: 'instagram_profil_url' },
      update: { valeur: profil },
      create: { cle: 'instagram_profil_url', valeur: profil },
    })] : []),
  ]);
}

export async function listerVideosInstagram(): Promise<VideoInstagramAdmin[]> {
  const enregistres = await prisma.configSite.findMany({
    where: { cle: { in: ['instagram_meta_token_chiffre', 'instagram_meta_utilisateur_id'] } },
  });
  const config = Object.fromEntries(enregistres.map((item) => [item.cle, item.valeur]));
  const jetonChiffre = config.instagram_meta_token_chiffre;
  const utilisateurId = config.instagram_meta_utilisateur_id;
  if (!jetonChiffre || !utilisateurId) return [];

  const url = new URL(`https://graph.facebook.com/${VERSION_API}/${utilisateurId}/media`);
  url.searchParams.set('fields', 'id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,timestamp');
  url.searchParams.set('limit', '25');
  url.searchParams.set('access_token', dechiffrerJetonInstagram(jetonChiffre));
  const reponse = await demanderMeta<{ data?: MediaMeta[] }>(url);

  return (reponse.data || [])
    .filter((media) => media.permalink && (media.media_type === 'VIDEO' || media.media_product_type === 'REELS'))
    .map((media) => ({
      id: media.id,
      apercu: media.thumbnail_url || media.media_url || null,
      lien: media.permalink as string,
      mediaUrl: media.media_url || null,
      titre: media.caption?.split('\n')[0].slice(0, 90) || 'Vidéo Instagram',
      date: media.timestamp || null,
    }));
}

export async function deconnecterCompteInstagram() {
  await prisma.configSite.deleteMany({
    where: {
      cle: {
        in: ['instagram_meta_token_chiffre', 'instagram_meta_utilisateur_id'],
      },
    },
  });
  await prisma.configSite.upsert({
    where: { cle: 'instagram_meta_connecte' },
    update: { valeur: 'false' },
    create: { cle: 'instagram_meta_connecte', valeur: 'false' },
  });
}
