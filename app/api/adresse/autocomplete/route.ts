import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy vers le service de géocodage de la Géoplateforme (IGN), qui a
 * remplacé l'ancienne API Adresse (api-adresse.data.gouv.fr, décommissionnée
 * fin janvier 2026). Gratuit, sans clé, limité à 50 requêtes/seconde/IP —
 * largement suffisant pour de l'autocomplétion d'adresse au checkout.
 * Doc : https://geoservices.ign.fr/documentation/services/services-geoplateforme/service-geoplateforme-de-recherche
 *
 * On passe par notre propre route (plutôt qu'un appel direct depuis le
 * navigateur) pour ne pas dépendre du CORS de ce service tiers et pouvoir
 * changer de fournisseur plus tard sans toucher au front.
 */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const url = `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&limit=5&autocomplete=1&index=address`;
    const reponse = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!reponse.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await reponse.json();

    const suggestions = (data.features || []).map((f: any) => ({
      label: f.properties.label,
      adresse: [f.properties.housenumber, f.properties.street || f.properties.name].filter(Boolean).join(' '),
      codePostal: f.properties.postcode,
      ville: f.properties.city,
      citycode: f.properties.citycode,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Erreur autocomplétion adresse:', error);
    // On échoue silencieusement : le client garde la saisie manuelle classique.
    return NextResponse.json({ suggestions: [] });
  }
}
