'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TerminologyGuideView from '../../components/features/TerminologyGuideView';
import PageLoader from '../../components/layout/PageLoader';

function TerminologyPageContent() {
  const searchParams = useSearchParams();
  const pillarParam = searchParams.get('pillar') || 'writing';
  const termParam = searchParams.get('term');
  const queryParam = searchParams.get('search') || '';

  return (
    <TerminologyGuideView 
      initialPillar={termParam ? 'glossary' : pillarParam}
      initialTerm={termParam}
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
