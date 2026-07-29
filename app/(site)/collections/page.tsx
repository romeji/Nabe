import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PageCollectionsRedirection({ searchParams: searchParamsPromise }: Props) {
  const searchParams = await searchParamsPromise;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([cle, valeur]) => {
    if (Array.isArray(valeur)) {
      valeur.forEach((item) => params.append(cle, item));
    } else if (valeur) {
      params.set(cle, valeur);
    }
  });

  const suffixe = params.toString() ? `?${params.toString()}` : '';
  redirect(`/nos-bijoux${suffixe}`);
}
