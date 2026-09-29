'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import StoryTab from '../../components/StoryTab';

function StoryPageContent() {
  const { appState, handleUpdateState, navigate, activeStoryId, setActiveStoryId } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const idParam = searchParams.get('id');
  const chapterParam = searchParams.get('chapter');
  const modeParam = searchParams.get('mode');

  const handleParamsChange = ({ id, chapter, mode }) => {
    const params = new URLSearchParams();
    if (id) params.set('id', id);
    if (chapter && chapter > 1) params.set('chapter', chapter);
    if (mode && mode !== 'natural') params.set('mode', mode);

    const query = params.toString();
    router.replace(query ? `/story?${query}` : '/story', { scroll: false });
  };

  return (
    <StoryTab 
      appState={appState} 
      userState={appState}
      onUpdateState={handleUpdateState} 
      activeStoryId={activeStoryId}
      onSelectStory={(id) => setActiveStoryId(id)}
      onNavigate={navigate}
      initialStoryId={idParam}
      initialChapter={chapterParam}
      initialMode={modeParam}
      onParamsChange={handleParamsChange}
      onRecordActivity={(isCorrect, isTyping) => {
        if (isCorrect) {
          const currentXp = appState.xp || 0;
          handleUpdateState({ ...appState, xp: currentXp + (isTyping ? 30 : 10) });
        }
      }}
    />
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando historia...</p></div>}>
      <StoryPageContent />
    </Suspense>
  );
}
