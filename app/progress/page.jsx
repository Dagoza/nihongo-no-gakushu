'use client';

import React, { Suspense } from 'react';
import { useApp } from '../../lib/AppContext';
import ProgressTab from '../../components/ProgressTab';

function ProgressPageContent() {
  const { 
    appState, 
    handleUpdateState, 
    syncStatus, 
    syncInfo, 
    handleTriggerSync, 
    authUser, 
    setIsAuthModalOpen, 
    handleSignOut 
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
    />
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando progreso y estadísticas...</p></div>}>
      <ProgressPageContent />
    </Suspense>
  );
}
