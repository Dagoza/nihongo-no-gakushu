'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import YouTubeImmersionTab from '../../components/tabs/YouTubeImmersionTab';
import PageLoader from '../../components/layout/PageLoader';

function YouTubePageContent() {
  const { appState, handleUpdateState, authUser, setIsAuthModalOpen } = useApp();
  const searchParams = useSearchParams();

  const viewParam = searchParams.get('view');
  const vParam = searchParams.get('v');
  const catParam = searchParams.get('cat');
  const levelParam = searchParams.get('level');
  const searchParam = searchParams.get('search');
  const topicParam = searchParams.get('topic');

  const handleParamsChange = ({ view, v, category, level, search, topic }) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (view && view !== 'catalog') params.set('view', view);
    if (v) params.set('v', v);
    if (category && category !== 'all') params.set('cat', category);
    if (level && level !== 'all') params.set('level', level);
    if (search && search.trim()) params.set('search', search.trim());
    if (topic) params.set('topic', topic);

    const query = params.toString();
    const targetUrl = query ? `/youtube?${query}` : '/youtube';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
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
    <Suspense fallback={<PageLoader text="Cargando inmersión en YouTube..." />}>
      <YouTubePageContent />
    </Suspense>
  );
}
