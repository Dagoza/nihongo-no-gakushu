'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import CurriculumTab from '../../components/CurriculumTab';
import PageLoader from '../../components/PageLoader';

function CurriculumPageContent() {
  const { appState, handleUpdateState, navigate } = useApp();
  const searchParams = useSearchParams();

  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam, 10) : null;

  const handleStepChange = (stepNum) => {
    if (typeof window !== 'undefined') {
      const currentUrlStep = new URLSearchParams(window.location.search).get('step');
      const targetStepStr = stepNum ? String(stepNum) : null;
      if (currentUrlStep !== targetStepStr) {
        const url = stepNum ? `/curriculum?step=${stepNum}` : '/curriculum';
        window.history.replaceState(null, '', url);
      }
    }
  };

  return (
    <CurriculumTab 
      appState={appState} 
      userState={appState}
      onUpdateState={handleUpdateState} 
      initialStep={initialStep}
      onStepChange={handleStepChange}
      onNavigate={navigate}
    />
  );
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando temario y módulos..." />}>
      <CurriculumPageContent />
    </Suspense>
  );
}
