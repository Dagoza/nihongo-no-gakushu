'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TerminologyGuideView from '../../components/features/TerminologyGuideView';
import PageLoader from '../../components/layout/PageLoader';

function TerminologyPageContent() {
  const searchParams = useSearchParams();
  const pillarParam = searchParams.get('pillar') || 'writing';
  const termParam = searchParams.get('term');
  const kotowazaParam = searchParams.get('kotowaza') || searchParams.get('id');
  const queryParam = searchParams.get('search') || '';

  const resolvedPillar = kotowazaParam 
    ? 'kotowaza' 
    : (termParam ? 'glossary' : pillarParam);

  return (
    <TerminologyGuideView 
      initialPillar={resolvedPillar}
      initialTerm={termParam}
      initialKotowazaId={kotowazaParam}
      initialSearch={queryParam}
    />
  );
}

export default function TerminologyPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando Guía de Terminología y Pilares del Japonés..." />}>
      <TerminologyPageContent />
    </Suspense>
  );
}
