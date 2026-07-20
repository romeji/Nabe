import { Suspense } from 'react';
import ConnexionContenu from '@/components/site/ConnexionContenu';
import './connexion.css';

export default function PageConnexion() {
  return (
    <Suspense fallback={<div className="page-connexion conteneur" />}>
      <ConnexionContenu />
    </Suspense>
  );
}
