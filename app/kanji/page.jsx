'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import KanjiTab from '../../components/KanjiTab';

function KanjiPageContent() {
  const { appState, handleUpdateState } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParam = searchParams.get('search');
  const modeParam = searchParams.get('mode'); // 'list' | 'quiz' | 'srs'
  const drawParam = searchParams.get('draw');

  const handleParamsChange = ({ search, mode, draw }) => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.set('search', search.trim());
    if (mode && mode !== 'list') params.set('mode', mode);
    if (draw) params.set('draw', draw);

    const query = params.toString();
    router.replace(query ? `/kanji?${query}` : '/kanji', { scroll: false });
  };

  return (
    <KanjiTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      initialSearch={searchParam || ''}
      initialMode={modeParam || 'list'}
      initialDraw={drawParam || null}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function KanjiPage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando Kanjis...</p></div>}>
      <KanjiPageContent />
    </Suspense>
  );
}
