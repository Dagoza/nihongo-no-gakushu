'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import CurriculumTab from '../../components/CurriculumTab';

function CurriculumPageContent() {
  const { appState, handleUpdateState, navigate } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam, 10) : null;

  const handleStepChange = (stepNum) => {
    if (stepNum) {
      router.replace(`/curriculum?step=${stepNum}`, { scroll: false });
    } else {
      router.replace('/curriculum', { scroll: false });
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
    <Suspense fallback={<div className="section-panel active"><p>Cargando temario...</p></div>}>
      <CurriculumPageContent />
    </Suspense>
  );
}
