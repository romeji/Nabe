import { Suspense } from 'react';
import SuccesContenu from './SuccesContenu';

export default function PageSucces() {
  return (
    <Suspense fallback={<div className="page-succes conteneur" />}>
      <SuccesContenu />
    </Suspense>
  );
}
