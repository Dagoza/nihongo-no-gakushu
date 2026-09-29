'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import VocabTab from '../../components/VocabTab';

function VocabPageContent() {
  const { appState, handleUpdateState, authUser } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get('mode');
  const levelParam = searchParams.get('level');
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const handleParamsChange = ({ mode, level, category, search }) => {
    const params = new URLSearchParams();
    if (mode && mode !== 'cards') params.set('mode', mode);
    if (level && level !== 'all') params.set('level', level);
    if (category && category !== 'all') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());

    const query = params.toString();
    router.replace(query ? `/vocab?${query}` : '/vocab', { scroll: false });
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
    <Suspense fallback={<div className="section-panel active"><p>Cargando vocabulario...</p></div>}>
      <VocabPageContent />
    </Suspense>
  );
}
