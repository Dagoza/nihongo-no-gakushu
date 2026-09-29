'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import GrammarTab from '../../components/GrammarTab';

function GrammarPageContent() {
  const { appState, handleUpdateState } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const particleParam = searchParams.get('particle');
  const searchParam = searchParams.get('search');
  const quizParam = searchParams.get('quiz');

  const handleParamsChange = ({ particle, search, quiz }) => {
    const params = new URLSearchParams();
    if (particle && particle !== 'all') params.set('particle', particle);
    if (search && search.trim()) params.set('search', search.trim());
    if (quiz) params.set('quiz', 'true');

    const query = params.toString();
    router.replace(query ? `/grammar?${query}` : '/grammar', { scroll: false });
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
    <Suspense fallback={<div className="section-panel active"><p>Cargando gramática...</p></div>}>
      <GrammarPageContent />
    </Suspense>
  );
}
