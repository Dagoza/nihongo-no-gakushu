'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import ConversationTab from '../../components/ConversationTab';
import PageLoader from '../../components/PageLoader';

function NhkPageContent() {
  const { appState, handleUpdateState, authUser } = useApp();
  const searchParams = useSearchParams();

  const lessonParam = searchParams.get('lesson');
  const dialogueParam = searchParams.get('dialogue');
  const tabParam = searchParams.get('tab'); // 'dialogue' | 'practice'
  const statusParam = searchParams.get('status'); // 'all' | 'completed' | 'pending'
  const typeParam = searchParams.get('type'); // 'all' | 'reply' | 'missing_word' | 'missing_kanji'

  const handleParamsChange = ({ lesson, dialogue, tab, status, type }) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (dialogue) {
      params.set('dialogue', dialogue);
    } else if (lesson && lesson !== 1) {
      params.set('lesson', lesson);
    }
    if (tab && tab !== 'dialogue') params.set('tab', tab);
    if (status && status !== 'all') params.set('status', status);
    if (type && type !== 'all') params.set('type', type);

    const query = params.toString();
    const targetUrl = query ? `/nhk?${query}` : '/nhk';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
  };

  return (
    <ConversationTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      authUser={authUser}
      initialLesson={lessonParam}
      initialDialogue={dialogueParam}
      initialTab={tabParam || 'dialogue'}
      initialStatus={statusParam || 'all'}
      initialType={typeParam || 'all'}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function NhkPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando diálogos y lecciones NHK..." />}>
      <NhkPageContent />
    </Suspense>
  );
}
