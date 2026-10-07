'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import VocabTab from '../../components/tabs/VocabTab';
import PageLoader from '../../components/layout/PageLoader';

function VocabPageContent() {
  const { appState, handleUpdateState, authUser } = useApp();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get('mode');
  const levelParam = searchParams.get('level');
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const handleParamsChange = ({ mode, level, category, search }) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (mode && mode !== 'cards') params.set('mode', mode);
    if (level && level !== 'all') params.set('level', level);
    if (category && category !== 'all') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());

    const query = params.toString();
    const targetUrl = query ? `/vocab?${query}` : '/vocab';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
  };

  return (
    <VocabTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      authUser={authUser}
      initialMode={modeParam}
      initialLevel={levelParam}
      initialCategory={categoryParam}
      initialSearch={searchParam}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function VocabPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando banco de vocabulario..." />}>
      <VocabPageContent />
    </Suspense>
  );
}
