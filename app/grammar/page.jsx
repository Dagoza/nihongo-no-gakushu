'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import GrammarTab from '../../components/GrammarTab';
import PageLoader from '../../components/PageLoader';

function GrammarPageContent() {
  const { appState, handleUpdateState } = useApp();
  const searchParams = useSearchParams();

  const particleParam = searchParams.get('particle');
  const searchParam = searchParams.get('search');
  const quizParam = searchParams.get('quiz');

  const handleParamsChange = ({ particle, search, quiz }) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (particle && particle !== 'all') params.set('particle', particle);
    if (search && search.trim()) params.set('search', search.trim());
    if (quiz) params.set('quiz', 'true');

    const query = params.toString();
    const targetUrl = query ? `/grammar?${query}` : '/grammar';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
  };

  return (
    <GrammarTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      initialParticle={particleParam}
      initialSearch={searchParam}
      initialQuiz={quizParam === 'true' || quizParam === '1'}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function GrammarPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando partículas y gramática..." />}>
      <GrammarPageContent />
    </Suspense>
  );
}
