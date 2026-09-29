'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import SavedTab from '../../components/SavedTab';

function SavedPageContent() {
  const { appState, handleUpdateState, navigate, authUser, setIsAuthModalOpen } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const viewParam = searchParams.get('view');
  const searchParam = searchParams.get('search');
  const levelParam = searchParams.get('level');
  const catParam = searchParams.get('cat');

  const handleParamsChange = ({ view, search, level, category }) => {
    const params = new URLSearchParams();
    if (view && view !== 'all') params.set('view', view);
    if (search && search.trim()) params.set('search', search.trim());
    if (level && level !== 'all') params.set('level', level);
    if (category && category !== 'all') params.set('cat', category);

    const query = params.toString();
    router.replace(query ? `/saved?${query}` : '/saved', { scroll: false });
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
    <Suspense fallback={<div className="section-panel active"><p>Cargando elementos guardados...</p></div>}>
      <SavedPageContent />
    </Suspense>
  );
}
