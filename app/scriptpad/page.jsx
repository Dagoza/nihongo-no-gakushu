'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import ScriptpadTab from '../../components/tabs/ScriptpadTab';
import PageLoader from '../../components/layout/PageLoader';

function ScriptpadPageContent() {
  const { appState, handleUpdateState } = useApp();
  const searchParams = useSearchParams();

  const unitParam = searchParams.get('unit');
  const lessonParam = searchParams.get('lesson');
  const modeParam = searchParams.get('mode');

  return (
    <ScriptpadTab
      appState={appState}
      onUpdateState={handleUpdateState}
      initialUnitId={unitParam}
      initialLessonId={lessonParam}
      initialMode={modeParam}
    />
  );
}

export default function ScriptpadPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando Scriptpad y Unidades..." />}>
      <ScriptpadPageContent />
    </Suspense>
  );
}
