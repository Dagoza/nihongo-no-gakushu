'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import ConversationTab from '../../components/ConversationTab';

function NhkPageContent() {
  const { appState, handleUpdateState } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonParam = searchParams.get('lesson');
  const tabParam = searchParams.get('tab'); // 'dialogue' | 'practice'
  const statusParam = searchParams.get('status'); // 'all' | 'completed' | 'pending'
  const typeParam = searchParams.get('type'); // 'all' | 'reply' | 'missing_word' | 'missing_kanji'

  const handleParamsChange = ({ lesson, tab, status, type }) => {
    const params = new URLSearchParams();
    if (lesson && lesson !== 1) params.set('lesson', lesson);
    if (tab && tab !== 'dialogue') params.set('tab', tab);
    if (status && status !== 'all') params.set('status', status);
    if (type && type !== 'all') params.set('type', type);

    const query = params.toString();
    router.replace(query ? `/nhk?${query}` : '/nhk', { scroll: false });
  };

  return (
    <ConversationTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      initialLesson={lessonParam}
      initialTab={tabParam || 'dialogue'}
      initialStatus={statusParam || 'all'}
      initialType={typeParam || 'all'}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function NhkPage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando lecciones NHK...</p></div>}>
      <NhkPageContent />
    </Suspense>
  );
}
