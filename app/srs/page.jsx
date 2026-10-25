'use client';

import React, { Suspense } from 'react';
import { useApp } from '../../lib/AppContext';
import SrsTab from '../../components/tabs/SrsTab';
import PageLoader from '../../components/layout/PageLoader';

function SrsPageContent() {
  const { navigate } = useApp();

  return (
    <SrsTab onNavigate={navigate} />
  );
}

export default function SrsPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando Centro de Preguntas y Repaso SRS..." />}>
      <SrsPageContent />
    </Suspense>
  );
}
