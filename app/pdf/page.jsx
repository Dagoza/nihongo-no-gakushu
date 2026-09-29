'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MaterialLibraryTab from '../../components/MaterialLibraryTab';
import PageLoader from '../../components/PageLoader';

function PdfPageContent() {
  const searchParams = useSearchParams();

  const catParam = searchParams.get('cat');
  const searchParam = searchParams.get('search');
  const docParam = searchParams.get('doc');

  const handleParamsChange = ({ category, search, doc }) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('cat', category);
    if (search && search.trim()) params.set('search', search.trim());
    if (doc) params.set('doc', doc);

    const query = params.toString();
    const targetUrl = query ? `/pdf?${query}` : '/pdf';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
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
    <Suspense fallback={<PageLoader text="Cargando biblioteca de materiales y PDFs..." />}>
      <PdfPageContent />
    </Suspense>
  );
}
