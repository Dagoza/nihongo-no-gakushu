'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import SavedTab from '../../components/SavedTab';
import PageLoader from '../../components/PageLoader';

function SavedPageContent() {
  const { appState, handleUpdateState, navigate, authUser, setIsAuthModalOpen } = useApp();
  const searchParams = useSearchParams();

  const viewParam = searchParams.get('view');
  const searchParam = searchParams.get('search');
  const levelParam = searchParams.get('level');
  const catParam = searchParams.get('cat');

  const handleParamsChange = ({ view, search, level, category }) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (view && view !== 'all') params.set('view', view);
    if (search && search.trim()) params.set('search', search.trim());
    if (level && level !== 'all') params.set('level', level);
    if (category && category !== 'all') params.set('cat', category);

    const query = params.toString();
    const targetUrl = query ? `/saved?${query}` : '/saved';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
  };

  return (
    <SavedTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      onNavigate={navigate}
      authUser={authUser}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      initialView={viewParam || 'all'}
      initialSearch={searchParam || ''}
      initialLevel={levelParam || 'all'}
      initialCategory={catParam || 'all'}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function SavedPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando elementos guardados..." />}>
      <SavedPageContent />
    </Suspense>
  );
}
