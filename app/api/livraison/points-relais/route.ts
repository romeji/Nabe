import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getConfigSite } from '@/lib/config-site';

/**
 * Recherche de points relais Mondial Relay via le Web Service officiel
 * WSI4_PointRelais_Recherche (SOAP 1.2). Documentation :
 * https://storage.mondialrelay.fr/solution-web-service-v514-FR.pdf
 *
 * Endpoint et algorithme de signature conformes à la version V-5.14
 * (janvier 2025) : la clé "Security" est le hash MD5, en MAJUSCULES, de la
 * concaténation stricte de tous les paramètres d'entrée (dans l'ordre exact
 * du document) suivie de la clé privée de l'enseigne.
 *
 * Nécessite d'avoir renseigné, dans Admin > Réglages, les identifiants
 * fournis par Mondial Relay à la signature du contrat professionnel :
 * "Enseigne" (8 caractères) et "Clé privée".
 */

const ENDPOINT = 'https://api.mondialrelay.com/Web_Services.asmx';

function genererSecurity(params: string[], clePrivee: string): string {
  const chaine = params.join('') + clePrivee;
  return crypto.createHash('md5').update(chaine, 'utf8').digest('hex').toUpperCase();
}

function construireEnveloppeSoap(params: Record<string, string>, security: string): string {
  const champs = [
    'Enseigne',
    'Pays',
    'NumPointRelais',
    'Ville',
    'CP',
    'Latitude',
    'Longitude',
    'Taille',
    'Poids',
    'Action',
    'DelaiEnvoi',
    'RayonRecherche',
    'TypeActivite',
    'NombreResultats',
  ];

  const corpsChamps = champs
    .map((cle) => `<${cle} xsi:type="xsd:string">${escaperXml(params[cle] || '')}</${cle}>`)
    .join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="https://www.w3.org/2001/XMLSchema" xmlns:soap12="https://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <WSI4_PointRelais_Recherche xmlns="https://api.mondialrelay.com/">
      ${corpsChamps}
      <Security xsi:type="xsd:string">${security}</Security>
    </WSI4_PointRelais_Recherche>
  </soap12:Body>
</soap12:Envelope>`;
}

function escaperXml(valeur: string): string {
  return valeur.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Extraction minimaliste des champs répétés dans la réponse SOAP, sans dépendance XML externe. */
function extraireTexte(bloc: string, tag: string): string {
  const m = bloc.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

export async function POST(req: NextRequest) {
  try {
    const { codePostal, ville, pays } = (await req.json()) as {
      codePostal?: string;
      ville?: string;
      pays?: string;
    };

    const config = await getConfigSite();
    const enseigne = config.mondial_relay_enseigne;
    const clePrivee = config.mondial_relay_cle_privee;

    if (!enseigne || !clePrivee) {
      return NextResponse.json(
        {
          error:
            "Mondial Relay n'est pas encore configuré : renseignez l'enseigne et la clé privée dans Admin > Réglages > Livraison.",
        },
        { status: 400 }
      );
    }

    if (!codePostal) {
      return NextResponse.json({ error: 'Code postal requis' }, { status: 400 });
    }

    const params: Record<string, string> = {
      Enseigne: enseigne,
      Pays: pays || 'FR',
      NumPointRelais: '',
      Ville: ville || '',
      CP: codePostal,
      Latitude: '',
      Longitude: '',
      Taille: '',
      Poids: '',
      Action: '',
      DelaiEnvoi: '',
      RayonRecherche: '30',
      TypeActivite: '',
      NombreResultats: '10',
    };

    const ordreSecurity = [
      params.Enseigne,
      params.Pays,
      params.NumPointRelais,
      params.Ville,
      params.CP,
      params.Latitude,
      params.Longitude,
      params.Taille,
      params.Poids,
      params.Action,
      params.DelaiEnvoi,
      params.RayonRecherche,
      params.TypeActivite,
      params.NombreResultats,
    ];
    const security = genererSecurity(ordreSecurity, clePrivee);
    const enveloppe = construireEnveloppeSoap(params, security);

    const reponse = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
      },
      body: enveloppe,
    });

    const texte = await reponse.text();

    const stat = extraireTexte(texte, 'STAT');
    if (stat !== '0') {
      return NextResponse.json(
        { error: `Mondial Relay a renvoyé une erreur (code ${stat || 'inconnu'}).`, statBrut: stat },
        { status: 502 }
      );
    }

    const blocsPointRelais = texte.match(/<PointRelais_Type>[\s\S]*?<\/PointRelais_Type>/gi) || [];
    const points = blocsPointRelais.map((bloc) => ({
      numero: extraireTexte(bloc, 'Num'),
      nom: extraireTexte(bloc, 'LgAdr1'),
      adresse: [extraireTexte(bloc, 'LgAdr3'), extraireTexte(bloc, 'LgAdr4')].filter(Boolean).join(', '),
      codePostal: extraireTexte(bloc, 'CP'),
      ville: extraireTexte(bloc, 'Ville'),
      distanceMetres: Number(extraireTexte(bloc, 'Distance')) || null,
      urlPlan: extraireTexte(bloc, 'URL_Plan'),
    }));

    return NextResponse.json({ points });
  } catch (error: any) {
    console.error('Erreur recherche points relais Mondial Relay:', error);
    return NextResponse.json(
      { error: "Impossible de contacter Mondial Relay pour le moment. Réessayez dans un instant." },
      { status: 502 }
    );
  }
}
