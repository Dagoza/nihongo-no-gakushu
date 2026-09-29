'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ParticlesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/grammar?${query}` : '/grammar');
  }, [router, searchParams]);

  return <div className="section-panel active"><p>Redirigiendo a Gramática...</p></div>;
}

export default function ParticlesPage() {
  return (
    <Suspense fallback={<div className="section-panel active"><p>Cargando...</p></div>}>
      <ParticlesRedirect />
    </Suspense>
  );
}
