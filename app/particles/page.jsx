'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLoader from '../../components/PageLoader';

function ParticlesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/grammar?${query}` : '/grammar');
  }, [router, searchParams]);

  return <PageLoader text="Redirigiendo a Gramática..." />;
}

export default function ParticlesPage() {
  return (
    <Suspense fallback={<PageLoader text="Cargando..." />}>
      <ParticlesRedirect />
    </Suspense>
  );
}
