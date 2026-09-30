'use client';

import React, { Suspense } from 'react';
import { useApp } from '../../lib/AppContext';
import ProgressTab from '../../components/ProgressTab';
import PageLoader from '../../components/PageLoader';

function ProgressPageContent() {
  const { 
    appState, 
    handleUpdateState, 
    syncStatus, 
    syncInfo, 
    handleTriggerSync, 
    authUser, 
    setIsAuthModalOpen, 
    handleSignOut,
    openTour 
  } = useApp();

  return (
    <ProgressTab 
      appState={appState} 
      onUpdateState={handleUpdateState}
      syncStatus={syncStatus}
      syncInfo={syncInfo}
      onTriggerSync={handleTriggerSync}
      authUser={authUser}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      onSignOut={handleSignOut}
      onOpenTour={openTour}
    />
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando progreso y estadísticas..." />}>
      <ProgressPageContent />
    </Suspense>
  );
}
