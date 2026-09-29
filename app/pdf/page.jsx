'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MaterialLibraryTab from '../../components/MaterialLibraryTab';

function PdfPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const catParam = searchParams.get('cat');
  const searchParam = searchParams.get('search');
  const docParam = searchParams.get('doc');

  const handleParamsChange = ({ category, search, doc }) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('cat', category);
    if (search && search.trim()) params.set('search', search.trim());
    if (doc) params.set('doc', doc);

    const query = params.toString();
    router.replace(query ? `/pdf?${query}` : '/pdf', { scroll: false });
  };

  return (
    <MaterialLibraryTab 
      initialCategory={catParam || 'all'}
      initialSearch={searchParam || ''}
      initialDoc={docParam}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function PdfPage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando biblioteca de materiales...</p></div>}>
      <PdfPageContent />
    </Suspense>
  );
}
