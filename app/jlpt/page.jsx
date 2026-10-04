'use client';

import React, { Suspense } from 'react';
import JlptExamTab from '../../components/JlptExamTab';
import PageLoader from '../../components/PageLoader';

export default function JlptPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando simulacros JLPT..." />}>
      <JlptExamTab />
    </Suspense>
  );
}
