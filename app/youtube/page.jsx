'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import YouTubeImmersionTab from '../../components/YouTubeImmersionTab';

function YouTubePageContent() {
  const { appState, handleUpdateState, authUser, setIsAuthModalOpen } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const viewParam = searchParams.get('view');
  const vParam = searchParams.get('v');
  const catParam = searchParams.get('cat');
  const levelParam = searchParams.get('level');
  const searchParam = searchParams.get('search');
  const topicParam = searchParams.get('topic');

  const handleParamsChange = ({ view, v, category, level, search, topic }) => {
    const params = new URLSearchParams();
    if (view && view !== 'catalog') params.set('view', view);
    if (v) params.set('v', v);
    if (category && category !== 'all') params.set('cat', category);
    if (level && level !== 'all') params.set('level', level);
    if (search && search.trim()) params.set('search', search.trim());
    if (topic) params.set('topic', topic);

    const query = params.toString();
    router.replace(query ? `/youtube?${query}` : '/youtube', { scroll: false });
  };

  return (
    <YouTubeImmersionTab 
      appState={appState} 
      onUpdateState={handleUpdateState} 
      authUser={authUser}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      initialView={viewParam || (vParam ? 'player' : 'catalog')}
      initialVideoId={vParam}
      initialCategory={catParam || 'all'}
      initialLevel={levelParam || 'all'}
      initialSearch={searchParam || ''}
      initialTopic={topicParam}
      onParamsChange={handleParamsChange}
    />
  );
}

export default function YouTubePage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando inmersión en YouTube...</p></div>}>
      <YouTubePageContent />
    </Suspense>
  );
}
